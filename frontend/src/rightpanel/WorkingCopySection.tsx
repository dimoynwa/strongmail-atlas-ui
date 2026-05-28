import { useState } from 'react';
import { WorkingCopyTable } from './WorkingCopyTable';
import { useSessionStore } from '../store/sessionStore';

export function WorkingCopySection() {
  const [expanded, setExpanded] = useState(true);
  const resetWorkingCopy = useSessionStore((state) => state.resetWorkingCopy);
  const undoTone = useSessionStore((state) => state.undoTone);
  const sessionId = useSessionStore((state) => state.sessionId);
  const editCount = useSessionStore((state) => state.editCount);
  const toneKeyCount = useSessionStore((state) => state.toneKeyCount);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <button
        type="button"
        className="flex w-full flex-shrink-0 items-center gap-1.5 border-b border-border-ter px-2.5 py-2"
        onClick={() => setExpanded((v) => !v)}
      >
        <i className="ti ti-table text-[14px] text-text-sec" />
        <span className="flex-1 text-left text-[11px] font-medium text-text-sec">
          Working copy
        </span>
        {sessionId && editCount > 0 && (
          <span className="rounded-full bg-bg-warning px-1.5 py-0.5 text-[10px] text-text-warning">
            {editCount} {editCount === 1 ? 'edit' : 'edits'}
          </span>
        )}
        <i
          className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'} text-[13px] text-text-ter`}
        />
      </button>
      {expanded && (
        <>
          {sessionId && (
            <div className="flex-shrink-0 px-2.5 pb-1 text-[10px] text-text-ter">
              {toneKeyCount} tone-affecting {toneKeyCount === 1 ? 'key' : 'keys'}
            </div>
          )}
          <WorkingCopyTable />
          <div className="flex flex-shrink-0 gap-2 px-2.5 pb-2">
            <button
              type="button"
              disabled={!sessionId}
              onClick={() => void resetWorkingCopy()}
              className="rounded border border-border-ter px-2 py-0.5 text-[10px] text-text-sec hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              ↺ Reset all
            </button>
            <button
              type="button"
              disabled={!sessionId}
              onClick={() => void undoTone()}
              className="rounded border border-border-ter px-2 py-0.5 text-[10px] text-text-sec hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              ↩ Undo tone
            </button>
          </div>
        </>
      )}
    </section>
  );
}
