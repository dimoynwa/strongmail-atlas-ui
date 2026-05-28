import { GeneralChat } from './GeneralChat';
import { ResultCards } from './ResultCards';

export function GeneralLayout() {
  return (
    <section className="flex min-w-0 flex-1 flex-col bg-bg-primary">
      <div className="border-b border-border-ter px-4 py-2 text-sm font-medium">
        General Agent
      </div>
      <ResultCards />
      <GeneralChat />
    </section>
  );
}
