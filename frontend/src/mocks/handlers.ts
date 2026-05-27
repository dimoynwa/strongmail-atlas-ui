import { http, HttpResponse } from 'msw';
import type { ToneScores } from '../types';

const mockToneScores: ToneScores = {
  urgency: 10,
  anger: 5,
  fear: 3,
  admiration: 20,
  approval: 15,
  gratitude: 12,
  joy: 80,
  amusement: 25,
  excitement: 30,
  neutral: 20,
};

let workingCopyState: Record<string, string> = {
  header_text: 'Welcome to our service!',
  body_text: 'We are glad you are here.',
};

let modifiedKeysState = ['header_text'];

export const handlers = [
  http.get('/templates', () => {
    return HttpResponse.json([
      {
        name: 'welcome_email',
        description: 'Welcome email template',
        locales: ['en-US'],
        brands: ['default'],
      },
      {
        name: 'promo_email',
        description: 'Promotional email',
        locales: ['en-US', 'fr-FR'],
        brands: ['default', 'brand_a'],
      },
    ]);
  }),

  http.get('/locales', () => HttpResponse.json(['en-US', 'fr-FR'])),

  http.get('/brands', () => HttpResponse.json(['default', 'brand_a'])),

  http.post('/session', async ({ request }) => {
    const body = (await request.json()) as {
      template_name: string;
      lang_local: string;
      param_cust_brand: string;
    };
    return HttpResponse.json({
      session_id: `session-${body.template_name}`,
    });
  }),

  http.get('/working-copy/:sessionId', () => {
    return HttpResponse.json({
      working_copy: workingCopyState,
      modified_keys: modifiedKeysState,
    });
  }),

  http.patch('/working-copy/:sessionId', async ({ request }) => {
    const body = (await request.json()) as {
      updates: Record<string, string>;
    };
    workingCopyState = { ...workingCopyState, ...body.updates };
    modifiedKeysState = [
      ...new Set([...modifiedKeysState, ...Object.keys(body.updates)]),
    ];
    return HttpResponse.json({ status: 'success' });
  }),

  http.delete('/working-copy/:sessionId', () => {
    workingCopyState = {
      header_text: 'Welcome to our service!',
      body_text: 'We are glad you are here.',
    };
    modifiedKeysState = [];
    return HttpResponse.json({ status: 'success' });
  }),

  http.get('/working-copy/:sessionId/export', () => {
    return new HttpResponse('header_text,body_text\nWelcome,Body', {
      headers: { 'Content-Type': 'text/csv' },
    });
  }),

  http.get('/preview/:sessionId', () => {
    return HttpResponse.json({
      html: `<!DOCTYPE html><html><body><h1>${workingCopyState.header_text ?? ''}</h1><p>${workingCopyState.body_text ?? ''}</p></body></html>`,
    });
  }),

  http.post('/tone/evaluate/:sessionId', () => {
    return HttpResponse.json({
      scores: mockToneScores,
      baseline_scores: { ...mockToneScores, joy: 75 },
    });
  }),

  http.post('/tone/apply/:sessionId', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      keys?: string[];
    };
    const keysToApply = body.keys?.length
      ? body.keys
      : Object.keys(workingCopyState);

    for (const key of keysToApply) {
      if (key === 'header_text') {
        workingCopyState.header_text = 'Act now!';
      }
    }
    modifiedKeysState = [...new Set([...modifiedKeysState, ...keysToApply])];
    return HttpResponse.json({ status: 'success' });
  }),

  http.post('/tone/undo/:sessionId', () => {
    return HttpResponse.json({ status: 'success' });
  }),

  http.get('/health', () => {
    return HttpResponse.json({
      status: 'ok',
      components: {
        redis: 'ok',
        postgres: 'ok',
        adk: 'degraded',
      },
    });
  }),

  http.post('/chat/stream', async ({ request }) => {
    const body = (await request.json()) as {
      session_id: string | null;
      agent: string;
      message: string;
    };

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        if (body.agent === 'general') {
          controller.enqueue(
            encoder.encode(
              'data: {"type":"token","text":"Here are some templates."}\n\n',
            ),
          );
          controller.enqueue(
            encoder.encode(
              'data: {"type":"final","text":"Here are some templates.","results":[{"template_name":"welcome_email","description":"Welcome email"}]}\n\n',
            ),
          );
        } else {
          controller.enqueue(
            encoder.encode(
              'data: {"type":"tool","name":"suggest_rewrites"}\n\n',
            ),
          );
          controller.enqueue(
            encoder.encode('data: {"type":"token","text":"I\'ve "}\n\n'),
          );
          controller.enqueue(
            encoder.encode('data: {"type":"token","text":"updated "}\n\n'),
          );
          controller.enqueue(
            encoder.encode(
              'data: {"type":"final","text":"I\'ve updated the text.","diff":{"header_text":{"old":"Welcome","new":"Act now!"}},"snapshot_overwritten":false}\n\n',
            ),
          );
        }
        controller.close();
      },
    });

    return new HttpResponse(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }),
];

export function resetMockState(): void {
  workingCopyState = {
    header_text: 'Welcome to our service!',
    body_text: 'We are glad you are here.',
  };
  modifiedKeysState = ['header_text'];
}
