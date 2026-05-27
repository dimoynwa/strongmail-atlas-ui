import { useState, useMemo } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { useChat } from '../hooks/useChat';

export function GeneralChat() {
  const [value, setValue] = useState('');
  const { sendMessage, isStreaming } = useChat();
  const messages = useSessionStore((state) => state.messages);
  const generalMessages = useMemo(
    () => messages.filter((message) => message.agent === 'general'),
    [messages],
  );
  const streamingText = useSessionStore((state) => state.streamingText);
  const activeTab = useSessionStore((state) => state.activeTab);
  const isStreamingGlobal = useSessionStore((state) => state.isStreaming);

  const handleSubmit = async () => {
    if (!value.trim() || isStreaming) return;
    await sendMessage(value, 'general');
    setValue('');
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {generalMessages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 text-sm ${message.role === 'user' ? 'text-right' : ''}`}
          >
            {message.content}
          </div>
        ))}
        {activeTab === 'general' && isStreamingGlobal && streamingText && (
          <div className="text-sm text-slate-500">{streamingText}</div>
        )}
      </div>
      <div className="border-t border-slate-200 p-4">
        <div className="flex gap-2">
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            placeholder="Ask about templates…"
            className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isStreaming || !value.trim()}
            className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
