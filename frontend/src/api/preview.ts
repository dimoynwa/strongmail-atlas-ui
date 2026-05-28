import { apiFetch } from './client';

interface PreviewApiResponse {
  resolved_html: string;
  resolved_text: string;
}

export interface PreviewResponse {
  html: string;
}

export async function getPreview(sessionId: string): Promise<PreviewResponse> {
  const response = await apiFetch<PreviewApiResponse>(`/preview/${sessionId}`);
  return { html: response.resolved_html ?? '' };
}
