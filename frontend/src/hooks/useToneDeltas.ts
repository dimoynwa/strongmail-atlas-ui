import { useMemo } from 'react';
import type { ToneScores } from '../types';

export interface ToneDelta {
  emotion: string;
  current: number;
  stored: number;
  delta: number;
  direction: 'up' | 'down' | 'flat';
}

export function useToneDeltas(
  toneScores: ToneScores | null,
  toneStoredScores: ToneScores | null,
): ToneDelta[] {
  return useMemo(() => {
    if (!toneScores) return [];

    const emotions = Object.keys(toneScores).filter(
      (key) => typeof toneScores[key] === 'number',
    );

    return emotions
      .map((emotion) => {
        const current = toneScores[emotion] ?? 0;
        const stored = toneStoredScores?.[emotion] ?? current;
        const delta = current - stored;
        const direction: ToneDelta['direction'] =
          delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';

        return { emotion, current, stored, delta, direction };
      })
      .sort((a, b) => b.current - a.current);
  }, [toneScores, toneStoredScores]);
}
