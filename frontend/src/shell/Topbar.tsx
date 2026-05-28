import { useSessionStore } from '../store/sessionStore';
import { exportWorkingCopy } from '../api/workingCopy';

export function Topbar() {
  const templateName = useSessionStore((state) => state.templateName);
  const sessionId = useSessionStore((state) => state.sessionId);

  const handleExport = async () => {
    if (!sessionId) return;

    const blob = await exportWorkingCopy(sessionId);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${templateName ?? 'template'}-export.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="flex h-[42px] flex-shrink-0 items-center justify-between border-b border-border-ter bg-bg-primary px-3">
      <div className="flex items-center gap-1.5">
        <i className="ti ti-template text-[14px] text-text-sec" />
        {templateName && (
          <>
            <span className="text-[12px] text-text-sec">{templateName}</span>
            <i className="ti ti-chevron-right text-[12px] text-text-ter opacity-50" />
          </>
        )}
        <span className="text-[12px] font-medium text-text-pri">Template Assistant</span>
      </div>
      <div className="flex items-center gap-1.5">
        {sessionId && (
          <button
            type="button"
            className="flex items-center gap-1 rounded border border-border-warning bg-bg-warning px-2 py-1 text-[11px] text-text-warning"
          >
            <i className="ti ti-mood-smile text-[13px]" />
            Tone assist ↗
          </button>
        )}
        {sessionId && (
          <button
            type="button"
            onClick={() => void handleExport()}
            className="flex items-center gap-1 rounded border border-border-ter px-2 py-1 text-[11px] text-text-sec hover:bg-bg-secondary"
            title="Export working copy"
          >
            <i className="ti ti-download text-[13px]" />
          </button>
        )}
      </div>
    </header>
  );
}
