import { useSessionStore } from '../store/sessionStore';

export function PreviewFrame() {
  const resolvedHtml = useSessionStore((state) => state.resolvedHtml);
  const sessionId = useSessionStore((state) => state.sessionId);

  if (!sessionId) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-text-sec">
        Open a template to see the preview
      </div>
    );
  }

  return (
    <iframe
      title="Template preview"
      srcDoc={resolvedHtml}
      sandbox="allow-same-origin"
      className="h-full w-full flex-1 border-0 bg-bg-primary"
    />
  );
}
