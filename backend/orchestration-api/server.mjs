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
      webOrigin: webOrigin.origin
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
    availableRoutes: ['GET /health', 'GET /ready', 'GET /v1/catalog', 'POST /v1/transitions']
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
    allowedOriginCount: allowedOrigins.size
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
