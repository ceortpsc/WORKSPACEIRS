import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransition, type TransitionRequest } from '@ross/workflow-engine';

const MAX_BODY_BYTES = 64 * 1024;

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: 'PAYLOAD_TOO_LARGE', message: 'Transition requests are limited to 64 KB.' },
      { status: 413 }
    );
  }

  let payload: TransitionRequest;
  try {
    payload = (await request.json()) as TransitionRequest;
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'A valid JSON transition request is required.' },
      { status: 400 }
    );
  }

  if (!payload || typeof payload.transitionId !== 'string' || typeof payload.currentState !== 'string' || typeof payload.actor !== 'string' || typeof payload.evidence !== 'object' || payload.evidence === null) {
    return NextResponse.json(
      { error: 'INVALID_TRANSITION_REQUEST', message: 'transitionId, currentState, actor and evidence are required.' },
      { status: 422 }
    );
  }

  const decision = evaluateTransition(payload);
  const correlationId = crypto.randomUUID();

  return NextResponse.json(
    {
      contract: 'rtpsc.workflow-decision.v1',
      correlationId,
      evaluatedAt: new Date().toISOString(),
      decision
    },
    {
      status: decision.allowed ? 200 : 409,
      headers: {
        'Cache-Control': 'no-store',
        'X-Correlation-ID': correlationId,
        'X-Content-Type-Options': 'nosniff'
      }
    }
  );
}
