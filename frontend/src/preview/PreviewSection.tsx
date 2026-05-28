import { PreviewFrame } from './PreviewFrame';
import { PreviewLabelBar } from './PreviewLabelBar';
import { UnresolvableKeysPanel } from './UnresolvableKeysPanel';
import { usePreviewRefresh } from '../hooks/usePreviewRefresh';
import { useSessionStore } from '../store/sessionStore';

export function PreviewSection() {
  usePreviewRefresh();

  const unresolvableKeys = useSessionStore((state) => state.unresolvableKeys);
  const resolvedCount = useSessionStore((state) => state.resolvedCount);
  const totalPlaceholders = useSessionStore((state) => state.totalPlaceholders);

  return (
    <div className="preview-section bg-bg-secondary">
      <PreviewLabelBar
        resolvedCount={resolvedCount}
        totalPlaceholders={totalPlaceholders}
      />
      <UnresolvableKeysPanel keys={unresolvableKeys} />
      <PreviewFrame />
    </div>
  );
}
