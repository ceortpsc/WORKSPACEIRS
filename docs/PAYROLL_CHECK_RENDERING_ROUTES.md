# Ross Payroll Check Rendering Route Registry

This document registers the payroll check rendering, reissue, void, employee copy, employer copy, audit copy, PDF export, and check-stock print-ready route suite for WORKSPACEIRS.

## Module wiring

```txt
Employee Registry
  -> Payroll Run Engine
  -> Check Register
  -> Check Renderer
  -> PDF Export Engine
  -> Print Queue
  -> Audit Trail
  -> AI Assist Validation
  -> Closeout / Correction Routing
```

## Security contract

- Full SSNs are never rendered. Only masked identifiers are allowed.
- Raw bank account values are protected and must not appear in preview, employee copy, employer copy, or audit copy.
- MICR output is restricted to print-ready rendering only.
- Signature blocks are protected rendering assets.
- Protected-field detection must hold print/export automatically.
- Voided checks must never be print-ready.
- Reissued checks must preserve original check chain lineage.
- Every issue, reissue, void, print, export, and closeout event creates an audit event.

## Registered orchestration routes

### Health and discovery

```txt
GET /health
GET /ready
GET /v1/catalog
GET /v1/payroll/routes
```

### Payroll check rendering

```txt
POST /v1/payroll/checks/{checkId}/preview/original
POST /v1/payroll/checks/{checkId}/render/original
POST /v1/payroll/checks/{checkId}/render/employee-copy
POST /v1/payroll/checks/{checkId}/render/employer-copy
POST /v1/payroll/checks/{checkId}/reissue
POST /v1/payroll/checks/{checkId}/void
POST /v1/payroll/checks/{checkId}/print-ready
GET  /v1/payroll/checks/{checkId}/audit
```

### Payroll PDF exports

```txt
POST /v1/payroll/checks/{checkId}/export/original-pdf
POST /v1/payroll/checks/{checkId}/export/reissue-pdf
POST /v1/payroll/checks/{checkId}/export/voided-pdf
POST /v1/payroll/checks/{checkId}/export/employee-copy
POST /v1/payroll/checks/{checkId}/export/employer-copy
POST /v1/payroll/checks/{checkId}/export/audit-copy
```

### Print and AI validation

```txt
POST /v1/payroll/print/calibration
POST /v1/payroll/ai-assist/validate-check
POST /v1/payroll/ai-assist/validate-pdf-export
POST /v1/payroll/ai-assist/validate-payroll-run
POST /v1/payroll/audit/events
```

## State machine

```txt
Draft
  -> Preview Generated
  -> Review
  -> Issued
    -> Reissued -> New Issued Check -> Closed
    -> Voided -> Audit Closed
    -> Exported -> Print Ready -> Closed
```

Blocking states:

```txt
Review Hold
Print Hold
Fraud Hold
Protected Field Hold
Payroll Impact Pending
Correction Required
```

## Required PDF standards

- Embedded fonts
- 300-600 DPI
- MICR-safe formatting
- 0.25 inch margins
- No scaling
- Print-ready alignment grid
- Perforation safe zones
- Check-stock alignment preserved

## Check-stock layout

- Page: 8.5 x 11 inches
- Top check: 8.5 x 3.5 inches
- Stub: 8.5 x 7 inches
- MICR baseline: 0.625 inches from bottom
- Payee block: 1.25 inches left, 1.75 inches top
- Signature block: 1.25 inches from bottom
- Amount block: right-aligned
- Routing number: MICR left zone
- Account number: MICR center zone
- Check number: MICR right zone

## Trigger wiring

### On issue

Creates original check PDF, employee copy, employer copy, audit copy, marks the check issued, verifies fraud-safe status, sets print-ready true, logs audit event, and routes to the print queue.

### On reissue

Marks the original check reissued, creates a new check number and reissue chain ID, generates reissue PDF, updated copies, audit copy, fraud-safe revalidation, and print-ready output.

### On void

Marks the check voided, generates voided PDF and audit copy only, disables fraud-safe status, sets print-ready false, and logs the void event.

### On protected field detection

Holds print/export, routes to AI Assist, masks protected field, logs protection event, and requires review approval.
