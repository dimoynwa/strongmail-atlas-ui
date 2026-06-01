import { useEffect, useRef } from 'react';
import type { MaintenanceJob } from '../types/maintenance';

interface MaintenanceJobCardProps {
  job: MaintenanceJob;
  onToggle: () => void;
}

function jobTypeLabel(job: MaintenanceJob): string {
  switch (job.type) {
    case 'template':
      return `Template: ${job.target}`;
    case 'full':
      return 'Full refresh';
    case 'tone_batch':
      return 'Batch tone re-evaluate';
  }
}

function statusBadgeClasses(status: MaintenanceJob['status']): string {
  switch (status) {
    case 'running':
      return 'bg-blue-100 text-blue-800';
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'pending':
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function MaintenanceJobCard({ job, onToggle }: MaintenanceJobCardProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (job.status === 'running' && job.expanded && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [job.log.length, job.status, job.expanded]);

  return (
    <div className="rounded border border-border-ter bg-bg-primary">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <i
          className={`ti ${job.expanded ? 'ti-chevron-down' : 'ti-chevron-right'} text-[12px] text-text-ter`}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-medium text-text-pri">
            {jobTypeLabel(job)}
          </div>
          <div className="truncate text-[10px] text-text-ter">{job.job_id}</div>
        </div>
        <span
          className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${statusBadgeClasses(job.status)}`}
        >
          {job.status}
        </span>
      </button>

      {job.expanded && (
        <div
          ref={logRef}
          className="max-h-40 overflow-y-auto border-t border-border-ter bg-bg-secondary px-3 py-2 font-mono text-[10px] leading-relaxed text-text-sec"
        >
          {job.log.length === 0 ? (
            <div className="text-text-ter">Waiting for progress…</div>
          ) : (
            job.log.map((event, index) => (
              <div key={`${event.timestamp}-${index}`} className="whitespace-pre-wrap">
                <span className="text-text-ter">[{event.type}]</span> {event.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
