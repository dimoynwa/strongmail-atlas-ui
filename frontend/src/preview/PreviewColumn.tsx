import { PreviewFrame } from './PreviewFrame';
import { PreviewLabelBar } from './PreviewLabelBar';
import { UnresolvableKeysPanel } from './UnresolvableKeysPanel';
import { usePreviewRefresh } from '../hooks/usePreviewRefresh';
import { useSessionStore } from '../store/sessionStore';

export function PreviewColumn() {
  usePreviewRefresh();

  const unresolvableKeys = useSessionStore((state) => state.unresolvableKeys);
  const resolvedCount = useSessionStore((state) => state.resolvedCount);
  const totalPlaceholders = useSessionStore((state) => state.totalPlaceholders);

  return (
    <section className="flex w-[310px] flex-shrink-0 flex-col overflow-hidden border-r border-border-ter bg-bg-secondary">
      <PreviewLabelBar
        resolvedCount={resolvedCount}
        totalPlaceholders={totalPlaceholders}
      />
      <PreviewFrame />
      <UnresolvableKeysPanel keys={unresolvableKeys} />
    </section>
  );
}
