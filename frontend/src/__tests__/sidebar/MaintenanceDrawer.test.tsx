import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MaintenanceDrawer } from '../../sidebar/MaintenanceDrawer';
import { MaintenanceJobCard } from '../../sidebar/MaintenanceJobCard';
import { useAppStore } from '../../store/appStore';
import type { MaintenanceJob } from '../../types/maintenance';

describe('MaintenanceJobCard', () => {
  const sampleJob: MaintenanceJob = {
    job_id: 'refresh-1',
    type: 'template',
    target: 'welcome_email',
    status: 'running',
    started_at: '2026-05-31T00:00:00Z',
    log: [
      {
        type: 'step_start',
        message: 'Starting refresh',
        timestamp: '2026-05-31T00:00:00Z',
      },
    ],
    expanded: true,
  };

  it('renders expanded log lines', () => {
    render(<MaintenanceJobCard job={sampleJob} onToggle={() => {}} />);
    expect(screen.getByText(/Starting refresh/)).toBeInTheDocument();
  });

  it('calls onToggle when header is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<MaintenanceJobCard job={sampleJob} onToggle={onToggle} />);
    await user.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});

describe('MaintenanceDrawer', () => {
  beforeEach(() => {
    useAppStore.setState({
      maintenanceDrawerOpen: true,
      maintenanceJobs: [],
      toasts: [],
      activeRefreshTarget: null,
      activeRefreshStatus: null,
      staleSessionBannerTarget: null,
    });
  });

  it('triggers full refresh and adds job to history', async () => {
    const user = userEvent.setup();
    render(<MaintenanceDrawer />);

    await user.click(screen.getByRole('button', { name: 'Full Refresh' }));

    await waitFor(() => {
      expect(useAppStore.getState().maintenanceJobs.length).toBe(1);
    });
  });

  it('clearCompletedJobs removes done/failed jobs but keeps running jobs', () => {
    useAppStore.setState({
      maintenanceJobs: [
        {
          job_id: 'done-1',
          type: 'full',
          status: 'done',
          started_at: '2026-05-31T00:00:00Z',
          log: [],
          expanded: false,
        },
        {
          job_id: 'running-1',
          type: 'full',
          status: 'running',
          started_at: '2026-05-31T00:00:00Z',
          log: [],
          expanded: true,
        },
      ],
    });

    useAppStore.getState().clearCompletedJobs();

    const jobs = useAppStore.getState().maintenanceJobs;
    expect(jobs).toHaveLength(1);
    expect(jobs[0].job_id).toBe('running-1');
  });

  it('dismisses on Escape key', async () => {
    const user = userEvent.setup();
    render(<MaintenanceDrawer />);
    await user.keyboard('{Escape}');
    expect(useAppStore.getState().maintenanceDrawerOpen).toBe(false);
  });
});
