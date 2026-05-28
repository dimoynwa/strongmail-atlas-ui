import { useSessionStore } from '../store/sessionStore';
import { useToneDeltas } from '../hooks/useToneDeltas';
import { ToneBar } from './ToneBar';
import { ReEvaluateButton } from './ReEvaluateButton';

export function ToneSection() {
  const toneScores = useSessionStore((state) => state.toneScores);
  const toneStoredScores = useSessionStore((state) => state.toneStoredScores);
  const toneStale = useSessionStore((state) => state.toneStale);
  const sessionId = useSessionStore((state) => state.sessionId);
  const deltas = useToneDeltas(toneScores, toneStoredScores);

  return (
    <section className="px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Tone</h3>
        <ReEvaluateButton />
      </div>
      {!sessionId && (
        <p className="text-xs text-text-sec">Open a template to evaluate tone.</p>
      )}
      {toneStale && sessionId && (
        <p className="mb-2 rounded bg-bg-warning px-2 py-1 text-xs text-text-warning">
          Tone evaluation is stale. Re-evaluate to refresh scores.
        </p>
      )}
      <div className="space-y-3">
        {deltas.map((entry) => (
          <ToneBar
            key={entry.emotion}
            emotion={entry.emotion}
            current={entry.current}
            delta={entry.delta}
            direction={entry.direction}
          />
        ))}
      </div>
    </section>
  );
}
