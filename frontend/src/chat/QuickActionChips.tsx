import { useSessionStore } from '../store/sessionStore';

const QUICK_ACTIONS = [
  { label: 'Show placeholders', message: 'What placeholders are in this template?' },
  { label: 'Full preview', message: 'Show me the full resolved preview of this template.' },
  { label: 'Compare tone', message: 'Compare the current tone to the last stored evaluation.' },
  { label: 'Reset all changes', message: 'Reset all my changes back to the original values.' },
  { label: 'What changed?', message: 'What changes have I made to this template so far?' },
];

export function QuickActionChips() {
  const sendMessage = useSessionStore((state) => state.sendMessage);
  const sessionId = useSessionStore((state) => state.sessionId);

  if (!sessionId) return null;

  return (
    <div className="flex flex-shrink-0 gap-1.5 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => void sendMessage(action.message)}
          className="flex-shrink-0 rounded-full border border-border-sec bg-bg-secondary px-2.5 py-1 text-[11px] text-text-sec hover:bg-bg-tertiary"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
