import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GeneralLayout } from '../general/GeneralLayout';

describe('GeneralLayout', () => {
  it('renders without throwing', () => {
    render(<GeneralLayout />);
    expect(screen.getByText('General Agent')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask about templates…')).toBeInTheDocument();
  });
});
