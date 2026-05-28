import { useState } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { EditPopover } from './EditPopover';

export function WorkingCopyTable() {
  const workingCopy = useSessionStore((state) => state.workingCopy);
  const modifiedKeys = useSessionStore((state) => state.modifiedKeys);
  const sessionId = useSessionStore((state) => state.sessionId);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  if (!sessionId) {
    return (
      <div className="px-2.5 pb-2 text-[10px] text-text-ter">
        No working copy available
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-2.5">
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr className="text-text-sec">
            <th className="pb-1 font-medium">Key</th>
            <th className="pb-1 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(workingCopy ?? {}).map(([key, value]) => (
            <tr key={key} className="border-t border-border-ter">
              <td
                className={`py-1.5 pr-2 align-top font-mono text-[11px] font-medium ${
                  modifiedKeys.has(key) ? 'text-text-success' : 'text-text-pri'
                }`}
              >
                {key}
              </td>
              <td className="py-1.5 align-top text-[11px] text-text-sec">
                {editingKey === key ? (
                  <EditPopover
                    keyName={key}
                    initialValue={value}
                    onClose={() => setEditingKey(null)}
                  />
                ) : (
                  <button
                    type="button"
                    aria-label={`Edit ${key}`}
                    className="block min-h-6 w-full text-left hover:underline"
                    onClick={() => setEditingKey(key)}
                  >
                    {value !== '' ? (
                      value
                    ) : (
                      <span className="italic text-text-ter">Empty — click to edit</span>
                    )}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
