import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StaleSessionBanner } from '../../rightpanel/StaleSessionBanner';
import { RightPanel } from '../../rightpanel/RightPanel';
import { useAppStore } from '../../store/appStore';
import { useSessionStore } from '../../store/sessionStore';

describe('StaleSessionBanner', () => {
  beforeEach(() => {
    useSessionStore.getState().resetSession();
    useAppStore.setState({
      staleSessionBannerTarget: null,
      maintenanceDrawerOpen: false,
      maintenanceJobs: [],
      activeRefreshTarget: null,
      activeRefreshStatus: null,
      toasts: [],
    });
  });

  it('renders template name and handles dismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <StaleSessionBanner
        templateName="welcome_email"
        onReopen={() => {}}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByText(/welcome_email/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('mounts in RightPanel when session and banner target match', () => {
    useSessionStore.setState({
      sessionId: 'session-welcome_email',
      templateName: 'welcome_email',
    });
    useAppStore.setState({ staleSessionBannerTarget: 'welcome_email' });

    render(<RightPanel />);
    expect(screen.getByText(/Template data may be stale/)).toBeInTheDocument();
  });

  it('does not mount when template names do not match', () => {
    useSessionStore.setState({
      sessionId: 'session-welcome_email',
      templateName: 'welcome_email',
    });
    useAppStore.setState({ staleSessionBannerTarget: 'promo_email' });

    render(<RightPanel />);
    expect(screen.queryByText(/Template data may be stale/)).not.toBeInTheDocument();
  });
});
