import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { PreviewLabelBar } from '../../preview/PreviewLabelBar';
import { useAppStore } from '../../store/appStore';
import { useSessionStore } from '../../store/sessionStore';
import { server } from '../../mocks/server';

describe('PreviewLabelBar', () => {
  beforeEach(() => {
    useSessionStore.getState().resetSession();
    useAppStore.setState({
      activeRefreshTarget: null,
      activeRefreshStatus: null,
      toasts: [],
      maintenanceDrawerOpen: false,
      maintenanceJobs: [],
      staleSessionBannerTarget: null,
    });
  });

  it('shows refresh button when session is active and no running job', () => {
    useSessionStore.setState({
      sessionId: 'session-welcome_email',
      templateName: 'welcome_email',
    });

    render(<PreviewLabelBar resolvedCount={2} totalPlaceholders={2} />);
    expect(screen.getByRole('button', { name: /refresh template/i })).toBeInTheDocument();
  });

  it('shows chip when refresh is running for active template', () => {
    useSessionStore.setState({
      sessionId: 'session-welcome_email',
      templateName: 'welcome_email',
    });
    useAppStore.setState({
      activeRefreshTarget: 'welcome_email',
      activeRefreshStatus: 'refreshing',
    });

    render(<PreviewLabelBar resolvedCount={2} totalPlaceholders={2} />);
    expect(screen.getByText('Refreshing…')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /refresh template/i })).not.toBeInTheDocument();
  });

  it('hides refresh controls when no session is active', () => {
    render(<PreviewLabelBar resolvedCount={0} totalPlaceholders={0} />);
    expect(screen.queryByRole('button', { name: /refresh template/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Refreshing…')).not.toBeInTheDocument();
  });

  it('shows toast on 409 conflict and keeps button idle', async () => {
    const user = userEvent.setup();
    useSessionStore.setState({
      sessionId: 'session-welcome_email',
      templateName: 'welcome_email',
    });

    server.use(
      http.post('/refresh/template/:name', () =>
        HttpResponse.json(
          { error: 'Conflict', locked_by: 'refresh-existing' },
          { status: 409 },
        ),
      ),
    );

    render(<PreviewLabelBar resolvedCount={2} totalPlaceholders={2} />);
    await user.click(screen.getByRole('button', { name: /refresh template/i }));

    await waitFor(() => {
      expect(useAppStore.getState().toasts.length).toBeGreaterThan(0);
      expect(useAppStore.getState().activeRefreshStatus).toBeNull();
    });
  });
});
