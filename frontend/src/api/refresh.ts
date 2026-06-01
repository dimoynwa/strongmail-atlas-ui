import { MaintenanceApiError } from './maintenanceError';
import { parseProgressSSEChunk } from './sseParser';
import type { ProgressEvent } from '../types/maintenance';

interface StartJobApiResponse {
  job_id: string;
  status?: string;
  type?: string;
  target?: string;
  started_at?: string;
}

interface ConflictApiResponse {
  error?: string;
  message?: string;
  locked_by?: string;
}

export interface StartTemplateRefreshResult {
  job_id: string;
  status: string;
  type: 'template';
  target: string;
  started_at: string;
}

export interface StartFullRefreshResult {
  job_id: string;
  status: string;
  type: 'full';
  started_at: string;
}

async function parseErrorBody(response: Response): Promise<{
  message: string;
  lockedBy?: string;
}> {
  try {
    const body = (await response.json()) as ConflictApiResponse;
    return {
      message: body.message ?? body.error ?? `Request failed: ${response.status}`,
      lockedBy: body.locked_by,
    };
  } catch {
    return { message: `Request failed: ${response.status}` };
  }
}

function assertStartResponse(
  response: Response,
  body: StartJobApiResponse,
  defaults: { type: 'template' | 'full'; target?: string },
): asserts body is StartJobApiResponse & { job_id: string } {
  if (response.status !== 200 && response.status !== 202) {
    throw new MaintenanceApiError(
      `Unexpected status: ${response.status}`,
      response.status,
    );
  }
  if (!body.job_id) {
    throw new MaintenanceApiError('Missing job_id in response', response.status);
  }
  void defaults;
}

export async function startTemplateRefresh(
  templateName: string,
): Promise<StartTemplateRefreshResult> {
  const response = await fetch(`/refresh/template/${encodeURIComponent(templateName)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.status === 409) {
    const { message, lockedBy } = await parseErrorBody(response);
    throw new MaintenanceApiError(message, 409, null, lockedBy);
  }

  if (!response.ok) {
    const { message } = await parseErrorBody(response);
    throw new MaintenanceApiError(message, response.status);
  }

  const body = (await response.json()) as StartJobApiResponse;
  assertStartResponse(response, body, { type: 'template', target: templateName });

  return {
    job_id: body.job_id,
    status: body.status ?? 'pending',
    type: 'template',
    target: body.target ?? templateName,
    started_at: body.started_at ?? new Date().toISOString(),
  };
}

export async function startFullRefresh(): Promise<StartFullRefreshResult> {
  const response = await fetch('/refresh/full', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.status === 409) {
    const { message, lockedBy } = await parseErrorBody(response);
    throw new MaintenanceApiError(message, 409, null, lockedBy);
  }

  if (!response.ok) {
    const { message } = await parseErrorBody(response);
    throw new MaintenanceApiError(message, response.status);
  }

  const body = (await response.json()) as StartJobApiResponse;
  assertStartResponse(response, body, { type: 'full' });

  return {
    job_id: body.job_id,
    status: body.status ?? 'pending',
    type: 'full',
    started_at: body.started_at ?? new Date().toISOString(),
  };
}

export function streamRefreshJob(
  job_id: string,
  onEvent: (event: ProgressEvent) => void,
): AbortController {
  const controller = new AbortController();

  void (async () => {
    let response: Response;
    try {
      response = await fetch(`/refresh/stream/${encodeURIComponent(job_id)}`, {
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      onEvent({
        type: 'job_failed',
        message: error instanceof Error ? error.message : 'Stream connection failed',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!response.ok || !response.body) {
      onEvent({
        type: 'job_failed',
        message: `Stream failed: ${response.status}`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const { events, remainder } = parseProgressSSEChunk(buffer);
        buffer = remainder;

        for (const event of events) {
          onEvent(event);
          if (event.type === 'job_done' || event.type === 'job_failed') {
            return;
          }
        }
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      onEvent({
        type: 'job_failed',
        message: error instanceof Error ? error.message : 'Stream read failed',
        timestamp: new Date().toISOString(),
      });
    }
  })();

  return controller;
}
