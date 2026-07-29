# RTPSC Enterprise Experience, Service, and Routing Rollout

**Repository role:** `WORKSPACEIRS` is the presentation, orchestration, governance, and release-control plane for Ross Tax Pro Software Co.

## Repository federation

| Repository | Governed responsibility | Integration rule |
|---|---|---|
| `ceortpsc/WORKSPACEIRS` | Next.js web platform, client/ERO workspaces, design system, workflow routing, release evidence, API façade | Primary enterprise application and deployment control plane |
| `ceortpsc/rtpsctaxplatform` | Tax engines, e-file lifecycle, worker services, transcript/refund/masterfile intelligence, internal CLIs | Consumed through versioned contracts and adapters; never imported by path at runtime |
| `ceortpsc/rtpsc-backoffice-full-integration-module` | Legacy back-office connectors and operational migration sources | Quarantined behind an anti-corruption layer until package metadata, security, and tests pass |
| `ceortpsc/theapplianceclinic` | Separate vertical application | No taxpayer-data sharing; only reusable non-sensitive platform patterns may be promoted |

## Product surfaces

1. **Corporate and sales experience** — luxury service discovery, pricing logic, qualification, consultation booking, secure intake, enterprise proposals.
2. **Taxpayer command center** — identity, engagement, upload, questionnaires, estimates, invoices, signatures, timeline, notices, delivery, retention requests.
3. **Practitioner production studio** — source evidence, workpapers, due diligence, calculations, reviewer comments, correction loops, client approvals.
4. **ERO transmission command** — readiness gates, schema validation, signature evidence, submission intent, acknowledgments, rejects, retries, retention.
5. **Resolution and representation suite** — notice triage, authorization, deadline controls, response packages, escalation and delivery.
6. **Bookkeeping and payroll operations** — onboarding, ledgers, reconciliations, close, payroll approvals, reporting, exception queues.
7. **AI employee command hub** — policy-scoped personas, paid task orders, citations, risk tier, human review, delivery and audit.
8. **Executive operations fabric** — tenant health, revenue, quality, capacity, risk, release evidence, incidents and vendor status.
9. **Education and credentialing** — role training, PTIN/ERO curricula, assessments, completion evidence and policy acknowledgments.
10. **Platform administration** — tenants, offices, roles, policies, adapters, secrets references, retention rules and emergency controls.

## Experience packages

The interface is not a single generic dashboard with relabeled cards. Each package has its own information architecture, visual rhythm, actions, status language, and escalation model.

- **Executive Black Label** — dense command surfaces, ledger typography, gold evidence markers, risk and release views.
- **Taxpayer Concierge** — guided intake, plain-language status narratives, prominent next action, secure document and payment controls.
- **Practitioner Studio** — evidence-first split panes, source/workpaper linkage, keyboard workflow and review annotations.
- **ERO Command** — high-contrast release gates, transmission timeline, environment banners, reject and retry controls.
- **Resolution Counsel** — deadline rail, authority banner, notice-page navigator, issue matrix, response assembly.
- **Ledger Atelier** — reconciliation ribbons, close calendar, exception drawers, balance proof and approval chain.
- **AI Workforce Theater** — persona roster, task contract, source panel, risk badge, reviewer disposition and delivery proof.
- **Academy Registry** — program maps, competency evidence, assessments, instructor controls and learner transcript.

## Route contract

Every route declares:

- business owner and operating persona;
- access level and tenant scope;
- service catalog codes;
- allowed user actions;
- required evidence and approval gates;
- workflow states and valid transitions;
- API contracts and event triggers;
- retention rule and audit category;
- release status: `implemented`, `controlled`, `external-gate`, or `certified`.

## Mandatory action model

Actions are explicit domain verbs. Avoid vague buttons such as **Submit**, **Continue**, **Process**, or **Manage** when a precise verb is available.

Examples: `Request missing W-2`, `Approve engagement scope`, `Place return on compliance HOLD`, `Release review copy`, `Authorize transmission intent`, `Record acknowledgment`, `Generate destruction certificate`.

## Production certification gates

A route is not production-certified because it renders. Certification requires:

1. TypeScript, lint, unit, contract and accessibility checks.
2. Authentication and authorization tests.
3. State-transition and idempotency tests.
4. Audit-event and retention metadata verification.
5. Dependency and secret scanning.
6. Build artifact and software bill of materials.
7. Staging smoke test and rollback evidence.
8. Human approval for external adapters and material tax actions.
9. `/api/ready` returning HTTP 200 with current release evidence.

## Rollout sequence

- **Wave 0 — foundation:** contracts, themes, actions, workflow engine, CI gates.
- **Wave 1 — public and intake:** corporate, services, secure intake and client authentication.
- **Wave 2 — taxpayer operations:** documents, questionnaires, billing, signatures, notices and delivery.
- **Wave 3 — practitioner and ERO:** workpapers, review, e-file command, acknowledgments and retention.
- **Wave 4 — intelligence and AI:** refund evidence, reconciliation, AI tasks, analytics and policy enforcement.
- **Wave 5 — multi-office scale:** tenant administration, white label, SLOs, disaster recovery and release certification.

## Non-negotiable boundaries

- AI cannot sign, transmit, represent, alter banking data, approve refunds, clear material holds, or destroy evidence.
- External IRS, lender, payroll, banking and identity adapters fail closed until credentials, contracts, test evidence and approval exist.
- The platform records facts, evidence and controlled inferences; it does not present an inference as an official agency determination.
- Legal text, consent language, retention periods and disclosures are versioned configuration reviewed by qualified personnel.
