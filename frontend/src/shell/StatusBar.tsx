import { useSessionStore } from '../store/sessionStore';
import { useAppStore } from '../store/appStore';

function HealthDot({ status }: { status: 'ok' | 'degraded' | 'unavailable' | undefined }) {
  const color =
    status === 'ok'
      ? 'bg-green-500'
      : status === 'degraded'
        ? 'bg-yellow-400'
        : 'bg-red-500';

  return (
    <span className={`inline-block h-[5px] w-[5px] rounded-full ${color}`} aria-hidden />
  );
}

export function StatusBar() {
  const isStreaming = useSessionStore((state) => state.isStreaming);
  const health = useAppStore((state) => state.health);

  return (
    <footer className="flex h-[24px] flex-shrink-0 items-center justify-between border-t border-border-ter bg-bg-secondary px-3">
      <span className={`text-[10px] ${isStreaming ? 'text-text-warning' : 'text-[#22c55e]'}`}>
        {isStreaming ? 'Agent busy…' : 'Agent ready'}
      </span>
      <div className="flex items-center gap-3">
        {Object.entries(health).map(([component, status]) => (
          <span
            key={component}
            className="flex items-center gap-1 text-[10px] capitalize text-text-ter"
          >
            <HealthDot status={status} />
            {component}
          </span>
        ))}
      </div>
    </footer>
  );
}
