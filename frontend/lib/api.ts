export interface PipelineEvent {
  agent: string;
  status: 'running' | 'done' | 'error' | 'pipeline_complete';
  message: string;
  output?: string;
  files?: Array<{ filename: string; language: string; content: string }>;
}

interface RunResponse {
  run_id: string;
  status: string;
  backend_api_url?: string;
}

interface RunHistoryPayload {
  run_id: string;
  steps?: Array<{
    step?: string;
    memory?: string | Record<string, any>;
    timestamp?: string;
  }>;
  total_steps?: number;
}

const DEFAULT_AGENT_ORDER = ['planner', 'architect', 'developer', 'debugger', 'tester'];

const parseJsonSafe = (value: any) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeFiles = (items: any[]): Array<{ filename: string; language: string; content: string }> => {
  return items
    .filter((item) => item && typeof item === 'object')
    .map((f) => ({
      filename: f.filename || f.name || 'unknown',
      language: f.language || (f.filename?.split('.').pop()) || 'text',
      content: typeof f.content === 'string' ? f.content : '',
    }));
};

const extractFilesFromRunResponse = (payload: RunHistoryPayload): Array<{ filename: string; language: string; content: string }> => {
  const seen = new Map<string, { filename: string; language: string; content: string }>();

  for (const step of payload.steps || []) {
    const memory = parseJsonSafe(step?.memory) || {};
    const fileContainer = memory?.files;
    const fileList = Array.isArray(fileContainer?.files)
      ? fileContainer.files
      : Array.isArray(fileContainer)
        ? fileContainer
        : [];

    for (const file of normalizeFiles(fileList)) {
      seen.set(file.filename, file);
    }
  }

  return Array.from(seen.values());
};

const getBackendBaseUrl = (value?: string): string => {
  if (value) return value.replace(/\/$/, '');
  if (process.env.NEXT_PUBLIC_BACKEND_API_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_API_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const url = new URL(window.location.origin);
    if (url.port === '3000') {
      url.port = '8000';
    }
    return url.origin.replace(/\/$/, '');
  }

  return 'http://localhost:8000';
};

export const runPipeline = (task: string, scope: string) => {
  const startUrl = '/api/pipeline';

  let onMessageCallback: ((data: PipelineEvent) => void) | null = null;
  let onErrorCallback: ((err: any) => void) | null = null;
  let cancelled = false;
  const controller = new AbortController();
  let eventSource: EventSource | null = null;

  const emit = (event: PipelineEvent) => {
    if (!cancelled) {
      onMessageCallback?.(event);
    }
  };

  const fail = (err: any) => {
    if (cancelled || err?.name === 'AbortError') return;
    onErrorCallback?.(err);
  };

  const closeSse = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };

  (async () => {
    try {
      const startRes = await fetch(startUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, scope }),
        signal: controller.signal,
      });

      if (!startRes.ok) {
        const text = await startRes.text();
        throw new Error(`Failed to start pipeline (${startRes.status}): ${text}`);
      }

      const runData = (await startRes.json()) as RunResponse;
      if (!runData?.run_id) {
        throw new Error('Pipeline start response did not include run_id');
      }

      const runId = runData.run_id;
      const backendBase = getBackendBaseUrl(runData.backend_api_url);
      const sseUrl = `${backendBase}/stream/${runId}`;
      let lastStep: string | null = null;

      emit({
        agent: 'system',
        status: 'running',
        message: `Pipeline started. Run ID: ${runId}`,
      });

      eventSource = new EventSource(sseUrl);

      eventSource.addEventListener('progress', (event) => {
        if (cancelled) return;

        const data = parseJsonSafe((event as MessageEvent).data) || {};
        const step = typeof data.step === 'string' ? data.step.toLowerCase() : '';
        if (!step) return;

        if (lastStep && lastStep !== step) {
          emit({
            agent: lastStep,
            status: 'done',
            message: `${lastStep} completed.`,
          });
        }

        lastStep = step;

        emit({
          agent: step,
          status: 'running',
          message: `${step} is working...`,
        });
      });

      eventSource.addEventListener('done', async (event) => {
        if (cancelled) return;

        const data = parseJsonSafe((event as MessageEvent).data) || {};
        const finalStep = typeof data.step === 'string' ? data.step.toLowerCase() : lastStep;

        if (finalStep) {
          emit({
            agent: finalStep,
            status: 'done',
            message: `${finalStep} completed.`,
          });
        }

        closeSse();

        try {
          const responseRes = await fetch(`${backendBase}/runs/${runId}/response`, {
            signal: controller.signal,
          });

          if (!responseRes.ok) {
            const text = await responseRes.text();
            throw new Error(`Failed to fetch final response (${responseRes.status}): ${text}`);
          }

          const payload = (await responseRes.json()) as RunHistoryPayload;
          const files = extractFilesFromRunResponse(payload);

          // Backend currently runs planner+architect+developer by default.
          // Mark remaining phases as done so UI does not stay stuck in idle.
          const completedSet = new Set<string>();
          for (const stepItem of payload.steps || []) {
            if (typeof stepItem.step === 'string') {
              const normalized = stepItem.step.toLowerCase();
              if (DEFAULT_AGENT_ORDER.includes(normalized)) {
                completedSet.add(normalized);
              }
            }
          }

          for (const agent of DEFAULT_AGENT_ORDER) {
            if (!completedSet.has(agent)) {
              emit({
                agent,
                status: 'done',
                message: `${agent} skipped in current backend flow.`,
              });
            }
          }

          emit({
            agent: 'system',
            status: 'pipeline_complete',
            message: data.status === 'failed' ? 'Pipeline failed.' : 'Pipeline complete.',
            files,
          });
        } catch (err) {
          fail(err);
        }
      });

      eventSource.addEventListener('error', (event) => {
        closeSse();
        fail(new Error(`SSE connection failed for run ${runId}`));
      });
    } catch (err) {
      fail(err);
    }
  })();

  return {
    subscribe: (callback: (data: PipelineEvent) => void, errCallback?: (err: any) => void) => {
      onMessageCallback = callback;
      if (errCallback) onErrorCallback = errCallback;
    },
    cancel: () => {
      cancelled = true;
      closeSse();
      controller.abort();
    },
  };
};
