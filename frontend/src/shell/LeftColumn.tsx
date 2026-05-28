import { PreviewSection } from '../preview/PreviewSection';
import { ChatSection } from '../chat/ChatSection';

export function LeftColumn() {
  return (
    <div className="col-left">
      <PreviewSection />
      <ChatSection />
    </div>
  );
}
