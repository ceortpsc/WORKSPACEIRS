# WORKSPACEIRS External Evidence Index

## Determination

The supplied file corpus contains valid evidence for selected controls, but it does not establish that every WORKSPACEIRS production gate has passed. Evidence is accepted only when it is attributable to the WORKSPACEIRS release, correct AWS account and region, current environment, and specific gate under evaluation.

## Accepted evidence

### AWS account authentication

- Account: `238395401086`
- Principal evidence: `arn:aws:iam::238395401086:user/condrer`
- Classification: authenticated account evidence
- Gate impact: supports AWS identity and operator provenance only

### AWS AppFabric

- App bundle: `arn:aws:appfabric:us-east-1:238395401086:appbundle/49017c86-3829-4c66-91e9-3cb6ae3dc579`
- App authorization evidence exists for Microsoft 365.
- Gate impact: supports AppFabric resource existence and authorization evidence; does not prove complete WORKSPACEIRS runtime deployment.

### GitHub application validation

- Web CI run `30458235076`: PASS
- Enterprise Quality Gates run `30458235629`: PASS
- Commit: `8712234f93ba7f5f75757e3fe98071d4f7396eef`
- Gate impact: supports current source build, route smoke, protected-route denial, and enterprise quality checks.

## Evidence not attributable to WORKSPACEIRS production

The corpus includes AWS resources for other applications or accounts. These records are retained as historical evidence but are not accepted for WORKSPACEIRS production gates.

Examples include:

- `the-appliance-clinic-production` resources, including records in `DELETE_COMPLETE` state.
- Ross tax Lambda resources in AWS account `065285884674`, which does not match the declared WORKSPACEIRS account `238395401086`.
- CloudFormation templates or playbooks that describe intended resources without successful deployment outputs.
- Conceptual blueprints explicitly marked as having no live IRS connection.

## IRS MeF and provider gate

The supplied records explicitly describe the MeF adapter as `DISABLED`, `ATS`, or `PRODUCTION` capable and list required evidence:

- IRS e-file application
- Software Developer provider role
- applicable tax types
- ETIN
- ATS approval for supported forms and processing year
- current WSDL and schema artifacts
- client certificate
- approved production endpoint configuration
- operational contacts
- annual processing-year update evidence

A supplied executed notebook records an ATS submission intent with status `BLOCKED`. Therefore, the IRS MeF production gate remains blocked until current, release-specific artifacts for each item above are indexed.

## Evidence acceptance rules

A gate may be changed to `PASS` only when the evidence includes:

1. Exact gate name and environment.
2. Resource identifier, test run, signed artifact, API response, or deployment output.
3. Correct repository, release commit, AWS account, region, and application identity.
4. Current status—not deleted, expired, test-only, conceptual, or pending.
5. Evidence date and responsible actor.
6. No contradiction from a newer or more authoritative record.

Environment flags, UI badges, templates, plans, screenshots without source context, and resources from unrelated projects do not independently satisfy a gate.
