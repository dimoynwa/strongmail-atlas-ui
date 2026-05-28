import { ChatLabelBar } from './ChatLabelBar';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { QuickActionChips } from './QuickActionChips';

export function ChatSection() {
  return (
    <div className="chat-section bg-bg-primary">
      <ChatLabelBar />
      <MessageList />
      <QuickActionChips />
      <ChatInput />
    </div>
  );
}
