import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/pipeline
 *
 * Server-side proxy that forwards the pipeline request to n8n.
 * This avoids CORS issues when the browser calls n8n cloud directly.
 */
export async function POST(request: NextRequest) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK;

  if (!webhookUrl) {
    console.error('[/api/pipeline] N8N_WEBHOOK_URL is not set in environment');
    return NextResponse.json(
      { error: 'N8N_WEBHOOK_URL is not configured in .env' },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  console.log(`[/api/pipeline] Forwarding to n8n: ${webhookUrl}`);
  console.log(`[/api/pipeline] Payload:`, body);

  // Use a manual timeout via AbortController (compatible with all Node versions)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300_000); // 5 minutes

  try {
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await n8nResponse.text();
    console.log(`[/api/pipeline] n8n status: ${n8nResponse.status}`);
    console.log(`[/api/pipeline] n8n response: ${responseText.slice(0, 500)}`);

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      // n8n returned non-JSON (e.g. plain error text)
      return NextResponse.json(
        { error: 'n8n returned non-JSON', raw: responseText },
        { status: n8nResponse.status }
      );
    }

    return NextResponse.json(data, { status: n8nResponse.status });

  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err?.name === 'AbortError';
    console.error('[/api/pipeline] Error:', err?.message);
    return NextResponse.json(
      {
        error: isTimeout ? 'Pipeline timed out after 5 minutes' : 'Failed to reach n8n',
        details: err?.message,
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}

