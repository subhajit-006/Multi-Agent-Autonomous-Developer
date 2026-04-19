import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/pipeline
 *
 * Server-side proxy that starts the FastAPI pipeline run.
 * Returns run_id immediately; client consumes SSE + response endpoints after that.
 */
export async function POST(request: NextRequest) {
  const configuredBase = process.env.BACKEND_API_URL;
  const rawCandidates = [
    configuredBase,
    'http://localhost:8000',
    'http://127.0.0.1:8000',
  ].filter(Boolean) as string[];

  const backendCandidates = Array.from(
    new Set(
      rawCandidates.map((candidate) => {
        const withScheme = /^https?:\/\//i.test(candidate) ? candidate : `http://${candidate}`;
        return withScheme.replace(/\/$/, '');
      })
    )
  );

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const requestPayload = {
    task: body.task,
    scope: (body.scope || 'standard').toLowerCase(),
    // debugger/tester are currently disabled in backend flow validation.
    flow: Array.isArray(body.flow) && body.flow.length > 0
      ? body.flow
      : ['planner', 'architect', 'developer'],
  };

  let lastNetworkError: string | null = null;

  for (const base of backendCandidates) {
    const normalizedBackend = base.replace(/\/$/, '');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    try {
      const backendResponse = await fetch(`${normalizedBackend}/pipeline/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseText = await backendResponse.text();

      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        return NextResponse.json(
          { error: 'Backend returned non-JSON', raw: responseText, backend: normalizedBackend },
          { status: backendResponse.status }
        );
      }

      return NextResponse.json(
        {
          run_id: data?.run_id,
          status: data?.status,
          backend_api_url: normalizedBackend,
        },
        { status: backendResponse.status }
      );
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err?.name === 'AbortError';
      lastNetworkError = isTimeout
        ? `Timed out while reaching ${normalizedBackend}`
        : `Failed to reach ${normalizedBackend}: ${err?.message || 'Unknown error'}`;
    }
  }

  return NextResponse.json(
    {
      error: 'Failed to reach backend for pipeline start',
      details: lastNetworkError,
      candidates: backendCandidates,
    },
    { status: 502 }
  );
}

