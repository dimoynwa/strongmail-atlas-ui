import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DiffCard } from '../chat/DiffCard';
import { useSessionStore } from '../store/sessionStore';

describe('DiffCard', () => {
  it('renders diff rows and discard removes diff state', async () => {
    const user = userEvent.setup();
    const removeDiffFromMessage = vi.fn();
    useSessionStore.setState({
      removeDiffFromMessage,
    });

    render(
      <DiffCard
        messageId="msg-1"
        diff={{ header_text: { old: 'Welcome', new: 'Act now!' } }}
      />,
    );

    expect(screen.getByText('header_text')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Discard' }));
    expect(removeDiffFromMessage).toHaveBeenCalledWith('msg-1');
  });
});
