import { useSessionStore } from '../store/sessionStore';
import { useAppStore } from '../store/appStore';

function HealthDot({ status }: { status: 'ok' | 'degraded' | 'unavailable' | undefined }) {
  const color =
    status === 'ok'
      ? 'bg-green-500'
      : status === 'degraded'
        ? 'bg-bg-warning0'
        : 'bg-red-500';

  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} aria-hidden />;
}

export function StatusBar() {
  const isStreaming = useSessionStore((state) => state.isStreaming);
  const health = useAppStore((state) => state.health);

  return (
    <footer className="flex items-center justify-between border-t border-border-ter bg-bg-primary px-4 py-2 text-sm">
      <span>{isStreaming ? 'Agent busy…' : 'Agent ready'}</span>
      <div className="flex items-center gap-4">
        {Object.entries(health).map(([component, status]) => (
          <span key={component} className="flex items-center gap-1 capitalize">
            <HealthDot status={status} />
            {component}
          </span>
        ))}
      </div>
    </footer>
  );
}
