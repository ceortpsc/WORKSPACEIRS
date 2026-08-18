#!/usr/bin/env bash
set -Eeuo pipefail

export AWS_PAGER=""
AWS_REGION="${AWS_REGION:-us-east-1}"
DOMAIN_NAME="${DOMAIN_NAME:-rosstaxprofessionals.com}"
STACK_NAME="${STACK_NAME:-workspaceirs-production-domain}"
TEMPLATE_FILE="${TEMPLATE_FILE:-infrastructure/cloudformation/domain-certificate-bindings.yaml}"
EXPECTED_ACCOUNT="${EXPECTED_ACCOUNT:-238395401086}"

log(){ printf '\n[%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"; }
fatal(){ printf '\n[BLOCKED] %s\n' "$*" >&2; exit 1; }
require(){ command -v "$1" >/dev/null 2>&1 || fatal "Missing command: $1"; }

for cmd in aws jq curl; do require "$cmd"; done

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
[[ "$ACCOUNT_ID" == "$EXPECTED_ACCOUNT" ]] || fatal "Authenticated AWS account $ACCOUNT_ID does not match $EXPECTED_ACCOUNT."

[[ -f "$TEMPLATE_FILE" ]] || fatal "Template not found: $TEMPLATE_FILE"

HOSTED_ZONE_ID="${HOSTED_ZONE_ID:-$(aws route53 list-hosted-zones-by-name \
  --dns-name "$DOMAIN_NAME" \
  --query "HostedZones[?Name=='${DOMAIN_NAME}.']|[0].Id" \
  --output text | sed 's|/hostedzone/||')}"

[[ -n "$HOSTED_ZONE_ID" && "$HOSTED_ZONE_ID" != "None" ]] || fatal "No Route 53 hosted zone found for $DOMAIN_NAME."

WEB_DISTRIBUTION_DOMAIN="${WEB_DISTRIBUTION_DOMAIN:-}"
if [[ -z "$WEB_DISTRIBUTION_DOMAIN" ]]; then
  WEB_DISTRIBUTION_DOMAIN="$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Enabled==\`true\`]|[0].DomainName" \
    --output text)"
fi

[[ -n "$WEB_DISTRIBUTION_DOMAIN" && "$WEB_DISTRIBUTION_DOMAIN" != "None" ]] || fatal "Set WEB_DISTRIBUTION_DOMAIN to the production CloudFront distribution domain."

API_REGIONAL_DOMAIN="${API_REGIONAL_DOMAIN:-}"
API_REGIONAL_ZONE_ID="${API_REGIONAL_ZONE_ID:-}"

log "Validating CloudFormation template"
aws cloudformation validate-template \
  --template-body "file://${TEMPLATE_FILE}" \
  --region "$AWS_REGION" >/dev/null

PARAMETERS=(
  "DomainName=$DOMAIN_NAME"
  "HostedZoneId=$HOSTED_ZONE_ID"
  "WebDistributionDomainName=$WEB_DISTRIBUTION_DOMAIN"
)

if [[ -n "$API_REGIONAL_DOMAIN" && -n "$API_REGIONAL_ZONE_ID" ]]; then
  PARAMETERS+=("ApiRegionalDomainName=$API_REGIONAL_DOMAIN")
  PARAMETERS+=("ApiRegionalHostedZoneId=$API_REGIONAL_ZONE_ID")
fi

log "Deploying certificate and DNS stack"
aws cloudformation deploy \
  --template-file "$TEMPLATE_FILE" \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --parameter-overrides "${PARAMETERS[@]}" \
  --tags \
    Application=WORKSPACEIRS \
    Organization=RossTaxProSoftwareCo \
    Environment=production \
    ManagedBy=CloudFormation \
    DataClassification=internal \
    ComplianceScope=tax-operations \
  --no-fail-on-empty-changeset

CERTIFICATE_ARN="$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='CertificateArn'].OutputValue" \
  --output text)"

[[ -n "$CERTIFICATE_ARN" ]] || fatal "Certificate ARN was not returned by the stack."

log "Waiting for ACM certificate validation"
aws acm wait certificate-validated \
  --certificate-arn "$CERTIFICATE_ARN" \
  --region "$AWS_REGION"

STATUS="$(aws acm describe-certificate \
  --certificate-arn "$CERTIFICATE_ARN" \
  --region "$AWS_REGION" \
  --query 'Certificate.Status' \
  --output text)"

[[ "$STATUS" == "ISSUED" ]] || fatal "Certificate status is $STATUS, expected ISSUED."

log "Verifying DNS records"
for host in \
  "$DOMAIN_NAME" \
  "www.$DOMAIN_NAME" \
  "portal.$DOMAIN_NAME" \
  "clients.$DOMAIN_NAME" \
  "ero.$DOMAIN_NAME" \
  "practitioners.$DOMAIN_NAME" \
  "admin.$DOMAIN_NAME" \
  "staff.$DOMAIN_NAME" \
  "academy.$DOMAIN_NAME" \
  "masterfile.$DOMAIN_NAME" \
  "refunds.$DOMAIN_NAME" \
  "notices.$DOMAIN_NAME" \
  "audit.$DOMAIN_NAME" \
  "reports.$DOMAIN_NAME" \
  "support.$DOMAIN_NAME" \
  "docs.$DOMAIN_NAME" \
  "developer.$DOMAIN_NAME" \
  "status.$DOMAIN_NAME"
do
  aws route53 test-dns-answer \
    --hosted-zone-id "$HOSTED_ZONE_ID" \
    --record-name "$host" \
    --record-type A \
    --query '{Name:Nameserver,Values:RecordData}' \
    --output json >/dev/null
  log "DNS present: $host"
done

cat <<EOF

============================================================
WORKSPACEIRS DOMAIN BINDING RECEIPT
============================================================
AWS account:       $ACCOUNT_ID
Region:            $AWS_REGION
Domain:            $DOMAIN_NAME
Hosted zone:       $HOSTED_ZONE_ID
Certificate ARN:   $CERTIFICATE_ARN
Certificate state: $STATUS
Web target:        $WEB_DISTRIBUTION_DOMAIN
Stack:             $STACK_NAME
============================================================
EOF
