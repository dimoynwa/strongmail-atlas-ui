import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Sidebar } from '../sidebar/Sidebar';
import { useSessionStore } from '../store/sessionStore';
import { useAppStore } from '../store/appStore';

describe('lang/brand guard', () => {
  beforeEach(async () => {
    useSessionStore.getState().resetSession();
    useSessionStore.setState({ langLocal: 'EN', paramCustBrand: 'SKRILL' });
    await useAppStore.getState().loadLocalesAndBrands();
    await useAppStore.getState().loadTemplates();
  });

  it('changes language silently when no session is active', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('EN')).toBeInTheDocument();
    });

    const languageSelect = screen.getByDisplayValue('EN');
    await user.selectOptions(languageSelect, 'FR');

    expect(useSessionStore.getState().langLocal).toBe('FR');
    expect(screen.queryByText(/reset your current session/i)).not.toBeInTheDocument();
  });

  it('prompts for confirmation when a session is active', async () => {
    const user = userEvent.setup();
    await useSessionStore.getState().openTemplate('welcome_email');
    render(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('EN')).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByDisplayValue('EN'), 'FR');

    expect(
      screen.getByText(/Changing language will reset your current session/i),
    ).toBeInTheDocument();
  });
});
