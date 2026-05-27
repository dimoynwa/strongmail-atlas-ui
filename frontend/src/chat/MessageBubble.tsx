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
          isUser ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
        }`}
      >
        {message.toolName && <ToolChip name={message.toolName} />}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
