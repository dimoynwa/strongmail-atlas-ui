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
      <div className="px-4 pb-3 text-xs text-slate-500">
        No working copy available
      </div>
    );
  }

  return (
    <div className="px-4 pb-3">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-slate-500">
            <th className="pb-1">Key</th>
            <th className="pb-1">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(workingCopy).map(([key, value]) => (
            <tr key={key} className="relative border-t border-slate-100">
              <td
                className={`py-2 pr-2 align-top font-medium ${
                  modifiedKeys.has(key) ? 'text-green-700' : ''
                }`}
              >
                {key}
              </td>
              <td className="py-2 align-top">
                <button
                  type="button"
                  className="text-left hover:underline"
                  onClick={() => setEditingKey(key)}
                >
                  {value}
                </button>
                {editingKey === key && (
                  <EditPopover
                    keyName={key}
                    initialValue={value}
                    onClose={() => setEditingKey(null)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
