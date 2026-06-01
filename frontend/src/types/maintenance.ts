export type EventType =
  | 'step_start'
  | 'step_done'
  | 'step_error'
  | 'item_done'
  | 'job_done'
  | 'job_failed';

export interface ProgressEvent {
  type: EventType;
  step?: string | null;
  message: string;
  count?: number | null;
  total?: number | null;
  timestamp: string;
}

export interface MaintenanceJobTemplate {
  job_id: string;
  type: 'template';
  target: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  started_at: string;
  finished_at?: string;
  log: ProgressEvent[];
  expanded: boolean;
}

export interface MaintenanceJobGlobal {
  job_id: string;
  type: 'full' | 'tone_batch';
  target?: undefined;
  status: 'pending' | 'running' | 'done' | 'failed';
  started_at: string;
  finished_at?: string;
  log: ProgressEvent[];
  expanded: boolean;
}

export type MaintenanceJob = MaintenanceJobTemplate | MaintenanceJobGlobal;

export interface Toast {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
}
