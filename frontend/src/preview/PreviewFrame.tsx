import { useSessionStore } from '../store/sessionStore';

export function PreviewFrame() {
  const resolvedHtml = useSessionStore((state) => state.resolvedHtml);
  const previewVersion = useSessionStore((state) => state.previewVersion);
  const sessionId = useSessionStore((state) => state.sessionId);

  if (!sessionId) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-text-ter">
        <i className="ti ti-template text-[32px] opacity-40" />
        <span className="text-[12px]">Select a template to preview it here</span>
      </div>
    );
  }

  return (
    <iframe
      key={previewVersion}
      title="Template preview"
      srcDoc={resolvedHtml}
      sandbox="allow-same-origin"
      className="block min-h-0 w-full flex-1 border-0"
    />
  );
}
