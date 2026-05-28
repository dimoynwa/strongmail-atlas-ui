import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PreviewColumn } from '../preview/PreviewColumn';

describe('PreviewColumn', () => {
  it('renders without throwing', () => {
    render(<PreviewColumn />);
    expect(screen.getByText('Live preview')).toBeInTheDocument();
    expect(screen.getByText('Select a template to preview it here')).toBeInTheDocument();
  });
});
