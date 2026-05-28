import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PreviewSection } from '../preview/PreviewSection';

describe('PreviewSection', () => {
  it('renders without throwing', () => {
    render(<PreviewSection />);
    expect(screen.getByText('Live preview')).toBeInTheDocument();
    expect(screen.getByText('Select a template to preview it here')).toBeInTheDocument();
  });
});
