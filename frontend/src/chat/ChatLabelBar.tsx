export function ChatLabelBar() {
  return (
    <div className="flex h-8 flex-shrink-0 items-center gap-1.5 border-b border-border-ter px-3">
      <i className="ti ti-messages text-[14px] text-text-sec" />
      <span className="text-[11px] font-medium text-text-sec">Chat</span>
      <span className="ml-auto rounded-full bg-bg-warning px-2 py-0.5 text-[10px] font-medium text-text-warning">
        Template Assistant
      </span>
    </div>
  );
}
