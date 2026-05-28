import { apiFetch } from './client';
import type { HealthStatus } from '../types';

export interface HealthResponse {
  status: string;
  components: Record<string, HealthStatus>;
}

export function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/health');
}
