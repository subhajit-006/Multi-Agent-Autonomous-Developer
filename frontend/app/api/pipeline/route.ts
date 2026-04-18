import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/pipeline
 *
 * Server-side proxy that forwards the pipeline request to n8n.
 * This avoids CORS issues when the browser calls n8n cloud directly.
 */
export async function POST(request: NextRequest) {
  const backendApiUrl = process.env.BACKEND_API_URL;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  if (!backendApiUrl) {
    return NextResponse.json(
      { error: 'Set BACKEND_API_URL in frontend .env (example: http://localhost:8000)' },
      { status: 500 }
    );
  }

  const normalizedBackend = backendApiUrl.replace(/\/$/, '');

  // Keep timeout short here because /pipeline/run returns immediately with run_id.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    const backendResponse = await fetch(`${normalizedBackend}/pipeline/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: body.task,
        scope: (body.scope || 'standard').toLowerCase(),
        // debugger/tester are currently disabled in backend flow validation.
        flow: Array.isArray(body.flow) && body.flow.length > 0
          ? body.flow
          : ['planner', 'architect', 'developer'],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await backendResponse.text();

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: 'Backend returned non-JSON', raw: responseText },
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
    return NextResponse.json(
      {
        error: isTimeout ? 'Timed out while starting pipeline' : 'Failed to reach backend',
        details: err?.message,
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}

