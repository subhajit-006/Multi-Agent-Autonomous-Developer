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
      const sseUrl = `/api/pipeline/stream/${runId}`;
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
        const runStatus = typeof data.status === 'string' ? data.status.toLowerCase() : 'completed';
        const finalStep = typeof data.step === 'string' ? data.step.toLowerCase() : lastStep;

        if (finalStep) {
          emit({
            agent: finalStep,
            status: runStatus === 'failed' ? 'error' : 'done',
            message: runStatus === 'failed'
              ? `${finalStep} failed.`
              : `${finalStep} completed.`,
          });
        }

        closeSse();

        try {
          const responseRes = await fetch(`/api/pipeline/runs/${runId}/response`, {
            signal: controller.signal,
          });

          if (!responseRes.ok) {
            const text = await responseRes.text();
            throw new Error(`Failed to fetch final response (${responseRes.status}): ${text}`);
          }

          const payload = (await responseRes.json()) as RunHistoryPayload;
          const files = extractFilesFromRunResponse(payload);

          if (runStatus === 'completed' && files.length > 0) {
            try {
              await fetch(`/api/pipeline/runs/${runId}/materialize`, {
                method: 'POST',
                signal: controller.signal,
              });
            } catch {
              // non-blocking; UI still has generated files in memory
            }
          }

          emit({
            agent: 'system',
            status: 'pipeline_complete',
            message: runStatus === 'failed' ? 'Pipeline failed.' : 'Pipeline complete.',
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
