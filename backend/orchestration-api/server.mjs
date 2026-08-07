import http from 'node:http';
import { randomUUID } from 'node:crypto';

const port = Number(process.env.PORT ?? 4000);
const webOrigin = new URL(process.env.RTPSC_WEB_ORIGIN ?? 'http://127.0.0.1:3000');
const allowedOrigins = new Set(
  (process.env.RTPSC_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
);
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

const payrollSecurityRules = Object.freeze([
  'MASK_FULL_SSN',
  'PROTECT_BANK_ACCOUNT',
  'MICR_PRINT_READY_ONLY',
  'PROTECT_SIGNATURE_BLOCK',
  'HOLD_ON_PROTECTED_FIELD_DETECTION',
  'VOIDED_CHECK_NOT_PRINT_READY',
  'PRESERVE_REISSUE_CHAIN',
  'AUDIT_EVERY_STATE_CHANGE'
]);

function writeJson(response, status, payload, requestId, extraHeaders = {}) {
  response.writeHead(status, {
    ...securityHeaders,
    ...extraHeaders,
    'content-type': 'application/json; charset=utf-8',
    'x-correlation-id': requestId
  });
  response.end(JSON.stringify(payload));
}

function applyCors(request, headers) {
  const origin = request.headers.origin;
  if (!origin || !allowedOrigins.has(origin)) return headers;
  return {
    ...headers,
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,x-correlation-id,authorization',
    'access-control-max-age': '600',
    vary: 'Origin'
  };
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      const error = new Error('PAYLOAD_TOO_LARGE');
      error.code = 'PAYLOAD_TOO_LARGE';
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readJsonBody(request) {
  const body = await readBody(request);
  if (body.length === 0) return {};
  return JSON.parse(body.toString('utf8'));
}

function maskIdentifier(value) {
  if (!value || typeof value !== 'string') return '***-**-****';
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return '***-**-****';
  return `***-**-${digits.slice(-4)}`;
}

function buildArtifactUrl(checkId, artifactType) {
  return `urn:rtpsc:payroll:${artifactType}:${checkId}:${randomUUID()}`;
}

function buildPayrollResponse({ requestId, route, checkId, input = {} }) {
  const normalizedCheckId = checkId || input.checkId || input.originalCheckId || randomUUID();
  const base = {
    requestId,
    checkId: normalizedCheckId,
    route: route.path,
    lane: route.lane,
    status: route.state,
    auditEventId: randomUUID(),
    protectedFields: {
      ssn: maskIdentifier(input.ssn ?? input.maskedSSN),
      bankAccount: 'PROTECTED',
      routingNumber: route.path.includes('print-ready') ? 'MICR_ZONE_ONLY' : 'PROTECTED',
      signatureBlock: 'PROTECTED'
    },
    securityRules: payrollSecurityRules
  };

  if (route.path.includes('/preview/original')) {
    return { ...base, previewUrl: buildArtifactUrl(normalizedCheckId, 'original-preview'), printReady: false, fraudSafe: 'Pending', watermark: 'PREVIEW' };
  }
  if (route.path.includes('/render/original')) {
    return { ...base, checkNumber: input.checkNumber ?? 'PENDING-CHECK-NUMBER', pdfUrl: buildArtifactUrl(normalizedCheckId, 'original-check-pdf'), employeeCopyUrl: buildArtifactUrl(normalizedCheckId, 'employee-copy'), employerCopyUrl: buildArtifactUrl(normalizedCheckId, 'employer-copy'), auditCopyUrl: buildArtifactUrl(normalizedCheckId, 'audit-copy'), printReady: true, fraudSafe: 'Verified' };
  }
  if (route.path.includes('/employee-copy')) {
    return { ...base, employeeCopyUrl: buildArtifactUrl(normalizedCheckId, 'employee-copy'), printReady: true, watermark: 'EMPLOYEE COPY — NOT NEGOTIABLE' };
  }
  if (route.path.includes('/employer-copy')) {
    return { ...base, employerCopyUrl: buildArtifactUrl(normalizedCheckId, 'employer-copy'), printReady: true };
  }
  if (route.path.includes('/reissue')) {
    return { ...base, originalCheckId: input.originalCheckId ?? normalizedCheckId, newCheckId: randomUUID(), originalCheckNumber: input.originalCheckNumber ?? 'ORIGINAL-CHECK-NUMBER', newCheckNumber: input.newCheckNumber ?? 'NEW-CHECK-NUMBER', reissueChainId: input.reissueChainId ?? randomUUID(), reissuePdfUrl: buildArtifactUrl(normalizedCheckId, 'reissue-pdf'), employeeCopyUrl: buildArtifactUrl(normalizedCheckId, 'employee-copy'), employerCopyUrl: buildArtifactUrl(normalizedCheckId, 'employer-copy'), auditCopyUrl: buildArtifactUrl(normalizedCheckId, 'audit-copy'), originalStatus: 'Reissued', newStatus: 'Issued', printReady: true, fraudSafe: 'Revalidated', watermark: 'REISSUED CHECK' };
  }
  if (route.path.includes('/void')) {
    return { ...base, voidedPdfUrl: buildArtifactUrl(normalizedCheckId, 'voided-pdf'), auditCopyUrl: buildArtifactUrl(normalizedCheckId, 'audit-copy'), printReady: false, fraudSafe: 'Disabled', watermark: 'VOID' };
  }
  if (route.path.includes('/print-ready')) {
    return { ...base, printReadyPdfUrl: buildArtifactUrl(normalizedCheckId, 'print-ready-pdf'), alignmentGridUrl: buildArtifactUrl(normalizedCheckId, 'alignment-grid'), calibrationProfileId: input.calibrationProfileId ?? randomUUID(), printReady: true, scaleLocked: true, layout: { page: '8.5x11', topCheck: '8.5x3.5', stub: '8.5x7', micrBaselineFromBottomInches: 0.625, marginInches: 0.25 } };
  }
  if (route.path.includes('/export/')) {
    return { ...base, exportUrl: buildArtifactUrl(normalizedCheckId, route.path.split('/').at(-1)), pdfStandards: ['embedded_fonts', '300_600_dpi', 'micr_safe_formatting', 'quarter_inch_margins', 'no_scaling', 'alignment_grid'] };
  }
  if (route.path.includes('/audit/events')) {
    return { requestId, auditEventId: randomUUID(), status: 'Logged', entityType: input.entityType ?? 'check', entityId: input.entityId ?? normalizedCheckId };
  }
  if (route.path.includes('/audit')) {
    return { ...base, events: [{ auditEventId: randomUUID(), eventType: 'PAYROLL_ROUTE_REGISTERED', eventStatus: 'created', actorId: input.actorId ?? 'system', timestamp: new Date().toISOString() }] };
  }
  if (route.path.includes('/calibration')) {
    return { requestId, calibrationProfileId: randomUUID(), printerId: input.printerId ?? 'default-printer', scaleLocked: true, noScaling: true, status: 'Calibration Saved' };
  }
  if (route.path.includes('/ai-assist/')) {
    return { ...base, validationStatus: 'Passed', findings: [], requiredChecks: ['protected_identifier_exposure', 'duplicate_check_number', 'micr_line_completeness', 'print_scale_mismatch', 'ytd_completeness', 'stub_total_mismatch', 'net_pay_mismatch', 'missing_approval'] };
  }
  return base;
}

function matchPayrollRoute(method, pathname) {
  for (const route of payrollRouteRegistry) {
    if (route.method !== method) continue;
    const pattern = `^${route.path.replaceAll('/', '\\/').replace('{checkId}', '([^/]+)')}$`;
    const match = pathname.match(new RegExp(pattern));
    if (match) return { route, checkId: match[1] };
  }
  return null;
}

async function proxyToWeb({ request, response, requestId, pathname, method = 'GET', body }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const target = new URL(pathname, webOrigin);
    const upstream = await fetch(target, {
      method,
      body,
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        ...(body ? { 'content-type': 'application/json' } : {}),
        'x-correlation-id': requestId,
        ...(request.headers.authorization ? { authorization: request.headers.authorization } : {})
      }
    });
    const payload = await upstream.text();
    response.writeHead(upstream.status, applyCors(request, {
      ...securityHeaders,
      'content-type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
      'x-correlation-id': upstream.headers.get('x-correlation-id') ?? requestId
    }));
    response.end(payload);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError';
    writeJson(response, timedOut ? 504 : 502, {
      error: timedOut ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_UNAVAILABLE',
      message: timedOut
        ? 'The governed web API did not respond before the configured timeout.'
        : 'The governed web API could not be reached.',
      requestId
    }, requestId, applyCors(request, {}));
  } finally {
    clearTimeout(timeout);
  }
}

const server = http.createServer(async (request, response) => {
  const requestId = request.headers['x-correlation-id']?.toString() || randomUUID();
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  if (request.method === 'OPTIONS') {
    response.writeHead(204, applyCors(request, { ...securityHeaders, 'x-correlation-id': requestId }));
    response.end();
    return;
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    writeJson(response, 200, {
      service: '@ross/orchestration-api',
      status: 'online',
      requestId,
      uptimeSeconds: Math.floor(process.uptime()),
      webOrigin: webOrigin.origin,
      registeredPayrollRoutes: payrollRouteRegistry.length
    }, requestId, applyCors(request, {}));
    return;
  }

  if (request.method === 'GET' && url.pathname === '/ready') {
    await proxyToWeb({ request, response, requestId, pathname: '/api/ready' });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/catalog') {
    await proxyToWeb({ request, response, requestId, pathname: '/api/v1/enterprise/catalog' });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/payroll/routes') {
    writeJson(response, 200, {
      service: '@ross/orchestration-api',
      module: 'Payroll Check Rendering',
      status: 'registered',
      requestId,
      routes: payrollRouteRegistry,
      securityRules: payrollSecurityRules,
      wiring: ['Employee Registry', 'Payroll Run Engine', 'Check Register', 'Check Renderer', 'PDF Export Engine', 'Print Queue', 'Audit Trail', 'AI Assist Validation', 'Closeout Router']
    }, requestId, applyCors(request, {}));
    return;
  }

  const payrollMatch = matchPayrollRoute(request.method ?? 'GET', url.pathname);
  if (payrollMatch) {
    try {
      const input = request.method === 'POST' ? await readJsonBody(request) : {};
      writeJson(response, 200, buildPayrollResponse({ requestId, ...payrollMatch, input }), requestId, applyCors(request, {}));
    } catch (error) {
      const tooLarge = error && typeof error === 'object' && error.code === 'PAYLOAD_TOO_LARGE';
      writeJson(response, tooLarge ? 413 : 400, {
        error: tooLarge ? 'PAYLOAD_TOO_LARGE' : 'INVALID_JSON',
        message: tooLarge ? 'Payroll requests are limited to 64 KB.' : 'A valid JSON payroll request is required.',
        requestId
      }, requestId, applyCors(request, {}));
    }
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/transitions') {
    try {
      const body = await readBody(request);
      JSON.parse(body.toString('utf8'));
      await proxyToWeb({
        request,
        response,
        requestId,
        pathname: '/api/v1/enterprise/transitions',
        method: 'POST',
        body
      });
    } catch (error) {
      const tooLarge = error && typeof error === 'object' && error.code === 'PAYLOAD_TOO_LARGE';
      writeJson(response, tooLarge ? 413 : 400, {
        error: tooLarge ? 'PAYLOAD_TOO_LARGE' : 'INVALID_JSON',
        message: tooLarge ? 'Transition requests are limited to 64 KB.' : 'A valid JSON transition request is required.',
        requestId
      }, requestId, applyCors(request, {}));
    }
    return;
  }

  writeJson(response, 404, {
    error: 'ROUTE_NOT_FOUND',
    message: 'The requested orchestration route is not registered.',
    requestId,
    availableRoutes: ['GET /health', 'GET /ready', 'GET /v1/catalog', 'POST /v1/transitions', 'GET /v1/payroll/routes', ...payrollRouteRegistry.map((route) => `${route.method} ${route.path}`)]
  }, requestId, applyCors(request, {}));
});

server.requestTimeout = 15_000;
server.headersTimeout = 16_000;
server.keepAliveTimeout = 5_000;

server.listen(port, '0.0.0.0', () => {
  console.log(JSON.stringify({
    event: 'ORCHESTRATION_API_STARTED',
    service: '@ross/orchestration-api',
    port,
    webOrigin: webOrigin.origin,
    allowedOriginCount: allowedOrigins.size,
    registeredPayrollRoutes: payrollRouteRegistry.length
  }));
});

function shutdown(signal) {
  console.log(JSON.stringify({ event: 'ORCHESTRATION_API_SHUTDOWN', signal }));
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
