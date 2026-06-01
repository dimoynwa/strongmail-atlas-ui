import type { ProgressEvent } from '../types/maintenance';

export function parseProgressSSEChunk(buffer: string): {
  events: ProgressEvent[];
  remainder: string;
} {
  const events: ProgressEvent[] = [];
  const parts = buffer.split('\n\n');
  const remainder = parts.pop() ?? '';

  for (const part of parts) {
    const line = part.split('\n').find((entry) => entry.startsWith('data: '));
    if (!line) continue;

    try {
      events.push(JSON.parse(line.slice(6)) as ProgressEvent);
    } catch {
      // skip malformed chunks
    }
  }

  return { events, remainder };
}
