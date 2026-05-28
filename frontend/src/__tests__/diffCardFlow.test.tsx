import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { DiffCard } from '../chat/DiffCard';
import { useSessionStore } from '../store/sessionStore';

describe('diff card apply flow', () => {
  beforeEach(async () => {
    useSessionStore.getState().resetSession();
    await useSessionStore.getState().openTemplate('welcome_email');
  });

  it('applies all suggested changes and refreshes working copy', async () => {
    const user = userEvent.setup();

    render(
      <DiffCard
        messageId="msg-1"
        diff={{ header_text: { old: 'Welcome', new: 'Act now!' } }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Apply all' }));

    await waitFor(() => {
      expect(useSessionStore.getState().workingCopy.header_text).toBe('Act now!');
      expect(useSessionStore.getState().toneStale).toBe(true);
    });
  });
});
