import { useState } from 'react';
import { useSessionStore } from '../store/sessionStore';

export function ChatInput() {
  const [value, setValue] = useState('');
  const sendMessage = useSessionStore((state) => state.sendMessage);
  const sessionId = useSessionStore((state) => state.sessionId);
  const isStreaming = useSessionStore((state) => state.isStreaming);

  const handleSubmit = async () => {
    if (!value.trim() || !sessionId || isStreaming) return;
    await sendMessage(value);
    setValue('');
  };

  return (
    <div className="border-t border-slate-200 p-4">
      <div className="flex gap-2">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit();
            }
          }}
          placeholder={sessionId ? 'Ask the assistant…' : 'Open a template first'}
          disabled={!sessionId || isStreaming}
          className="min-h-[72px] flex-1 resize-none rounded border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!sessionId || isStreaming || !value.trim()}
          className="self-end rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
