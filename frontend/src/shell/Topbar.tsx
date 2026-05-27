import { useSessionStore } from '../store/sessionStore';
import { exportWorkingCopy } from '../api/workingCopy';

export function Topbar() {
  const templateName = useSessionStore((state) => state.templateName);
  const sessionId = useSessionStore((state) => state.sessionId);
  const langLocal = useSessionStore((state) => state.langLocal);
  const paramCustBrand = useSessionStore((state) => state.paramCustBrand);

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
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <div>
        <h1 className="text-lg font-semibold">StrongMail Agent Studio</h1>
        <p className="text-sm text-slate-500">
          {templateName
            ? `${templateName} · ${langLocal} · ${paramCustBrand}`
            : 'Select a template to begin'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={!sessionId}
        className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export
      </button>
    </header>
  );
}
