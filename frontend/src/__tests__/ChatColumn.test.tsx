import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChatColumn } from '../chat/ChatColumn';

describe('ChatColumn', () => {
  it('renders without throwing', () => {
    render(<ChatColumn />);
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Open a template first')).toBeInTheDocument();
  });
});
