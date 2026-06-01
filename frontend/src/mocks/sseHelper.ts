import type { ProgressEvent } from '../types/maintenance';

export function createSSEStream(events: ProgressEvent[], delayMs = 0): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for (const event of events) {
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      }
      controller.close();
    },
  });
}

export function createRefreshSuccessEvents(templateName: string): ProgressEvent[] {
  const timestamp = '2026-05-31T00:00:00Z';
  return [
    {
      type: 'step_start',
      step: 'resolve_linked_blocks',
      message: `Resolving linked blocks for '${templateName}'…`,
      timestamp,
    },
    {
      type: 'step_done',
      step: 'resolve_linked_blocks',
      message: 'Resolved 1 block(s)',
      count: 1,
      total: 1,
      timestamp,
    },
    {
      type: 'job_done',
      message: 'Template refresh complete',
      timestamp,
    },
  ];
}

export function createBatchSuccessEvents(): ProgressEvent[] {
  const timestamp = '2026-05-31T00:00:00Z';
  return [
    {
      type: 'step_start',
      step: 'batch_evaluate',
      message: 'Starting batch tone re-evaluation…',
      timestamp,
    },
    {
      type: 'item_done',
      message: 'Evaluated template 1/1',
      count: 1,
      total: 1,
      timestamp,
    },
    {
      type: 'job_done',
      message: 'Batch re-evaluation complete',
      timestamp,
    },
  ];
}
