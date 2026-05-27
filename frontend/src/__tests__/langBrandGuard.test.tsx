import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Sidebar } from '../sidebar/Sidebar';
import { useSessionStore } from '../store/sessionStore';
import { useAppStore } from '../store/appStore';

describe('lang/brand guard', () => {
  beforeEach(async () => {
    useSessionStore.getState().resetSession();
    useSessionStore.setState({ langLocal: 'en-US', paramCustBrand: 'default' });
    await useAppStore.getState().loadLocalesAndBrands();
    await useAppStore.getState().loadTemplates();
  });

  it('changes language silently when no session is active', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('en-US')).toBeInTheDocument();
    });

    const languageSelect = screen.getByDisplayValue('en-US');
    await user.selectOptions(languageSelect, 'fr-FR');

    expect(useSessionStore.getState().langLocal).toBe('fr-FR');
    expect(screen.queryByText(/reset your current session/i)).not.toBeInTheDocument();
  });

  it('prompts for confirmation when a session is active', async () => {
    const user = userEvent.setup();
    await useSessionStore.getState().openTemplate('welcome_email');
    render(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('en-US')).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByDisplayValue('en-US'), 'fr-FR');

    expect(
      screen.getByText(/Changing language will reset your current session/i),
    ).toBeInTheDocument();
  });
});
