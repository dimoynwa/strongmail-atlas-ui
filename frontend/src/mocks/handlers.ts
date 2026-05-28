import { http, HttpResponse } from 'msw';

let workingCopyState: Record<string, string> = {
  header_text: 'Welcome to our service!',
  body_text: 'We are glad you are here.',
};

function workingCopyApiResponse(sessionId: string) {
  return {
    session_id: sessionId,
    overrides: Object.entries(workingCopyState).map(([key, value]) => ({
      key,
      value,
      set_at: null,
    })),
    total_overrides: Object.keys(workingCopyState).length,
    session_has_changes: Object.keys(workingCopyState).length > 0,
  };
}

export const handlers = [
  http.get('/templates', () => {
    return HttpResponse.json({
      templates: [
        {
          name: 'welcome_email',
          summary: 'Welcome email template',
        },
        {
          name: 'promo_email',
          summary: 'Promotional email',
        },
      ],
      total: 2,
    });
  }),

  http.get('/templates/locales', () =>
    HttpResponse.json({ locales: ['EN', 'FR'] }),
  ),

  http.get('/templates/brands', () =>
    HttpResponse.json({ brands: ['SKRILL', 'NETELLER'] }),
  ),

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

  http.get('/working-copy/:sessionId', ({ params }) => {
    return HttpResponse.json(
      workingCopyApiResponse(String(params.sessionId)),
    );
  }),

  http.post('/working-copy/:sessionId/init', ({ params }) => {
    const sessionId = String(params.sessionId);
    const response = workingCopyApiResponse(sessionId);
    return HttpResponse.json({
      ...response,
      initialized: true,
      source: 'created',
      tone_key_count: Object.keys(workingCopyState).length,
    });
  }),

  http.patch('/working-copy/:sessionId', async ({ request }) => {
    const body = (await request.json()) as {
      key: string;
      value: string;
    };
    workingCopyState = { ...workingCopyState, [body.key]: body.value };
    return HttpResponse.json({
      key: body.key,
      value: body.value,
      previous_value: null,
      success: true,
    });
  }),

  http.delete('/working-copy/:sessionId', () => {
    workingCopyState = {
      header_text: 'Welcome to our service!',
      body_text: 'We are glad you are here.',
    };
    return HttpResponse.json({ keys_cleared: 1, success: true });
  }),

  http.get('/working-copy/:sessionId/export', () => {
    return new HttpResponse('header_text,body_text\nWelcome,Body', {
      headers: { 'Content-Type': 'text/csv' },
    });
  }),

  http.get('/preview/:sessionId', () => {
    return HttpResponse.json({
      resolved_html: `<!DOCTYPE html><html><body><h1>${workingCopyState.header_text ?? ''}</h1><p>${workingCopyState.body_text ?? ''}</p></body></html>`,
      resolved_text: `${workingCopyState.header_text ?? ''} ${workingCopyState.body_text ?? ''}`,
      unresolvable_keys: [],
      total_placeholders: 2,
      resolved_count: 2,
      unresolvable_count: 0,
      evaluated_from: 'working_copy',
    });
  }),

  http.post('/tone/evaluate/:sessionId', () => {
    return HttpResponse.json({
      emotions: {
        gratitude: 0.8,
        joy: 0.75,
        neutral: 0.2,
      },
      model: 'go_emotions',
      evaluated_from: 'working_copy',
      plain_text_length: 100,
      warning: null,
    });
  }),

  http.get('/tone/stored/:sessionId', () => {
    return HttpResponse.json({
      emotions: {
        gratitude: 0.75,
        joy: 0.7,
        neutral: 0.25,
      },
      evaluated_at: '2026-01-01T00:00:00Z',
      model_id: 'mock',
      source: 'template_tone_evaluations',
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
    return HttpResponse.json({ success: true });
  }),

  http.post('/tone/undo/:sessionId', () => {
    return HttpResponse.json({ success: true });
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
}
