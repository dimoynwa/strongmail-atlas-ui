import { apiFetch } from './client';
import type { ToneScores } from '../types';

export interface ToneEvaluateResponse {
  scores: ToneScores;
  baseline_scores: ToneScores;
}

export function evaluateTone(sessionId: string): Promise<ToneEvaluateResponse> {
  return apiFetch<ToneEvaluateResponse>(`/tone/evaluate/${sessionId}`, {
    method: 'POST',
  });
}

export function applyTone(
  sessionId: string,
  keys?: string[],
): Promise<{ status: string }> {
  const body = keys && keys.length > 0 ? { keys } : {};
  return apiFetch<{ status: string }>(`/tone/apply/${sessionId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function undoTone(sessionId: string): Promise<{ status: string }> {
  return apiFetch<{ status: string }>(`/tone/undo/${sessionId}`, {
    method: 'POST',
  });
}
