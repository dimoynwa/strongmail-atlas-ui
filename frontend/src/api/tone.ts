import { apiFetch } from './client';
import { MaintenanceApiError } from './maintenanceError';
import { parseProgressSSEChunk } from './sseParser';
import { useAppStore } from '../store/appStore';
import type { ToneScores } from '../types';
import type { ProgressEvent } from '../types/maintenance';

interface EmotionsResponse {
  emotions: Record<string, number> | null;
}

export interface ToneEvaluateResult {
  scores: ToneScores;
  baselineScores: ToneScores | null;
}

const EMPTY_TONE_SCORES: ToneScores = {
  urgency: 0,
  anger: 0,
  fear: 0,
  admiration: 0,
  approval: 0,
  gratitude: 0,
  joy: 0,
  amusement: 0,
  excitement: 0,
  neutral: 0,
};

function normalizeEmotions(
  emotions: Record<string, number> | null | undefined,
): ToneScores {
  const scores: ToneScores = { ...EMPTY_TONE_SCORES };

  if (!emotions) {
    return scores;
  }

  for (const [emotion, value] of Object.entries(emotions)) {
    scores[emotion] = value <= 1 ? Math.round(value * 100) : Math.round(value);
  }

  return scores;
}

export async function evaluateTone(sessionId: string): Promise<ToneEvaluateResult> {
  const [current, stored] = await Promise.all([
    apiFetch<EmotionsResponse>(`/tone/evaluate/${sessionId}`, { method: 'POST' }),
    apiFetch<EmotionsResponse>(`/tone/stored/${sessionId}`),
  ]);

  return {
    scores: normalizeEmotions(current.emotions),
    baselineScores: stored.emotions ? normalizeEmotions(stored.emotions) : null,
  };
}

export async function applyTone(
  sessionId: string,
  keys?: string[],
): Promise<void> {
  const body = keys && keys.length > 0 ? { keys } : {};
  await apiFetch(`/tone/apply/${sessionId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function undoTone(sessionId: string): Promise<void> {
  await apiFetch(`/tone/undo/${sessionId}`, {
    method: 'POST',
  });
}

interface StartToneJobApiResponse {
  job_id: string;
  status?: string;
  started_at?: string;
}

interface ConflictApiResponse {
  error?: string;
  message?: string;
  locked_by?: string;
}

export interface StartBatchReevaluateResult {
  job_id: string;
  status: string;
  started_at: string;
}

async function parseToneErrorBody(response: Response): Promise<{
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

export async function startBatchReevaluate(): Promise<StartBatchReevaluateResult> {
  const response = await fetch('/tone/batch-reevaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.status === 409) {
    const { message, lockedBy } = await parseToneErrorBody(response);
    throw new MaintenanceApiError(message, 409, null, lockedBy);
  }

  if (response.status !== 200 && response.status !== 202) {
    const { message } = await parseToneErrorBody(response);
    throw new MaintenanceApiError(message, response.status);
  }

  const body = (await response.json()) as StartToneJobApiResponse;
  if (!body.job_id) {
    throw new MaintenanceApiError('Missing job_id in response', response.status);
  }

  return {
    job_id: body.job_id,
    status: body.status ?? 'pending',
    started_at: body.started_at ?? new Date().toISOString(),
  };
}

export function streamBatchTone(
  job_id: string,
  onEvent: (event: ProgressEvent) => void,
): AbortController {
  const controller = new AbortController();

  void (async () => {
    let response: Response;
    try {
      response = await fetch(`/tone/batch-stream/${encodeURIComponent(job_id)}`, {
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

export async function exportTone(format: 'csv' | 'xlsx'): Promise<void> {
  const response = await fetch(`/tone/export?format=${format}`);

  if (!response.ok) {
    let message = `Export failed: ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string; detail?: string };
      message = body.message ?? body.detail ?? message;
    } catch {
      try {
        message = await response.text();
      } catch {
        // keep default message
      }
    }
    useAppStore.getState().addToast(message, 'error');
    return;
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `tone-export.${format}`;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
