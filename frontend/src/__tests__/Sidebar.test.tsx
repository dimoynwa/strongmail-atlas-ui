import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Sidebar } from '../sidebar/Sidebar';
import { useAppStore } from '../store/appStore';

describe('Sidebar', () => {
  beforeEach(async () => {
    await useAppStore.getState().loadTemplates();
    await useAppStore.getState().loadLocalesAndBrands();
  });

  it('renders template list after loading templates', async () => {
    render(<Sidebar />);

    await waitFor(() => {
      expect(screen.getByText('welcome_email')).toBeInTheDocument();
    });
  });

  it('switches to the General tab', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    await user.click(screen.getByRole('button', { name: 'General' }));
    expect(screen.queryByPlaceholderText('Filter templates...')).not.toBeInTheDocument();
  });
});
