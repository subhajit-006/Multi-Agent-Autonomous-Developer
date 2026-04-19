import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pipeline/stream/{runId}
 *
 * Proxies backend SSE stream so frontend can always connect to same-origin URL.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { runId: string } }
) {
  const runId = params?.runId;
  if (!runId) {
    return NextResponse.json({ error: 'runId is required' }, { status: 400 });
  }

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

  let lastError = 'Unknown backend stream error';

  for (const base of backendCandidates) {
    const normalizedBackend = base;
    try {
      const upstream = await fetch(`${normalizedBackend}/stream/${encodeURIComponent(runId)}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!upstream.ok || !upstream.body) {
        lastError = `Backend stream failed on ${normalizedBackend} with status ${upstream.status}`;
        continue;
      }

      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    } catch (err: any) {
      lastError = `Failed stream on ${normalizedBackend}: ${err?.message || 'Unknown error'}`;
    }
  }

  return NextResponse.json(
    { error: 'Unable to open backend stream', details: lastError },
    { status: 502 }
  );
}
