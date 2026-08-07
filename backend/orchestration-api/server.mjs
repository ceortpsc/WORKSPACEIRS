import http from 'node:http';
import { randomUUID } from 'node:crypto';

const port = Number(process.env.PORT ?? 4000);
const webOrigin = new URL(process.env.RTPSC_WEB_ORIGIN ?? 'http://127.0.0.1:3000');
const allowedOrigins = new Set((process.env.RTPSC_ALLOWED_ORIGINS ?? '').split(',').map((value) => value.trim()).filter(Boolean));
const requestTimeoutMs = Number(process.env.RTPSC_UPSTREAM_TIMEOUT_MS ?? 8000);
const maxBodyBytes = 64 * 1024;

const securityHeaders = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'cache-control': 'no-store'
};

const payrollRouteRegistry = Object.freeze([
  { method: 'GET', path: '/v1/payroll/routes', lane: 'Route Registry', state: 'implemented' },
  { method: 'POST', path: '/v1/payroll/checks/{checkId}/preview/original', lane: 'Check Renderer', state: 'Preview Generated' },
  { method: 'POST', path: '/v1/payroll/checks/{checkId}/render/original', lane: 'Check Renderer', state: 'Issued' },
  { method: 'POST', path: '/v1/payroll/checks/{checkId}/render/employee-copy', lane: 'Check Renderer', state: 'Employee Copy Generated' },
  { method: 'POST', path: '/v1/payroll/checks/{checkId}/render/employer-copy', lane: 'Check Renderer', state: 'Employer Copy Generated' },
  { method: 'POST', path: '/v1/payroll/checks/{checkId}/reissue', lane: 'Check Register', state: 'Reissued' },
  { method: 'POST', path: '/v1/payroll/checks/{checkId}/void', lane: 'Check Register', state: 'Voided' },
  { method: 'POST', path: '/v1/payroll/checks/{checkId}/print-ready', lane: 'Print Queue', state: 'Print Ready' },
  { method: 'GET', path: '/v1/payroll/checks/{checkId}/audit', lane: 'Audit Trail', state: 'Audit Loaded' },
  { method: 'POST', path: '/v1/payroll/checks/{checkId}/export/original-pdf', lane: 'PDF Export Engine', state: 'Exported' },
  { method: 'POST', path: '/v1/payroll/checks/{checkId}/export/reissue-pdf', lane: 'PDF Export Engine', state: 'Exported' },
  { method: 'POST', path: '/v1/payroll/checks/{checkId}/export/voided-pdf', lane: 'PDF Export Engine', state: 'Exported' },
  { method: 'POST', path: '/v1/payroll/checks/{checkId}/export/employee-copy', lane: 'PDF Export Engine', state: 'Exported' },
  { method: 'POST', path: '/v1/payroll/checks/{checkId}/export/employer-copy', lane: 'PDF Export Engine', state: 'Exported' },
  { method: 'POST', path: '/v1/payroll/checks/{checkId}/export/audit-copy', lane: 'PDF Export Engine', state: 'Audit Copy Generated' },
  { method: 'POST', path: '/v1/payroll/print/calibration', lane: 'Print Queue', state: 'Calibration Saved' },
  { method: 'POST', path: '/v1/payroll/audit/events', lane: 'Audit Trail', state: 'Logged' },
  { method: 'POST', path: '/v1/payroll/ai-assist/validate-check', lane: 'AI Assist Validation', state: 'Validated' },
  { method: 'POST', path: '/v1/payroll/ai-assist/validate-pdf-export', lane: 'AI Assist Validation', state: 'Validated' },
  { method: 'POST', path: '/v1/payroll/ai-assist/validate-payroll-run', lane: 'AI Assist Validation', state: 'Validated' }
]);

const payrollSecurityRules = Object.freeze(['MASK_FULL_SSN','PROTECT_BANK_ACCOUNT','MICR_PRINT_READY_ONLY','PROTECT_SIGNATURE_BLOCK','HOLD_ON_PROTECTED_FIELD_DETECTION','VOIDED_CHECK_NOT_PRINT_READY','PRESERVE_REISSUE_CHAIN','AUDIT_EVERY_STATE_CHANGE']);
const productionRequiredEnv = Object.freeze(['IDENTITY_ENABLED','IDENTITY_CONFIGURED','TENANT_ISOLATION_ENABLED','TENANT_ISOLATION_CONFIGURED','DATABASE_ENABLED','DATABASE_CONFIGURED','DOCUMENT_VAULT_ENABLED','DOCUMENT_VAULT_CONFIGURED','AUDIT_ENABLED','AUDIT_CONFIGURED','EVENTS_ENABLED','EVENTS_CONFIGURED','PAYROLL_ENGINE_ENABLED','PAYROLL_ENGINE_CONFIGURED','PAYMENTS_ENABLED','PAYMENTS_CONFIGURED','MIGRATIONS_VERIFIED','BACKUP_RESTORE_VERIFIED','ACCESS_CONTROL_TESTS_VERIFIED','SECURITY_SCAN_VERIFIED','SMOKE_TESTS_VERIFIED','INCIDENT_RUNBOOK_VERIFIED','RETENTION_POLICY_VERIFIED','ROLLBACK_VERIFIED','PRODUCTION_CUTOVER_APPROVED','OWNER_AUTHORIZATION_CONFIRMED']);

function envTrue(key) { return String(process.env[key] ?? '').toLowerCase() === 'true'; }
function writeJson(response, status, payload, requestId, extraHeaders = {}) { response.writeHead(status, { ...securityHeaders, ...extraHeaders, 'content-type': 'application/json; charset=utf-8', 'x-correlation-id': requestId }); response.end(JSON.stringify(payload)); }
function applyCors(request, headers) { const origin = request.headers.origin; if (!origin || !allowedOrigins.has(origin)) return headers; return { ...headers, 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type,x-correlation-id,authorization', 'access-control-max-age': '600', vary: 'Origin' }; }
async function readBody(request) { const chunks = []; let size = 0; for await (const chunk of request) { size += chunk.length; if (size > maxBodyBytes) { const error = new Error('PAYLOAD_TOO_LARGE'); error.code = 'PAYLOAD_TOO_LARGE'; throw error; } chunks.push(chunk); } return Buffer.concat(chunks); }
async function readJsonBody(request) { const body = await readBody(request); if (body.length === 0) return {}; return JSON.parse(body.toString('utf8')); }
function requireString(input, key) { const value = input[key]; if (typeof value !== 'string' || value.trim().length === 0) { const error = new Error(`${key} is required for production payroll execution.`); error.code = 'MISSING_REQUIRED_FIELD'; error.field = key; throw error; } return value.trim(); }
function maskIdentifier(value) { if (!value || typeof value !== 'string') return '***-**-****'; const digits = value.replace(/\D/g, ''); if (digits.length < 4) return '***-**-****'; return `***-**-${digits.slice(-4)}`; }
function buildArtifactUrl(input, artifactType) { const artifacts = input.artifacts && typeof input.artifacts === 'object' ? input.artifacts : {}; const value = artifacts[artifactType] ?? input[`${artifactType}Url`]; if (typeof value !== 'string' || !/^https:\/\//.test(value)) { const error = new Error(`${artifactType} HTTPS artifact URL is required; generated placeholder artifacts are not allowed in production.`); error.code = 'ARTIFACT_URL_REQUIRED'; error.field = artifactType; throw error; } return value; }
function cutoverStatus() { const failed = productionRequiredEnv.filter((key) => !envTrue(key)); return { productionReady: failed.length === 0, failed, passed: productionRequiredEnv.filter((key) => envTrue(key)) }; }

function buildPayrollResponse({ requestId, route, checkId, input = {} }) {
  const normalizedCheckId = checkId || requireString(input, 'checkId');
  const base = { requestId, checkId: normalizedCheckId, route: route.path, lane: route.lane, status: route.state, auditEventId: input.auditEventId ?? randomUUID(), protectedFields: { ssn: maskIdentifier(input.ssn ?? input.maskedSSN), bankAccount: 'PROTECTED', routingNumber: route.path.includes('print-ready') ? 'MICR_ZONE_ONLY' : 'PROTECTED', signatureBlock: 'PROTECTED' }, securityRules: payrollSecurityRules };
  if (route.path.includes('/preview/original')) return { ...base, previewUrl: buildArtifactUrl(input, 'preview'), printReady: false, fraudSafe: 'Pending', watermark: 'PREVIEW' };
  if (route.path.includes('/render/original')) return { ...base, checkNumber: requireString(input, 'checkNumber'), pdfUrl: buildArtifactUrl(input, 'originalPdf'), employeeCopyUrl: buildArtifactUrl(input, 'employeeCopy'), employerCopyUrl: buildArtifactUrl(input, 'employerCopy'), auditCopyUrl: buildArtifactUrl(input, 'auditCopy'), printReady: true, fraudSafe: 'Verified' };
  if (route.path.includes('/employee-copy')) return { ...base, employeeCopyUrl: buildArtifactUrl(input, 'employeeCopy'), printReady: true, watermark: 'EMPLOYEE COPY — NOT NEGOTIABLE' };
  if (route.path.includes('/employer-copy')) return { ...base, employerCopyUrl: buildArtifactUrl(input, 'employerCopy'), printReady: true };
  if (route.path.includes('/reissue')) return { ...base, originalCheckId: requireString(input, 'originalCheckId'), newCheckId: requireString(input, 'newCheckId'), originalCheckNumber: requireString(input, 'originalCheckNumber'), newCheckNumber: requireString(input, 'newCheckNumber'), reissueChainId: requireString(input, 'reissueChainId'), reissuePdfUrl: buildArtifactUrl(input, 'reissuePdf'), employeeCopyUrl: buildArtifactUrl(input, 'employeeCopy'), employerCopyUrl: buildArtifactUrl(input, 'employerCopy'), auditCopyUrl: buildArtifactUrl(input, 'auditCopy'), originalStatus: 'Reissued', newStatus: 'Issued', printReady: true, fraudSafe: 'Revalidated', watermark: 'REISSUED CHECK' };
  if (route.path.includes('/void')) return { ...base, reasonCode: requireString(input, 'reasonCode'), voidedPdfUrl: buildArtifactUrl(input, 'voidedPdf'), auditCopyUrl: buildArtifactUrl(input, 'auditCopy'), printReady: false, fraudSafe: 'Disabled', watermark: 'VOID' };
  if (route.path.includes('/print-ready')) return { ...base, printReadyPdfUrl: buildArtifactUrl(input, 'printReadyPdf'), alignmentGridUrl: buildArtifactUrl(input, 'alignmentGrid'), calibrationProfileId: requireString(input, 'calibrationProfileId'), printReady: true, scaleLocked: true, layout: { page: '8.5x11', topCheck: '8.5x3.5', stub: '8.5x7', micrBaselineFromBottomInches: 0.625, marginInches: 0.25 } };
  if (route.path.includes('/export/')) return { ...base, exportUrl: buildArtifactUrl(input, 'export'), pdfStandards: ['embedded_fonts','300_600_dpi','micr_safe_formatting','quarter_inch_margins','no_scaling','alignment_grid'] };
  if (route.path.includes('/audit/events')) return { requestId, auditEventId: input.auditEventId ?? randomUUID(), status: 'Logged', entityType: requireString(input, 'entityType'), entityId: requireString(input, 'entityId') };
  if (route.path.includes('/audit')) return { ...base, events: Array.isArray(input.events) ? input.events : [] };
  if (route.path.includes('/calibration')) return { requestId, calibrationProfileId: requireString(input, 'calibrationProfileId'), printerId: requireString(input, 'printerId'), scaleLocked: true, noScaling: true, status: 'Calibration Saved' };
  if (route.path.includes('/ai-assist/')) return { ...base, validationStatus: input.validationStatus ?? 'Held For Review', findings: Array.isArray(input.findings) ? input.findings : [], requiredChecks: ['protected_identifier_exposure','duplicate_check_number','micr_line_completeness','print_scale_mismatch','ytd_completeness','stub_total_mismatch','net_pay_mismatch','missing_approval'] };
  return base;
}

function matchPayrollRoute(method, pathname) { for (const route of payrollRouteRegistry) { if (route.method !== method) continue; const pattern = `^${route.path.replaceAll('/', '\\/').replace('{checkId}', '([^/]+)')}$`; const match = pathname.match(new RegExp(pattern)); if (match) return { route, checkId: match[1] }; } return null; }
async function proxyToWeb({ request, response, requestId, pathname, method = 'GET', body }) { const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), requestTimeoutMs); try { const target = new URL(pathname, webOrigin); const upstream = await fetch(target, { method, body, signal: controller.signal, headers: { accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}), 'x-correlation-id': requestId, ...(request.headers.authorization ? { authorization: request.headers.authorization } : {}) } }); const payload = await upstream.text(); response.writeHead(upstream.status, applyCors(request, { ...securityHeaders, 'content-type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8', 'x-correlation-id': upstream.headers.get('x-correlation-id') ?? requestId })); response.end(payload); } catch (error) { const timedOut = error instanceof Error && error.name === 'AbortError'; writeJson(response, timedOut ? 504 : 502, { error: timedOut ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_UNAVAILABLE', message: timedOut ? 'The governed web API did not respond before the configured timeout.' : 'The governed web API could not be reached.', requestId }, requestId, applyCors(request, {})); } finally { clearTimeout(timeout); } }

const server = http.createServer(async (request, response) => {
  const requestId = request.headers['x-correlation-id']?.toString() || randomUUID();
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  if (request.method === 'OPTIONS') { response.writeHead(204, applyCors(request, { ...securityHeaders, 'x-correlation-id': requestId })); response.end(); return; }
  if (request.method === 'GET' && url.pathname === '/health') { writeJson(response, 200, { service: '@ross/orchestration-api', status: 'online', requestId, uptimeSeconds: Math.floor(process.uptime()), webOrigin: webOrigin.origin, registeredPayrollRoutes: payrollRouteRegistry.length }, requestId, applyCors(request, {})); return; }
  if (request.method === 'GET' && url.pathname === '/v1/production/cutover') { const status = cutoverStatus(); writeJson(response, status.productionReady ? 200 : 423, { service: '@ross/orchestration-api', status: status.productionReady ? 'production_ready' : 'blocked', requestId, ...status }, requestId, applyCors(request, {})); return; }
  if (request.method === 'GET' && url.pathname === '/ready') { await proxyToWeb({ request, response, requestId, pathname: '/api/ready' }); return; }
  if (request.method === 'GET' && url.pathname === '/v1/catalog') { await proxyToWeb({ request, response, requestId, pathname: '/api/v1/enterprise/catalog' }); return; }
  if (request.method === 'GET' && url.pathname === '/v1/payroll/routes') { writeJson(response, 200, { service: '@ross/orchestration-api', module: 'Payroll Check Rendering', status: 'registered', requestId, routes: payrollRouteRegistry, securityRules: payrollSecurityRules, wiring: ['Employee Registry','Payroll Run Engine','Check Register','Check Renderer','PDF Export Engine','Print Queue','Audit Trail','AI Assist Validation','Closeout Router'] }, requestId, applyCors(request, {})); return; }
  const payrollMatch = matchPayrollRoute(request.method ?? 'GET', url.pathname);
  if (payrollMatch) { try { const input = request.method === 'POST' ? await readJsonBody(request) : {}; writeJson(response, 200, buildPayrollResponse({ requestId, ...payrollMatch, input }), requestId, applyCors(request, {})); } catch (error) { const tooLarge = error && typeof error === 'object' && error.code === 'PAYLOAD_TOO_LARGE'; const missing = error && typeof error === 'object' && ['MISSING_REQUIRED_FIELD','ARTIFACT_URL_REQUIRED'].includes(error.code); writeJson(response, tooLarge ? 413 : missing ? 422 : 400, { error: tooLarge ? 'PAYLOAD_TOO_LARGE' : missing ? error.code : 'INVALID_JSON', message: error instanceof Error ? error.message : 'A valid JSON payroll request is required.', field: error?.field, requestId }, requestId, applyCors(request, {})); } return; }
  if (request.method === 'POST' && url.pathname === '/v1/transitions') { try { const body = await readBody(request); JSON.parse(body.toString('utf8')); await proxyToWeb({ request, response, requestId, pathname: '/api/v1/enterprise/transitions', method: 'POST', body }); } catch (error) { const tooLarge = error && typeof error === 'object' && error.code === 'PAYLOAD_TOO_LARGE'; writeJson(response, tooLarge ? 413 : 400, { error: tooLarge ? 'PAYLOAD_TOO_LARGE' : 'INVALID_JSON', message: tooLarge ? 'Transition requests are limited to 64 KB.' : 'A valid JSON transition request is required.', requestId }, requestId, applyCors(request, {})); } return; }
  writeJson(response, 404, { error: 'ROUTE_NOT_FOUND', message: 'The requested orchestration route is not registered.', requestId, availableRoutes: ['GET /health','GET /ready','GET /v1/catalog','POST /v1/transitions','GET /v1/production/cutover','GET /v1/payroll/routes', ...payrollRouteRegistry.map((route) => `${route.method} ${route.path}`)] }, requestId, applyCors(request, {}));
});

server.requestTimeout = 15_000;
server.headersTimeout = 16_000;
server.keepAliveTimeout = 5_000;
server.listen(port, '0.0.0.0', () => { console.log(JSON.stringify({ event: 'ORCHESTRATION_API_STARTED', service: '@ross/orchestration-api', port, webOrigin: webOrigin.origin, allowedOriginCount: allowedOrigins.size, registeredPayrollRoutes: payrollRouteRegistry.length })); });
function shutdown(signal) { console.log(JSON.stringify({ event: 'ORCHESTRATION_API_SHUTDOWN', signal })); server.close((error) => { if (error) { console.error(error); process.exitCode = 1; } }); setTimeout(() => process.exit(1), 10_000).unref(); }
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
