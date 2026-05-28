import { apiFetch } from './client';
import type { UnresolvableKey } from '../types';

interface PreviewApiResponse {
  resolved_html: string;
  resolved_text: string;
  unresolvable_keys: UnresolvableKey[];
  total_placeholders: number;
  resolved_count: number;
  unresolvable_count: number;
}

export interface PreviewResponse {
  html: string;
  unresolvableKeys: UnresolvableKey[];
  resolvedCount: number;
  totalPlaceholders: number;
}

export async function getPreview(sessionId: string): Promise<PreviewResponse> {
  const response = await apiFetch<PreviewApiResponse>(`/preview/${sessionId}`);
  return {
    html: response.resolved_html ?? '',
    unresolvableKeys: response.unresolvable_keys ?? [],
    resolvedCount: response.resolved_count ?? 0,
    totalPlaceholders: response.total_placeholders ?? 0,
  };
}
