import { apiFetch } from './client';
import type { WorkingCopyInitResponse } from '../types';

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

export interface NormalizedWorkingCopyInit extends NormalizedWorkingCopy {
  editCount: number;
  toneKeyCount: number;
}

function buildWorkingCopyMaps(overrides: WorkingCopyOverrideItem[]): {
  workingCopy: Record<string, string>;
  modifiedKeys: string[];
} {
  const workingCopy: Record<string, string> = {};
  const modifiedKeys: string[] = [];

  for (const override of overrides ?? []) {
    workingCopy[override.key] = override.value;
    if (override.set_at != null) {
      modifiedKeys.push(override.key);
    }
  }

  return { workingCopy, modifiedKeys };
}

export function normalizeWorkingCopy(
  response: WorkingCopyApiResponse,
): NormalizedWorkingCopy {
  return buildWorkingCopyMaps(response.overrides ?? []);
}

export function normalizeInitResponse(
  response: WorkingCopyInitResponse,
): NormalizedWorkingCopyInit {
  const { workingCopy, modifiedKeys } = buildWorkingCopyMaps(response.overrides ?? []);
  return {
    workingCopy,
    modifiedKeys,
    editCount: response.total_overrides,
    toneKeyCount: response.tone_key_count,
  };
}

export async function initWorkingCopy(
  sessionId: string,
): Promise<NormalizedWorkingCopyInit> {
  const response = await apiFetch<WorkingCopyInitResponse>(
    `/working-copy/${sessionId}/init`,
    { method: 'POST' },
  );
  return normalizeInitResponse(response);
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
