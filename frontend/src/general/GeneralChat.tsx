import { useMemo, useState } from 'react';
import { MessageBubble } from '../chat/MessageBubble';
import { TypingIndicator } from '../chat/TypingIndicator';
import { useChat } from '../hooks/useChat';
import { useSessionStore } from '../store/sessionStore';

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
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {generalMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {activeTab === 'general' && isStreamingGlobal && (
          streamingText ? (
            <MessageBubble
              message={{
                id: 'streaming',
                role: 'assistant',
                content: streamingText,
              }}
            />
          ) : (
            <TypingIndicator />
          )
        )}
      </div>
      <div className="border-t border-border-ter p-4">
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
            className="flex-1 rounded border border-border-ter bg-bg-secondary px-3 py-2 text-sm text-text-pri outline-none placeholder:text-text-ter"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isStreaming || !value.trim()}
            className="rounded bg-text-pri px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
