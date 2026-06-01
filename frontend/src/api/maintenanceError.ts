import type { ApiErrorBody } from '../types';

export class MaintenanceApiError extends Error {
  status: number;
  body: ApiErrorBody | null;
  lockedBy?: string;

  constructor(
    message: string,
    status: number,
    body: ApiErrorBody | null = null,
    lockedBy?: string,
  ) {
    super(message);
    this.name = 'MaintenanceApiError';
    this.status = status;
    this.body = body;
    this.lockedBy = lockedBy;
  }
}
