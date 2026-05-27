import type { SSEEvent } from '../types';

export interface StreamChatOptions {
  sessionId: string | null;
  agent: 'template' | 'general';
  message: string;
  onToken: (text: string) => void;
  onTool: (name: string) => void;
  onFinal: (event: Extract<SSEEvent, { type: 'final' }>) => void;
  onError: (message: string) => void;
  signal?: AbortSignal;
}

function parseSSEChunk(buffer: string): { events: SSEEvent[]; remainder: string } {
  const events: SSEEvent[] = [];
  const parts = buffer.split('\n\n');
  const remainder = parts.pop() ?? '';

  for (const part of parts) {
    const line = part
      .split('\n')
      .find((entry) => entry.startsWith('data: '));
    if (!line) continue;

    try {
      events.push(JSON.parse(line.slice(6)) as SSEEvent);
    } catch {
      // skip malformed chunks
    }
  }

  return { events, remainder };
}

export async function streamChat(options: StreamChatOptions): Promise<void> {
  const { sessionId, agent, message, onToken, onTool, onFinal, onError, signal } =
    options;

  let response: Response;
  try {
    response = await fetch('/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        agent,
        message,
      }),
      signal,
    });
  } catch {
    onError('Something went wrong. Please try again.');
    return;
  }

  if (!response.ok || !response.body) {
    onError('Something went wrong. Please try again.');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const { events, remainder } = parseSSEChunk(buffer);
      buffer = remainder;

      for (const event of events) {
        switch (event.type) {
          case 'token':
            onToken(event.text);
            break;
          case 'tool':
            onTool(event.name);
            break;
          case 'final':
            onFinal(event);
            break;
          case 'error':
            onError(event.message);
            break;
        }
      }
    }
  } catch {
    onError('Something went wrong. Please try again.');
  }
}
