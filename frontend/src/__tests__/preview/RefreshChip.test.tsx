import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RefreshChip } from '../../preview/RefreshChip';

describe('RefreshChip', () => {
  it('renders refreshing state', () => {
    render(<RefreshChip status="refreshing" onFailedClick={() => {}} />);
    expect(screen.getByText('Refreshing…')).toBeInTheDocument();
  });

  it('renders failed state and calls onFailedClick', async () => {
    const user = userEvent.setup();
    const onFailedClick = vi.fn();
    render(<RefreshChip status="failed" onFailedClick={onFailedClick} />);

    await user.click(screen.getByRole('button', { name: /refresh failed/i }));
    expect(onFailedClick).toHaveBeenCalledOnce();
  });
});
