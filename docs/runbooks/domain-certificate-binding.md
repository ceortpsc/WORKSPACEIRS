# WORKSPACEIRS Domain Certificate and Binding Runbook

## Scope

This runbook requests and validates an ACM certificate for:

- `rosstaxprofessionals.com`
- `*.rosstaxprofessionals.com`

It creates Route 53 aliases for the public site, client portal, ERO portal, practitioner portal, administration, staff, academy, masterfile, refund, notice, audit, reporting, support, documentation, developer, and status surfaces.

## Safety boundary

Do not select the first CloudFront distribution returned by the AWS account. Supply the exact WORKSPACEIRS production distribution ID. Updating a CloudFront distribution replaces its complete configuration document and requires its current ETag.

## Prerequisites

- Authenticated AWS account `238395401086`
- Region `us-east-1` for the CloudFront certificate
- Existing Route 53 hosted zone for `rosstaxprofessionals.com`
- Existing WORKSPACEIRS production CloudFront distribution
- Repository checked out at the approved release commit

## 1. Identify the hosted zone

```bash
export AWS_PAGER=""
export AWS_REGION="us-east-1"
export DOMAIN_NAME="rosstaxprofessionals.com"

aws sts get-caller-identity

export HOSTED_ZONE_ID="$(aws route53 list-hosted-zones-by-name \
  --dns-name "$DOMAIN_NAME" \
  --query "HostedZones[?Name=='${DOMAIN_NAME}.']|[0].Id" \
  --output text | sed 's|/hostedzone/||')"

printf 'Hosted zone: %s\n' "$HOSTED_ZONE_ID"
```

## 2. Identify the exact distribution

```bash
aws cloudfront list-distributions \
  --query 'DistributionList.Items[].{Id:Id,Domain:DomainName,Aliases:Aliases.Items,Origins:Origins.Items[].DomainName,Enabled:Enabled}' \
  --output table
```

Set the exact approved distribution:

```bash
export DISTRIBUTION_ID="REPLACE_WITH_WORKSPACEIRS_DISTRIBUTION_ID"
export WEB_DISTRIBUTION_DOMAIN="$(aws cloudfront get-distribution \
  --id "$DISTRIBUTION_ID" \
  --query 'Distribution.DomainName' \
  --output text)"
```

## 3. Deploy ACM and Route 53

```bash
aws cloudformation validate-template \
  --template-body file://infrastructure/cloudformation/domain-certificate-bindings.yaml \
  --region us-east-1

aws cloudformation deploy \
  --template-file infrastructure/cloudformation/domain-certificate-bindings.yaml \
  --stack-name workspaceirs-production-domain \
  --region us-east-1 \
  --parameter-overrides \
    DomainName="$DOMAIN_NAME" \
    HostedZoneId="$HOSTED_ZONE_ID" \
    WebDistributionDomainName="$WEB_DISTRIBUTION_DOMAIN" \
  --tags \
    Application=WORKSPACEIRS \
    Organization=RossTaxProSoftwareCo \
    Environment=production \
    ManagedBy=CloudFormation \
    DataClassification=internal \
    ComplianceScope=tax-operations \
  --no-fail-on-empty-changeset
```

Get the certificate ARN and wait for issuance:

```bash
export CERTIFICATE_ARN="$(aws cloudformation describe-stacks \
  --stack-name workspaceirs-production-domain \
  --region us-east-1 \
  --query "Stacks[0].Outputs[?OutputKey=='CertificateArn'].OutputValue" \
  --output text)"

aws acm wait certificate-validated \
  --certificate-arn "$CERTIFICATE_ARN" \
  --region us-east-1

aws acm describe-certificate \
  --certificate-arn "$CERTIFICATE_ARN" \
  --region us-east-1 \
  --query 'Certificate.{Status:Status,Domain:DomainName,SANs:SubjectAlternativeNames,NotAfter:NotAfter}'
```

The required certificate status is `ISSUED`.

## 4. Bind aliases and certificate to CloudFront

Create the approved alias list:

```bash
ALIASES=(
  "$DOMAIN_NAME"
  "www.$DOMAIN_NAME"
  "app.$DOMAIN_NAME"
  "portal.$DOMAIN_NAME"
  "clients.$DOMAIN_NAME"
  "ero.$DOMAIN_NAME"
  "practitioners.$DOMAIN_NAME"
  "admin.$DOMAIN_NAME"
  "staff.$DOMAIN_NAME"
  "academy.$DOMAIN_NAME"
  "masterfile.$DOMAIN_NAME"
  "refunds.$DOMAIN_NAME"
  "notices.$DOMAIN_NAME"
  "audit.$DOMAIN_NAME"
  "reports.$DOMAIN_NAME"
  "support.$DOMAIN_NAME"
  "docs.$DOMAIN_NAME"
  "developer.$DOMAIN_NAME"
  "status.$DOMAIN_NAME"
)
```

Fetch and preserve the current distribution configuration:

```bash
mkdir -p artifacts/production-evidence/domain-binding
aws cloudfront get-distribution-config \
  --id "$DISTRIBUTION_ID" \
  > artifacts/production-evidence/domain-binding/distribution-before.json

export ETAG="$(jq -r '.ETag' artifacts/production-evidence/domain-binding/distribution-before.json)"
printf '%s\n' "${ALIASES[@]}" | jq -R . | jq -s '{Quantity:length,Items:.}' \
  > /tmp/workspaceirs-aliases.json
```

Generate the replacement configuration without deleting origins, behaviors, logging, WAF, or cache policies:

```bash
jq \
  --arg cert "$CERTIFICATE_ARN" \
  --slurpfile aliases /tmp/workspaceirs-aliases.json \
  '.DistributionConfig
   | .Aliases = $aliases[0]
   | .ViewerCertificate = {
       ACMCertificateArn: $cert,
       SSLSupportMethod: "sni-only",
       MinimumProtocolVersion: "TLSv1.2_2021",
       CertificateSource: "acm"
     }' \
  artifacts/production-evidence/domain-binding/distribution-before.json \
  > artifacts/production-evidence/domain-binding/distribution-update.json
```

Review the generated file before applying:

```bash
jq '{Aliases,ViewerCertificate,Origins,DefaultCacheBehavior,CacheBehaviors,WebACLId,Logging}' \
  artifacts/production-evidence/domain-binding/distribution-update.json
```

Apply only after confirming the correct distribution:

```bash
aws cloudfront update-distribution \
  --id "$DISTRIBUTION_ID" \
  --if-match "$ETAG" \
  --distribution-config file://artifacts/production-evidence/domain-binding/distribution-update.json \
  > artifacts/production-evidence/domain-binding/update-response.json

aws cloudfront wait distribution-deployed --id "$DISTRIBUTION_ID"
```

## 5. Verification

```bash
for host in "${ALIASES[@]}"; do
  aws route53 test-dns-answer \
    --hosted-zone-id "$HOSTED_ZONE_ID" \
    --record-name "$host" \
    --record-type A \
    --output json

done

for host in \
  "$DOMAIN_NAME" \
  "portal.$DOMAIN_NAME" \
  "clients.$DOMAIN_NAME" \
  "ero.$DOMAIN_NAME" \
  "practitioners.$DOMAIN_NAME"
do
  curl --fail --silent --show-error --head "https://$host"
done
```

Inspect the live distribution:

```bash
aws cloudfront get-distribution \
  --id "$DISTRIBUTION_ID" \
  --query 'Distribution.{Status:Status,Domain:DomainName,Aliases:DistributionConfig.Aliases.Items,Certificate:DistributionConfig.ViewerCertificate.ACMCertificateArn}' \
  > artifacts/production-evidence/domain-binding/distribution-after.json
```

## 6. Evidence receipt

The gate may move from `BLOCKED` only when these artifacts exist:

- CloudFormation stack ID and outputs
- ACM certificate ARN with status `ISSUED`
- Hosted-zone ID for `rosstaxprofessionals.com`
- CloudFront distribution ID
- CloudFront status `Deployed`
- Alias list containing every approved hostname
- HTTPS checks returning successful responses
- Before/update/after distribution configuration files

Do not mark IRS MeF, database, identity, MFA, backup, rollback, or provider gates PASS based solely on domain and TLS evidence.
