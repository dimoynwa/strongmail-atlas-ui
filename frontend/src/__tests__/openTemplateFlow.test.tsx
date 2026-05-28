import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { useSessionStore } from '../store/sessionStore';

describe('openTemplate flow', () => {
  beforeEach(() => {
    useSessionStore.getState().resetSession();
  });

  it('initializes session, working copy, preview, and welcome message', async () => {
    await useSessionStore.getState().openTemplate('welcome_email');

    await waitFor(() => {
      const state = useSessionStore.getState();
      expect(state.sessionId).toBe('session-welcome_email');
      expect(state.workingCopy.header_text).toBeTruthy();
      expect(state.resolvedHtml).toContain('Welcome');
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].content).toContain('welcome_email');
    });

    render(<div data-testid="preview-html">{useSessionStore.getState().resolvedHtml}</div>);
    expect(screen.getByTestId('preview-html')).toHaveTextContent('Welcome');
  });
});
