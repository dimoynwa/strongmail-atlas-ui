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
    <div className="flex h-12 flex-shrink-0 items-center border-t border-border-ter bg-bg-primary px-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void handleSubmit();
            }
          }}
          placeholder={sessionId ? 'Ask about this template…' : 'Open a template first'}
          disabled={!sessionId || isStreaming}
          className="flex-1 rounded-full border border-border-ter bg-bg-secondary px-3 py-1.5 text-[12px] outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!sessionId || isStreaming || !value.trim()}
          className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-bg-info disabled:opacity-50"
        >
          <i className="ti ti-arrow-up text-[14px] text-text-info" />
        </button>
      </div>
    </div>
  );
}
