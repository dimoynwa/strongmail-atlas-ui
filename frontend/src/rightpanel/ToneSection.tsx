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
    <section className="flex flex-shrink-0 flex-col">
      <div className="flex items-center gap-1.5 border-b border-border-ter px-2.5 py-2">
        <i className="ti ti-mood-check text-[14px] text-text-sec" />
        <span className="flex-1 text-[11px] font-medium text-text-sec">Tone</span>
        {toneScores && !toneStale && (
          <span className="rounded-full bg-bg-success px-2 py-0.5 text-[10px] text-text-success">
            fresh
          </span>
        )}
        {toneStale && (
          <span className="rounded-full bg-bg-warning px-2 py-0.5 text-[10px] text-text-warning">
            stale
          </span>
        )}
        <ReEvaluateButton />
      </div>
      {!sessionId && (
        <p className="px-2.5 py-2 text-[10px] text-text-ter">Open a template to evaluate tone.</p>
      )}
      {toneStale && sessionId && (
        <p className="mx-2.5 mb-2 rounded bg-bg-warning px-2 py-1 text-[10px] text-text-warning">
          Tone evaluation is stale. Re-evaluate to refresh scores.
        </p>
      )}
      <div className="space-y-2 px-2.5 py-2">
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
