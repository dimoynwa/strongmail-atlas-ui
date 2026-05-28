import { useState } from 'react';
import { useSessionStore } from '../store/sessionStore';
import type { DiffPayload } from '../types';

interface DiffCardProps {
  messageId: string;
  diff: DiffPayload;
  snapshotOverwritten?: boolean;
}

export function DiffCard({ messageId, diff, snapshotOverwritten }: DiffCardProps) {
  const applyDiff = useSessionStore((state) => state.applyDiff);
  const removeDiffFromMessage = useSessionStore(
    (state) => state.removeDiffFromMessage,
  );
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [showSelect, setShowSelect] = useState(false);

  const keys = Object.keys(diff);

  const toggleKey = (key: string) => {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((entry) => entry !== key)
        : [...current, key],
    );
  };

  return (
    <div className="mt-2 rounded border border-border-ter bg-bg-primary p-3 text-sm">
      {snapshotOverwritten && (
        <div className="mb-2 rounded bg-bg-warning px-2 py-1 text-xs text-text-warning">
          Warning: a previous snapshot was overwritten.
        </div>
      )}
      <div className="space-y-2">
        {keys.map((key) => (
          <div key={key} className="rounded bg-bg-secondary p-2">
            <div className="font-medium">{key}</div>
            <div className="text-red-600 line-through">{diff[key].old}</div>
            <div className="text-green-700">{diff[key].new}</div>
            {showSelect && (
              <label className="mt-1 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={selectedKeys.includes(key)}
                  onChange={() => toggleKey(key)}
                />
                Select
              </label>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded bg-text-pri px-3 py-1 text-xs text-white"
          onClick={() => void applyDiff()}
        >
          Apply all
        </button>
        <button
          type="button"
          className="rounded border px-3 py-1 text-xs"
          onClick={() => setShowSelect((value) => !value)}
        >
          Apply selected
        </button>
        {showSelect && (
          <button
            type="button"
            className="rounded border px-3 py-1 text-xs"
            disabled={selectedKeys.length === 0}
            onClick={() => void applyDiff(selectedKeys)}
          >
            Confirm selected
          </button>
        )}
        <button
          type="button"
          className="rounded border px-3 py-1 text-xs"
          onClick={() => removeDiffFromMessage(messageId)}
        >
          Discard
        </button>
      </div>
    </div>
  );
}
