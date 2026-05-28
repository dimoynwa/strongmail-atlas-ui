import { apiFetch } from './client';
import type { ToneScores } from '../types';

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
