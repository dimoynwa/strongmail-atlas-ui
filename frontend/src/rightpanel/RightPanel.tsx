import { WorkingCopySection } from './WorkingCopySection';
import { ToneSection } from './ToneSection';

export function RightPanel() {
  return (
    <aside className="flex w-80 flex-col overflow-y-auto bg-bg-primary">
      <WorkingCopySection />
      <ToneSection />
    </aside>
  );
}
