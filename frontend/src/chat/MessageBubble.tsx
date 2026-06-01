import type { Message } from '../types';
import { MarkdownContent } from './MarkdownContent';
import { ToolChip } from './ToolChip';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isUser
            ? 'bg-text-pri text-white'
            : message.isError
              ? 'bg-bg-secondary text-text-danger'
              : 'bg-bg-secondary text-text-pri'
        }`}
      >
        {message.toolName && <ToolChip name={message.toolName} />}
        <MarkdownContent
          content={message.content}
          variant={isUser ? 'user' : message.isError ? 'error' : 'assistant'}
        />
      </div>
    </div>
  );
}
