export interface PipelineEvent {
  agent: string;
  status: 'running' | 'done' | 'error' | 'pipeline_complete';
  message: string;
  output?: string;
  files?: Array<{ filename: string; language: string; content: string }>;
}

export const runPipeline = (task: string, scope: string) => {
  // Call our local Next.js proxy (which forwards to n8n server-side, avoiding CORS)
  const webhookUrl = '/api/pipeline';

  let onMessageCallback: ((data: PipelineEvent) => void) | null = null;
  let onErrorCallback: ((err: any) => void) | null = null;
  let cancelled = false;

  // Simulate progress ticks while n8n is working (so UI doesn't feel frozen)
  const agents = ['planner', 'architect', 'developer', 'debugger', 'tester'];
  let agentIndex = 0;
  const progressTimer = setInterval(() => {
    if (cancelled || agentIndex >= agents.length) return;
    const agent = agents[agentIndex++];
    onMessageCallback?.({
      agent,
      status: 'running',
      message: `${agent.charAt(0).toUpperCase() + agent.slice(1)} is working...`,
    });
  }, 4000);

  // Fire the webhook and await the final combined response
  const controller = new AbortController();

  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, scope }),
    signal: controller.signal,
  })
    .then(async (res) => {
      clearInterval(progressTimer);
      if (cancelled) return;

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`n8n returned ${res.status}: ${text}`);
      }

      const data = await res.json();

      // Mark any agents not yet ticked as done
      for (let i = agentIndex; i < agents.length; i++) {
        onMessageCallback?.({ agent: agents[i], status: 'done', message: `${agents[i]} completed.` });
      }

      // Build files array from n8n response
      const files: PipelineEvent['files'] = (data.files || []).map((f: any) => ({
        filename: f.filename || f.name || 'unknown',
        language: f.language || (f.filename?.split('.').pop()) || 'text',
        content: f.content || '',
      }));

      // Fire pipeline_complete with all generated files
      onMessageCallback?.({
        agent: 'system',
        status: 'pipeline_complete',
        message: data.status === 'error' ? (data.message || 'Pipeline failed') : 'Pipeline complete.',
        files,
      });
    })
    .catch((err) => {
      clearInterval(progressTimer);
      if (cancelled || err.name === 'AbortError') return;
      console.error('Pipeline fetch failed:', err);
      onErrorCallback?.(err);
    });

  return {
    subscribe: (callback: (data: PipelineEvent) => void, errCallback?: (err: any) => void) => {
      onMessageCallback = callback;
      if (errCallback) onErrorCallback = errCallback;
    },
    cancel: () => {
      cancelled = true;
      clearInterval(progressTimer);
      controller.abort();
    },
  };
};
