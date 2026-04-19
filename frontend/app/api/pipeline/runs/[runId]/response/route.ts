import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/pipeline/runs/{runId}/response
 *
 * Reads final persisted run payload from backend DB-backed endpoint.
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

  let lastError = 'Unknown backend response error';

  for (const base of backendCandidates) {
    const normalizedBackend = base;

    try {
      const upstream = await fetch(
        `${normalizedBackend}/runs/${encodeURIComponent(runId)}/response`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      const text = await upstream.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: 'Backend returned non-JSON response payload', raw: text, backend: normalizedBackend },
          { status: upstream.status }
        );
      }

      return NextResponse.json(data, { status: upstream.status });
    } catch (err: any) {
      lastError = `Failed response fetch on ${normalizedBackend}: ${err?.message || 'Unknown error'}`;
    }
  }

  return NextResponse.json(
    { error: 'Unable to read backend run response', details: lastError },
    { status: 502 }
  );
}
