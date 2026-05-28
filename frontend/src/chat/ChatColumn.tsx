import { ChatLabelBar } from './ChatLabelBar';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { QuickActionChips } from './QuickActionChips';

export function ChatColumn() {
  return (
    <section className="flex min-w-0 flex-1 flex-col border-r border-border-ter bg-bg-primary">
      <ChatLabelBar />
      <MessageList />
      <QuickActionChips />
      <ChatInput />
    </section>
  );
}
