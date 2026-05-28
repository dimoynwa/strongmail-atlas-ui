import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { QuickActionChips } from './QuickActionChips';

export function ChatColumn() {
  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden border-r border-border-ter bg-bg-primary">
      <div className="flex h-[34px] flex-shrink-0 items-center gap-1.5 border-b border-border-ter px-2.5">
        <i className="ti ti-messages text-[14px] text-text-sec" />
        <span className="text-[11px] font-medium text-text-sec">Chat</span>
        <span className="ml-auto rounded-full bg-bg-warning px-2 py-0.5 text-[10px] font-medium text-text-warning">
          Template Assistant
        </span>
      </div>
      <MessageList />
      <QuickActionChips />
      <ChatInput />
    </section>
  );
}
