import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../shell/AppShell';

describe('AppShell', () => {
  it('renders the four fixed UI regions', () => {
    render(<AppShell />);

    expect(screen.getByText('StrongMail Agent Studio')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Working Copy')).toBeInTheDocument();
    expect(screen.getByText('Agent ready')).toBeInTheDocument();
  });
});
