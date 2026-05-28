import { useEffect, useRef, useState } from 'react';
import { useSessionStore } from '../store/sessionStore';

interface EditPopoverProps {
  keyName: string;
  initialValue: string;
  onClose: () => void;
}

export function EditPopover({ keyName, initialValue, onClose }: EditPopoverProps) {
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const patchWorkingCopy = useSessionStore((state) => state.patchWorkingCopy);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  const handleSave = async () => {
    if (isSaving || value === initialValue) {
      onClose();
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await patchWorkingCopy({ [keyName]: value });
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save working copy';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded border border-border-ter bg-bg-secondary p-2">
      <textarea
        ref={textareaRef}
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
        disabled={isSaving}
        className="min-h-[72px] w-full rounded border border-border-ter bg-bg-primary px-2 py-1 text-[11px] text-text-pri outline-none disabled:opacity-50"
      />
      {saveError ? (
        <p className="mt-2 text-[10px] text-text-danger">{saveError}</p>
      ) : null}
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          className="rounded border border-border-ter px-2 py-1 text-[10px] text-text-sec hover:bg-bg-tertiary disabled:opacity-50"
          onClick={onClose}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded border border-border-info bg-bg-info px-2 py-1 text-[10px] text-text-info disabled:opacity-50"
          onClick={() => void handleSave()}
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
