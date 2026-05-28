import { apiFetch } from './client';

export interface WorkingCopyOverrideItem {
  key: string;
  value: string;
  set_at?: string | null;
}

interface WorkingCopyApiResponse {
  session_id: string;
  overrides: WorkingCopyOverrideItem[];
  total_overrides: number;
  session_has_changes: boolean;
}

export interface NormalizedWorkingCopy {
  workingCopy: Record<string, string>;
  modifiedKeys: string[];
}

export function normalizeWorkingCopy(
  response: WorkingCopyApiResponse,
): NormalizedWorkingCopy {
  const workingCopy: Record<string, string> = {};

  for (const override of response.overrides ?? []) {
    workingCopy[override.key] = override.value;
  }

  return {
    workingCopy,
    modifiedKeys: Object.keys(workingCopy),
  };
}

export async function getWorkingCopy(
  sessionId: string,
): Promise<NormalizedWorkingCopy> {
  const response = await apiFetch<WorkingCopyApiResponse>(
    `/working-copy/${sessionId}`,
  );
  return normalizeWorkingCopy(response);
}

export async function patchWorkingCopy(
  sessionId: string,
  updates: Record<string, string>,
): Promise<void> {
  for (const [key, value] of Object.entries(updates)) {
    await apiFetch(`/working-copy/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ key, value }),
    });
  }
}

export async function resetWorkingCopy(sessionId: string): Promise<void> {
  await apiFetch(`/working-copy/${sessionId}`, {
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
