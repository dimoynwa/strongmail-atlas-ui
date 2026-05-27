import { useState } from 'react';
import { WorkingCopyTable } from './WorkingCopyTable';
import { useSessionStore } from '../store/sessionStore';

export function WorkingCopySection() {
  const [expanded, setExpanded] = useState(true);
  const resetWorkingCopy = useSessionStore((state) => state.resetWorkingCopy);
  const sessionId = useSessionStore((state) => state.sessionId);

  return (
    <section className="border-b border-slate-200">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium"
        onClick={() => setExpanded((value) => !value)}
      >
        Working Copy
        <span>{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <>
          <WorkingCopyTable />
          <div className="px-4 pb-3">
            <button
              type="button"
              disabled={!sessionId}
              onClick={() => void resetWorkingCopy()}
              className="rounded border px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset all
            </button>
          </div>
        </>
      )}
    </section>
  );
}
