import { WorkingCopySection } from '../rightpanel/WorkingCopySection';
import { ToneSection } from '../rightpanel/ToneSection';

export function RightColumn() {
  return (
    <div className="col-right bg-bg-primary">
      <WorkingCopySection />
      <ToneSection />
    </div>
  );
}
