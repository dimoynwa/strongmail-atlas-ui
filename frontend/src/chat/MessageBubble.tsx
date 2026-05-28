import type { Message } from '../types';
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
          isUser ? 'bg-text-pri text-white' : 'bg-bg-secondary text-text-pri'
        }`}
      >
        {message.toolName && <ToolChip name={message.toolName} />}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
