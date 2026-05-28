import { WorkingCopySection } from './WorkingCopySection';
import { ToneSection } from './ToneSection';

export function RightPanel() {
  return (
    <aside className="flex w-[256px] flex-shrink-0 flex-col overflow-hidden border-l border-border-ter bg-bg-primary">
      <WorkingCopySection />
      <ToneSection />
    </aside>
  );
}
