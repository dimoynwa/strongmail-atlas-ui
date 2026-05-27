import { PreviewLabelBar } from './PreviewLabelBar';
import { PreviewFrame } from './PreviewFrame';
import { usePreviewRefresh } from '../hooks/usePreviewRefresh';

export function PreviewColumn() {
  usePreviewRefresh();

  return (
    <section className="flex min-w-0 flex-1 flex-col border-r border-slate-200 bg-white">
      <PreviewLabelBar />
      <PreviewFrame />
    </section>
  );
}
