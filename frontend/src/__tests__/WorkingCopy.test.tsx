import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('saves an edited value from the inline editor', async () => {
    const user = userEvent.setup();
    render(<WorkingCopySection />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to our service!')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Welcome to our service!'));

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Updated header');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Updated header')).toBeInTheDocument();
      expect(useSessionStore.getState().workingCopy.header_text).toBe('Updated header');
      expect(useSessionStore.getState().resolvedHtml).toContain('Updated header');
      expect(useSessionStore.getState().previewVersion).toBeGreaterThan(0);
    });
  });

  it('opens the editor for an empty working copy value', async () => {
    useSessionStore.setState({
      workingCopy: {
        ...useSessionStore.getState().workingCopy,
        footer_text: '',
      },
    });

    const user = userEvent.setup();
    render(<WorkingCopySection />);

    await user.click(screen.getByRole('button', { name: 'Edit footer_text' }));

    expect(screen.getByRole('textbox')).toHaveValue('');
    await user.type(screen.getByRole('textbox'), 'New footer');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(useSessionStore.getState().workingCopy.footer_text).toBe('New footer');
    });
  });
});
