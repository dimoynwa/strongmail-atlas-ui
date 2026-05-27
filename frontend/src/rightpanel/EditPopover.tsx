import { useState } from 'react';
import { useSessionStore } from '../store/sessionStore';

interface EditPopoverProps {
  keyName: string;
  initialValue: string;
  onClose: () => void;
}

export function EditPopover({ keyName, initialValue, onClose }: EditPopoverProps) {
  const [value, setValue] = useState(initialValue);
  const patchWorkingCopy = useSessionStore((state) => state.patchWorkingCopy);

  const handleSave = async () => {
    await patchWorkingCopy({ [keyName]: value });
    onClose();
  };

  return (
    <div className="absolute right-0 top-full z-10 mt-1 w-64 rounded border border-slate-200 bg-white p-3 shadow-lg">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onClose();
          }
          if (event.key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            void handleSave();
          }
        }}
        className="min-h-[80px] w-full rounded border border-slate-200 px-2 py-1 text-xs"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" className="rounded border px-2 py-1 text-xs" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="rounded bg-slate-900 px-2 py-1 text-xs text-white"
          onClick={() => void handleSave()}
        >
          Save
        </button>
      </div>
    </div>
  );
}
