import { useEffect, useRef } from 'react';
import { exportTone } from '../api/tone';
import { useClickOutside, useEscapeKey } from '../hooks/useClickOutside';
import { useAppStore } from '../store/appStore';
import {
  resumeJobStreams,
  runBatchReevaluate,
  runFullRefresh,
} from '../utils/maintenanceJobRunner';
import { MaintenanceJobCard } from './MaintenanceJobCard';

export function MaintenanceDrawer() {
  const drawerRef = useRef<HTMLDivElement>(null);
  const open = useAppStore((state) => state.maintenanceDrawerOpen);
  const jobs = useAppStore((state) => state.maintenanceJobs);
  const closeMaintenanceDrawer = useAppStore((state) => state.closeMaintenanceDrawer);
  const clearCompletedJobs = useAppStore((state) => state.clearCompletedJobs);
  const toggleJobExpanded = useAppStore((state) => state.toggleJobExpanded);

  useClickOutside(drawerRef, closeMaintenanceDrawer, open);
  useEscapeKey(closeMaintenanceDrawer, open);

  useEffect(() => {
    if (open) {
      resumeJobStreams();
    }
  }, [open]);

  if (!open) return null;

  const hasCompletedJobs = jobs.some(
    (job) => job.status === 'done' || job.status === 'failed',
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" aria-hidden="true" />
      <div
        ref={drawerRef}
        className="fixed bottom-0 left-[210px] top-10 z-50 flex w-80 flex-col border-r border-border-ter bg-bg-secondary shadow-xl"
        role="dialog"
        aria-label="Maintenance operations"
      >
        <div className="flex items-center justify-between border-b border-border-ter px-3 py-2">
          <h2 className="text-[12px] font-semibold text-text-pri">Maintenance</h2>
          <button
            type="button"
            onClick={closeMaintenanceDrawer}
            className="rounded p-1 text-text-ter hover:bg-bg-primary hover:text-text-sec"
            aria-label="Close maintenance panel"
          >
            <i className="ti ti-x text-[14px]" />
          </button>
        </div>

        <div className="flex flex-col gap-2 border-b border-border-ter p-3">
          <button
            type="button"
            onClick={() => void runFullRefresh()}
            className="rounded border border-border-sec bg-bg-primary px-2 py-1.5 text-left text-[10px] text-text-pri hover:bg-bg-secondary"
          >
            Full Refresh
          </button>
          <button
            type="button"
            onClick={() => void runBatchReevaluate()}
            className="rounded border border-border-sec bg-bg-primary px-2 py-1.5 text-left text-[10px] text-text-pri hover:bg-bg-secondary"
          >
            Batch Tone Re-evaluate
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void exportTone('csv')}
              className="flex-1 rounded border border-border-sec bg-bg-primary px-2 py-1.5 text-[10px] text-text-pri hover:bg-bg-secondary"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => void exportTone('xlsx')}
              className="flex-1 rounded border border-border-sec bg-bg-primary px-2 py-1.5 text-[10px] text-text-pri hover:bg-bg-secondary"
            >
              Export XLSX
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-text-ter">
            Job history
          </span>
          {hasCompletedJobs && (
            <button
              type="button"
              onClick={clearCompletedJobs}
              className="text-[10px] text-text-sec hover:text-text-pri"
            >
              [Clear]
            </button>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3">
          {jobs.length === 0 ? (
            <p className="text-[10px] text-text-ter">No maintenance jobs yet.</p>
          ) : (
            jobs.map((job) => (
              <MaintenanceJobCard
                key={job.job_id}
                job={job}
                onToggle={() => toggleJobExpanded(job.job_id)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
