import { useSessionStore } from '../store/sessionStore';

export function SidebarFooter() {
  const resetSession = useSessionStore((state) => state.resetSession);
  const sessionId = useSessionStore((state) => state.sessionId);

  return (
    <div className="border-t border-border-ter p-3">
      <button
        type="button"
        disabled={!sessionId}
        onClick={() => resetSession()}
        className="w-full rounded border border-border-sec px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Close session
      </button>
    </div>
  );
}
