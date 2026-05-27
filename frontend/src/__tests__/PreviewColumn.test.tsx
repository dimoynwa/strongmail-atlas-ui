import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PreviewColumn } from '../preview/PreviewColumn';

describe('PreviewColumn', () => {
  it('renders without throwing', () => {
    render(<PreviewColumn />);
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Open a template to see the preview')).toBeInTheDocument();
  });
});
