import { describe, expect, it } from 'vitest';
import { highlightModifiedValues } from '../utils/preview';

describe('highlightModifiedValues', () => {
  it('highlights only the first occurrence of a modified value', () => {
    const html = '<p>Skrill welcome to Skrill</p>';
    const result = highlightModifiedValues(
      html,
      { BRAND: 'Skrill' },
      new Set(['BRAND']),
    );

    expect(result.match(/<span style=/g)?.length).toBe(1);
    expect(result).toContain('<span style=');
    expect(result).toContain('welcome to Skrill</p>');
  });

  it('does not highlight when modifiedKeys is empty', () => {
    const html = '<p>Hello world</p>';
    const result = highlightModifiedValues(
      html,
      { GREETING: 'Hello' },
      new Set(),
    );

    expect(result).toBe(html);
  });

  it('handles values containing regex and format special characters', () => {
    const html = '<p>Save {amount} & continue</p>';
    const result = highlightModifiedValues(
      html,
      { AMOUNT: '{amount} & continue' },
      new Set(['AMOUNT']),
    );

    expect(result).toContain(
      '<span style="border-left:2px solid #22c55e;padding-left:6px;color:#166534">{amount} &amp; continue</span>',
    );
  });
});
