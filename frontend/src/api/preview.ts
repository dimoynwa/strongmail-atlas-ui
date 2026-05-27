import { apiFetch } from './client';

export interface PreviewResponse {
  html: string;
}

export function getPreview(sessionId: string): Promise<PreviewResponse> {
  return apiFetch<PreviewResponse>(`/preview/${sessionId}`);
}
