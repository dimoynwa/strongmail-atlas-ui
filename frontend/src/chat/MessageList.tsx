import { useSessionStore } from '../store/sessionStore';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { DiffCard } from './DiffCard';

export function MessageList() {
  const messages = useSessionStore((state) => state.messages);
  const streamingText = useSessionStore((state) => state.streamingText);
  const isStreaming = useSessionStore((state) => state.isStreaming);
  const activeTool = useSessionStore((state) => state.activeTool);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
      {messages.map((message) => (
        <div key={message.id}>
          <MessageBubble message={message} />
          {message.diff && (
            <DiffCard messageId={message.id} diff={message.diff} snapshotOverwritten={message.snapshotOverwritten} />
          )}
        </div>
      ))}
      {isStreaming && (
        <>
          {activeTool && (
            <div className="mb-1 flex w-fit items-center gap-1 rounded-full border border-border-ter bg-bg-primary px-2 py-0.5 text-[10px] text-text-ter">
              <i className="ti ti-cpu text-[11px]" />
              {activeTool}
            </div>
          )}
          {streamingText ? (
            <MessageBubble
              message={{
                id: 'streaming',
                role: 'assistant',
                content: streamingText,
              }}
            />
          ) : (
            <TypingIndicator />
          )}
        </>
      )}
    </div>
  );
}
