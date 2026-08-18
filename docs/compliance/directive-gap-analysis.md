# WORKSPACEIRS Directive Compliance Audit

**Audit basis:** MASTER AUTONOMOUS APPLICATION ENGINEERING, DEPLOYMENT, AND GOVERNANCE DIRECTIVE  
**Repository:** `ceortpsc/WORKSPACEIRS`  
**Status vocabulary:** PASS, PASS WITH CONDITIONS, BLOCKED, FAILED, NOT EXECUTED

## Executive determination

**Overall status: BLOCKED**

The application contains substantial Next.js route, workflow, certification, refund-reconciliation, registration, credential-governance, and security-boundary implementation. It is not eligible for a production-ready designation because required persistent data services, complete infrastructure-as-code evidence, authentication/MFA integration evidence, XML/XSD contracts, complete API/event contracts, accessibility/performance/security reports, backup/restore evidence, rollback evidence, and external IRS/provider authorization evidence are not yet present.

## Identity conflict resolution

The supplied directive names CoSignConnect, while this repository is WORKSPACEIRS / Ross Tax Pro Software Co. The existing repository identity controls. CoSignConnect identifiers must not be injected into this tax-operations codebase. A centralized `config/application.manifest.yaml` now governs project identity.

## Implemented controls

| Control | Status | Evidence |
|---|---|---|
| Next.js App Router application | PASS | `apps/web/app` |
| Strict TypeScript and production build workflow | PASS WITH CONDITIONS | GitHub Actions Web CI; latest head must pass |
| Multi-page certification dashboards | PASS | `/certification/*` |
| Fail-closed readiness behavior | PASS | `/api/ready` and evidence registry |
| Request correlation IDs | PASS | API helper and response contracts |
| Trusted identity assertion boundary | PASS WITH CONDITIONS | Implemented; production IdP evidence absent |
| Tenant-scope validation | PASS WITH CONDITIONS | Implemented in protected APIs; full IDOR suite absent |
| RefundCase reconciliation and HOLD workflow | PASS | Domain implementation and protected APIs |
| Internal masterfile snapshot synchronization | PASS | Authorized-downstream only; no agency-state claim |
| Registration lifecycle | PASS WITH CONDITIONS | Implemented; persistence and verification integrations absent |
| Credential masking and approval-gated activation | PASS WITH CONDITIONS | Implemented; in-memory store must be replaced |
| RBAC permission evaluation | PASS WITH CONDITIONS | Implemented; ABAC coverage is incomplete |
| Anonymous protected-route denial smoke tests | PASS | Smoke suite |

## Critical findings

### C-01 — In-memory operational persistence

**Severity:** Critical  
**Status:** BLOCKED

Registration and credential records use process-local stores. Restarting or horizontally scaling the application can lose or diverge records.

**Required remediation:**

- PostgreSQL persistence with migrations.
- tenant-scoped row policies or equivalent enforced repository filters.
- optimistic concurrency.
- immutable audit-event storage.
- encrypted credential fields using KMS envelope encryption.
- backup and point-in-time recovery evidence.

### C-02 — Credential encryption reference is not encryption

**Severity:** Critical  
**Status:** BLOCKED

The current `kms://` reference is derived from a hash and is not proof that a full identifier was encrypted or stored in KMS-backed encrypted persistence.

**Required remediation:** implement envelope encryption and store ciphertext, key identifier, algorithm, version, and authenticated encryption metadata. Never log plaintext identifiers.

### C-03 — Production identity and MFA not evidenced

**Severity:** Critical  
**Status:** BLOCKED

The trusted assertion boundary is implemented, but no Cognito/user-pool configuration, MFA enforcement test, token-rotation test, account-recovery flow, or suspicious-login evidence is attached.

### C-04 — Incomplete ABAC policy

**Severity:** High  
**Status:** BLOCKED

Current access decisions evaluate role, tenant, MFA, credential, purpose, session risk, and approval. The directive additionally requires organization, ownership, resource classification, workflow state, geography, time restriction, device trust, assigned case, and data sensitivity.

### C-05 — Missing formal contracts

**Severity:** High  
**Status:** BLOCKED

Missing or not evidenced:

- complete OpenAPI contract;
- AsyncAPI contract;
- XSD registry;
- XML parsers/validators with XXE disabled;
- XHTML validation suite;
- adapter contract tests.

### C-06 — Incomplete CI/CD assurance

**Severity:** High  
**Status:** BLOCKED

The current Web CI provides dependency install, typecheck, build, server startup, and smoke/security assertions. It does not yet evidence the full required pipeline: lint, unit/contract/E2E tests, SCA, secret scanning, CodeQL, container scanning, infrastructure scanning, migration validation, artifact signing, SBOM, accessibility, load/resilience testing, staged deployment, manual approval, rollback, and evidence publication.

### C-07 — Infrastructure and AWS evidence absent

**Severity:** Critical  
**Status:** BLOCKED

No complete resource inventory or verified deployment evidence has been attached for VPC, ECS/Lambda, Cognito, RDS, Redis, S3 controls, WAF, CloudTrail, GuardDuty, Security Hub, AWS Config, queues/DLQs, EventBridge, alarms, backups, or DR.

### C-08 — External integrations remain legitimately blocked

**Severity:** Critical  
**Status:** BLOCKED

IRS MeF, transcript, Treasury, banking, check-fulfillment, and provider adapters require contracts, legal authority, credentials, certificates, endpoint approval, test evidence, and owner release approval. No interface or environment variable may substitute for that evidence.

## High-priority remediation sequence

1. Merge only after current CI passes.
2. Add PostgreSQL schema and persistence adapters for registration, credentials, approvals, access decisions, and audit events.
3. Replace hash-derived credential references with actual KMS envelope encryption.
4. Expand authorization to a versioned RBAC + ABAC policy decision contract.
5. Add OpenAPI, AsyncAPI, XML/XSD, and XHTML contracts with validation tests.
6. Add CodeQL, dependency review, secret scanning, SBOM, accessibility, and security workflows.
7. Add CDK infrastructure with mandatory tags and OIDC deployment roles.
8. Execute staging deployment, migration, backup/restore, rollback, load, resilience, and security tests.
9. Collect AWS and external-provider evidence into the production-evidence index.
10. Promote only when every mandatory machine-readable gate is PASS.

## Prohibited shortcuts

- Do not set PASS flags solely to change dashboard presentation.
- Do not use screenshots of credentials as verification.
- Do not store full PTIN, EFIN, CAF, TIN, tokens, passwords, or API keys in source or logs.
- Do not claim direct IRS access or live production transmission without external evidence.
- Do not promote an in-memory registry as production persistence.
