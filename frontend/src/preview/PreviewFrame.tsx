import { useSessionStore } from '../store/sessionStore';

export function PreviewFrame() {
  const resolvedHtml = useSessionStore((state) => state.resolvedHtml);
  const previewVersion = useSessionStore((state) => state.previewVersion);
  const sessionId = useSessionStore((state) => state.sessionId);
  const templateName = useSessionStore((state) => state.templateName);

  if (!sessionId) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-text-ter">
        <i className="ti ti-template text-[32px] opacity-40" />
        <span className="text-[12px]">Select a template to preview it here</span>
      </div>
    );
  }

  if (!resolvedHtml.trim()) {
    
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-text-ter">
        <i className="ti ti-alert-triangle text-[32px] text-text-warning opacity-80" />
        <span className="text-[12px] font-medium text-text-sec">Preview unavailable</span>
        <span className="text-[11px] leading-relaxed">
          {templateName ? (
            <>
              No preview could be built for{' '}
              <span className="font-mono text-text-pri">{templateName}</span>. The stored HTML body
              may be incomplete and the text body did not resolve to content.
            </>
          ) : (
            'Template body is missing or could not be resolved.'
          )}
        </span>
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
