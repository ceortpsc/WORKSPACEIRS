# RTPSC Enterprise Release Candidate Status

**Control plane:** `ceortpsc/WORKSPACEIRS`  
**Branch:** `enterprise/experience-routing-rollout-20260729`  
**Target:** `main`  
**Classification:** Governed production candidate; external integrations remain gated.

## Implemented scope

- Eight role-specific experience systems with custom tokens, shells, density, signature patterns, and action hierarchy.
- Coded luxury service exchange across twelve service divisions.
- Routed service dossiers with scope, exclusions, deliverables, prices, actions, gates, risk, and retention metadata.
- Explicit workflow state machine and fail-closed transition evaluator.
- Versioned Next.js enterprise catalog and transition-decision endpoints.
- Dedicated Node orchestration gateway with correlation, timeouts, payload limits, CORS allowlists, health, and readiness.
- Capacitor mobile shell for controlled iOS and Android preparation.
- Four-repository federation governance, CODEOWNERS, Dependabot, quality gates, and release evidence.

## Reproducibility

The tested `pnpm-lock.yaml` is committed. The dependency graph pins the approved Next.js release and enforces patched Sharp and PostCSS versions through root workspace overrides.

## Required validation

The final branch head must pass:

1. workspace dependency installation from the committed lockfile;
2. strict TypeScript validation across enterprise packages;
3. Node orchestration gateway syntax validation;
4. Next.js production build;
5. controlled API-contract presence checks;
6. production dependency audit;
7. secret and credential-pattern review;
8. non-generic route and action vocabulary checks;
9. production-server startup, smoke tests, and security tests;
10. release-evidence manifest and artifact generation.

## External gates intentionally not represented as complete

- IRS MeF transmission and acknowledgment credentials;
- TDS or SOR access;
- bank, payment, payroll, lending, identity, or tax-provider production credentials;
- Apple signing, App Store Connect, TestFlight, privacy manifest approval, or store review;
- final legal approval of engagement terms, consent text, jurisdictional disclosures, pricing, and employee policies;
- production infrastructure cutover and owner authorization.

A green software release candidate does not convert an external authorization, contract, credential, legal review, or government action into an implemented capability.
