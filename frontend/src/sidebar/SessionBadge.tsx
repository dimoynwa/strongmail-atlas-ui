import { useSessionStore } from '../store/sessionStore';

export function SessionBadge() {
  const sessionId = useSessionStore((state) => state.sessionId);
  const templateName = useSessionStore((state) => state.templateName);
  const editCount = useSessionStore((state) => state.editCount);
  const langLocal = useSessionStore((state) => state.langLocal);
  const paramCustBrand = useSessionStore((state) => state.paramCustBrand);

  if (!sessionId) {
    return (
      <div className="px-2 py-1.5 text-[10px] text-text-ter">No active session</div>
    );
  }

  return (
    <div className="mx-2 my-1.5 rounded-md border border-border-success bg-bg-success px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-[0.04em] text-text-success">
        Active session
      </div>
      <div className="mt-0.5 text-[11px] font-medium text-text-pri">{templateName}</div>
      <div className="mt-0.5 text-[10px] text-text-ter">
        {langLocal} · {paramCustBrand} · {editCount} edits
      </div>
    </div>
  );
}
