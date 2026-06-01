import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { getPreview } from '../../api/preview';
import { server } from '../../mocks/server';

describe('getPreview', () => {
  it('uses resolved_html for iframe content, not resolved_text', async () => {
    server.use(
      http.get('/preview/:sessionId', () => {
        return HttpResponse.json({
          resolved_html: '<html><body><table><tr><td>HTML body</td></tr></table></body></html>',
          resolved_text: 'Plain text body only',
          unresolvable_keys: [],
          total_placeholders: 1,
          resolved_count: 1,
          unresolvable_count: 0,
        });
      }),
    );

    const preview = await getPreview('session-test');

    expect(preview.html).toContain('<table>');
    expect(preview.html).toContain('HTML body');
    expect(preview.html).not.toContain('Plain text body only');
  });
});
