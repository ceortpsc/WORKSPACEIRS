# WORKSPACEIRS STRIDE Threat Model

## Scope

This model covers the Next.js application, protected APIs, identity assertion boundary, tenant-scoped records, credential governance, refund/masterfile reconciliation, provider adapters, document storage, queues, audit evidence, and administrative workflows.

## Trust boundaries

1. Browser and public edge.
2. Authenticated user session and identity provider.
3. Next.js server and API boundary.
4. Application services and workers.
5. PostgreSQL, Redis, S3, queues, and audit storage.
6. External IRS, Treasury, bank, identity, notification, and provider adapters.
7. Administrator and deployment control planes.

## STRIDE register

| ID | Category | Threat | Required control | Current status |
|---|---|---|---|---|
| S-01 | Spoofing | Forged trusted-identity headers | HMAC assertion verification, short validity window, bearer-token digest, production IdP integration | PASS WITH CONDITIONS |
| S-02 | Spoofing | Stolen session or replayed token | MFA, secure cookies, token rotation, device trust, replay detection | BLOCKED |
| T-01 | Tampering | Registration or credential record modification | PostgreSQL constraints, optimistic concurrency, immutable audit event, approval workflow | BLOCKED |
| T-02 | Tampering | Altered acknowledgment or transcript evidence | SHA-256 manifest, versioned immutable vault, retention lock | BLOCKED |
| R-01 | Repudiation | Privileged user denies action | actor-, tenant-, resource-, purpose-, correlation-, and approval-attributed append-only audit events | BLOCKED |
| I-01 | Information disclosure | Full PTIN, EFIN, CAF, taxpayer, banking, or secret values exposed | masking, KMS envelope encryption, no-store responses, redacted logs, least privilege | PASS WITH CONDITIONS |
| I-02 | Information disclosure | Cross-tenant object access | tenant-bound repository layer, ABAC, IDOR tests, row-level controls | BLOCKED |
| D-01 | Denial of service | Request floods, oversized payloads, queue floods | WAF, API throttling, payload limits, backpressure, DLQ, autoscaling | PASS WITH CONDITIONS |
| D-02 | Denial of service | External adapter degradation | timeout, retry budget, circuit breaker, health checks, fail-closed fallback | BLOCKED |
| E-01 | Elevation of privilege | UI-hidden action invoked directly | server-side RBAC/ABAC decision, MFA, credential state, purpose, approval | PASS WITH CONDITIONS |
| E-02 | Elevation of privilege | Self-approval of credential or role | separation of duties, approver identity comparison, dual control | BLOCKED |
| E-03 | Elevation of privilege | AI recommends or executes prohibited action | tool allowlists, human approval, output validation, kill switch, audit | BLOCKED |

## Mandatory security invariants

- Frontend visibility never grants authorization.
- Every protected API validates identity, tenant, role, and request scope.
- Sensitive credentials are never returned in full after submission.
- External adapter status defaults to blocked.
- Material actions require purpose attribution and audit correlation.
- Credential activation and privileged-role assignment require independent approval.
- Production synthetic execution is disabled.
- AI output cannot activate permissions, transmit returns, alter audit evidence, or invent external results.

## Required verification tests

- Forged HMAC assertion rejection.
- Expired assertion rejection.
- Anonymous and incorrect-role denial.
- Cross-tenant object and batch rejection.
- Privileged-action MFA and approval denial.
- Self-approval denial.
- Credential masking and log-redaction tests.
- SQL, XSS, CSRF, SSRF, XXE, file-upload, webhook-forgery, and replay tests.
- Queue retry, DLQ, replay, and duplicate-detection tests.
- External-adapter timeout and circuit-breaker tests.
- Backup restore and immutable audit-recovery tests.

## Residual-risk determination

**BLOCKED for production.** The application-level guardrails reduce immediate exposure, but persistent tenant isolation, KMS encryption, production identity, audit immutability, edge security, infrastructure controls, and complete security testing require execution evidence before production promotion.
