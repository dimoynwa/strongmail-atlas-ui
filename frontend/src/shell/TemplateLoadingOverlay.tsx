export function TemplateLoadingOverlay() {
  return (
    <div className="template-loading-overlay absolute inset-0 z-20 flex items-center justify-center bg-bg-primary/85 backdrop-blur-[4px]">
      <div className="flex flex-col items-center gap-2.5">
        <i className="ti ti-mail text-[24px] text-text-info" />
        <span className="text-[13px] font-medium text-text-sec">Loading template…</span>
        <div className="template-loading-progress h-[3px] w-40 overflow-hidden rounded-full bg-bg-secondary">
          <div className="template-loading-progress-fill h-full bg-text-info" />
        </div>
      </div>
    </div>
  );
}
