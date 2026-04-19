import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/pipeline/runs/{runId}/materialize
 *
 * Tells backend to write generated files from DB payload to disk.
 */
export async function POST(
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

  let lastError = 'Unknown backend materialize error';

  for (const base of backendCandidates) {
    try {
      const upstream = await fetch(
        `${base}/runs/${encodeURIComponent(runId)}/materialize`,
        {
          method: 'POST',
          cache: 'no-store',
        }
      );

      const text = await upstream.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: 'Backend returned non-JSON materialize payload', raw: text, backend: base },
          { status: upstream.status }
        );
      }

      return NextResponse.json(data, { status: upstream.status });
    } catch (err: any) {
      lastError = `Failed materialize request on ${base}: ${err?.message || 'Unknown error'}`;
    }
  }

  return NextResponse.json(
    { error: 'Unable to materialize run files in backend', details: lastError },
    { status: 502 }
  );
}
