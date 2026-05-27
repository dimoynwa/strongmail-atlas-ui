import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { WorkingCopySection } from '../rightpanel/WorkingCopySection';
import { useSessionStore } from '../store/sessionStore';

describe('WorkingCopy', () => {
  beforeEach(async () => {
    useSessionStore.getState().resetSession();
    await useSessionStore.getState().openTemplate('welcome_email');
  });

  it('renders working copy keys after opening a template', async () => {
    render(<WorkingCopySection />);

    await waitFor(() => {
      expect(screen.getByText('header_text')).toBeInTheDocument();
      expect(screen.getByText('body_text')).toBeInTheDocument();
    });
  });
});
