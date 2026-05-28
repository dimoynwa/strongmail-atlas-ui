import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ToneSection } from '../rightpanel/ToneSection';
import { useSessionStore } from '../store/sessionStore';

describe('ToneSection', () => {
  beforeEach(async () => {
    useSessionStore.getState().resetSession();
    await useSessionStore.getState().openTemplate('welcome_email');
  });

  it('renders tone bars after re-evaluation', async () => {
    const user = userEvent.setup();
    render(<ToneSection />);

    await user.click(screen.getByRole('button', { name: 'Re-evaluate' }));

    await waitFor(() => {
      expect(screen.getByText(/joy/i)).toBeInTheDocument();
    });
  });
});
