import { apiFetch } from './client';

export interface WorkingCopyResponse {
  working_copy: Record<string, string>;
  modified_keys: string[];
}

export function getWorkingCopy(sessionId: string): Promise<WorkingCopyResponse> {
  return apiFetch<WorkingCopyResponse>(`/working-copy/${sessionId}`);
}

export function patchWorkingCopy(
  sessionId: string,
  updates: Record<string, string>,
): Promise<{ status: string }> {
  return apiFetch<{ status: string }>(`/working-copy/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ updates }),
  });
}

export function resetWorkingCopy(sessionId: string): Promise<{ status: string }> {
  return apiFetch<{ status: string }>(`/working-copy/${sessionId}`, {
    method: 'DELETE',
  });
}

export async function exportWorkingCopy(sessionId: string): Promise<Blob> {
  const response = await fetch(`/working-copy/${sessionId}/export`);
  if (!response.ok) {
    throw new Error(`Export failed: ${response.status}`);
  }
  return response.blob();
}
