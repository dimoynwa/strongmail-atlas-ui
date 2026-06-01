import { MaintenanceApiError } from '../api/maintenanceError';
import { startFullRefresh, startTemplateRefresh, streamRefreshJob } from '../api/refresh';
import { startBatchReevaluate, streamBatchTone } from '../api/tone';
import { useAppStore } from '../store/appStore';

import type { ProgressEvent } from '../types/maintenance';

const streamControllers = new Map<string, AbortController>();

function handleProgressEvent(job_id: string, event: ProgressEvent): void {
  const store = useAppStore.getState();
  store.appendJobEvent(job_id, event);

  if (event.type === 'job_done' || event.type === 'job_failed') {
    const status = event.type === 'job_done' ? 'done' : 'failed';
    store.finalizeJob(job_id, status, event.timestamp);
    streamControllers.delete(job_id);
  }
}

function startStreaming(
  job_id: string,
  streamFn: typeof streamRefreshJob,
): void {
  const existing = streamControllers.get(job_id);
  if (existing) {
    existing.abort();
  }

  const controller = streamFn(job_id, (event) => handleProgressEvent(job_id, event));
  streamControllers.set(job_id, controller);
}

function handleStartError(error: unknown): void {
  const store = useAppStore.getState();
  if (error instanceof MaintenanceApiError) {
    if (error.status === 409) {
      const lockedBy = error.lockedBy ? ` (locked by ${error.lockedBy})` : '';
      store.addToast(`A maintenance job is already running${lockedBy}`, 'info');
      return;
    }
    if (error.status === 503) {
      store.addToast('Maintenance service is unavailable', 'error');
      return;
    }
    store.addToast(error.message, 'error');
    return;
  }
  store.addToast('Something went wrong. Please try again.', 'error');
}

export async function runTemplateRefresh(templateName: string): Promise<void> {
  const store = useAppStore.getState();

  if (store.activeRefreshStatus === 'failed') {
    store.setActiveRefreshStatus('idle');
  }

  try {
    const result = await startTemplateRefresh(templateName);
    store.addJob({
      job_id: result.job_id,
      type: 'template',
      target: result.target,
      status: 'pending',
      started_at: result.started_at,
    });
    store.setActiveRefreshTarget(templateName);
    store.setActiveRefreshStatus('refreshing');
    startStreaming(result.job_id, streamRefreshJob);
  } catch (error) {
    handleStartError(error);
  }
}

export async function runFullRefresh(): Promise<void> {
  const store = useAppStore.getState();

  try {
    const result = await startFullRefresh();
    store.addJob({
      job_id: result.job_id,
      type: 'full',
      status: 'pending',
      started_at: result.started_at,
    });
    startStreaming(result.job_id, streamRefreshJob);
  } catch (error) {
    handleStartError(error);
  }
}

export async function runBatchReevaluate(): Promise<void> {
  const store = useAppStore.getState();

  try {
    const result = await startBatchReevaluate();
    store.addJob({
      job_id: result.job_id,
      type: 'tone_batch',
      status: 'pending',
      started_at: result.started_at,
    });
    startStreaming(result.job_id, streamBatchTone);
  } catch (error) {
    handleStartError(error);
  }
}

export function abortAllJobStreams(): void {
  for (const controller of streamControllers.values()) {
    controller.abort();
  }
  streamControllers.clear();
}

export function resumeJobStreams(): void {
  const store = useAppStore.getState();
  for (const job of store.maintenanceJobs) {
    if (job.status === 'pending' || job.status === 'running') {
      const streamFn = job.type === 'tone_batch' ? streamBatchTone : streamRefreshJob;
      if (!streamControllers.has(job.job_id)) {
        startStreaming(job.job_id, streamFn);
      }
    }
  }
}

export function getActiveStreamJobIds(): string[] {
  return [...streamControllers.keys()];
}
