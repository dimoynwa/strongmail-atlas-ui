import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../shell/AppShell';

describe('AppShell', () => {
  it('renders the four fixed UI regions', () => {
    render(<AppShell />);

    expect(screen.getAllByText('Template Assistant').length).toBeGreaterThan(0);
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Live preview')).toBeInTheDocument();
    expect(screen.getByText('Working copy')).toBeInTheDocument();
    expect(screen.getByText('Agent ready')).toBeInTheDocument();
  });
});
