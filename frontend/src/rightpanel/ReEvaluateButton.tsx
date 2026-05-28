import { useSessionStore } from '../store/sessionStore';

export function ReEvaluateButton() {
  const evaluateTone = useSessionStore((state) => state.evaluateTone);
  const sessionId = useSessionStore((state) => state.sessionId);

  return (
    <button
      type="button"
      disabled={!sessionId}
      onClick={() => void evaluateTone()}
      className="rounded border px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
    >
      Re-evaluate
    </button>
  );
}
