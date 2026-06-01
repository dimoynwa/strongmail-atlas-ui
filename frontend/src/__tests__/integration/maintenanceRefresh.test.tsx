import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { PreviewLabelBar } from '../../preview/PreviewLabelBar';
import { MaintenanceDrawer } from '../../sidebar/MaintenanceDrawer';
import { useAppStore } from '../../store/appStore';
import { useSessionStore } from '../../store/sessionStore';

describe('maintenance refresh integration', () => {
  beforeEach(() => {
    useSessionStore.getState().resetSession();
    useAppStore.setState({
      maintenanceDrawerOpen: true,
      maintenanceJobs: [],
      activeRefreshTarget: null,
      activeRefreshStatus: null,
      staleSessionBannerTarget: null,
      toasts: [],
    });
  });

  it('runs full refresh flow from preview through drawer to stale banner', async () => {
    const user = userEvent.setup();

    await useSessionStore.getState().openTemplate('welcome_email');

    render(
      <>
        <PreviewLabelBar resolvedCount={2} totalPlaceholders={2} />
        <MaintenanceDrawer />
      </>,
    );

    await user.click(screen.getByRole('button', { name: /refresh template/i }));

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(
        state.activeRefreshStatus === 'refreshing' ||
          state.maintenanceJobs.some((job) => job.type === 'template'),
      ).toBe(true);
    });

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.maintenanceJobs.some((job) => job.status === 'done')).toBe(true);
      expect(state.activeRefreshStatus).toBe('idle');
      expect(state.staleSessionBannerTarget).toBe('welcome_email');
    });

    expect(screen.queryByText('Refreshing…')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh template/i })).toBeInTheDocument();
  });
});
