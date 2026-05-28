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

export async function getPreview(
  sessionId: string,
  options: { highlightModified?: boolean } = {},
): Promise<PreviewResponse> {
  const highlightModified = options.highlightModified ?? false;
  const response = await apiFetch<PreviewApiResponse>(
    `/preview/${sessionId}?highlight_modified=${highlightModified}`,
  );
  return {
    html: response.resolved_html ?? '',
    unresolvableKeys: response.unresolvable_keys ?? [],
    resolvedCount: response.resolved_count ?? 0,
    totalPlaceholders: response.total_placeholders ?? 0,
  };
}
