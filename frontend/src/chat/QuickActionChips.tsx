import { useSessionStore } from '../store/sessionStore';

const QUICK_ACTIONS = [
  'Make it more urgent',
  'Shorten the copy',
  'Improve the tone',
];

export function QuickActionChips() {
  const sendMessage = useSessionStore((state) => state.sendMessage);
  const sessionId = useSessionStore((state) => state.sessionId);

  if (!sessionId) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action}
          type="button"
          onClick={() => void sendMessage(action)}
          className="rounded-full border border-border-ter px-3 py-1 text-xs hover:bg-bg-secondary"
        >
          {action}
        </button>
      ))}
    </div>
  );
}
