import { useSessionStore } from '../store/sessionStore';

export function SessionBadge() {
  const sessionId = useSessionStore((state) => state.sessionId);
  const templateName = useSessionStore((state) => state.templateName);
  const editCount = useSessionStore((state) => state.editCount);

  if (!sessionId) {
    return (
      <div className="px-3 py-2 text-xs text-text-sec">No active session</div>
    );
  }

  return (
    <div className="border-b border-border-ter px-3 py-2 text-xs">
      <div className="font-medium">{templateName}</div>
      <div className="text-text-sec">Session: {sessionId.slice(0, 12)}…</div>
      <div className="text-text-sec">{editCount} edits</div>
    </div>
  );
}
