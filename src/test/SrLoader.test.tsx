import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RouteChunkFallback, SrBootLoader, SrLoader } from '../components/system/SrLoader';

describe('SrLoader', () => {
  it('renders branded route fallback with accessible label', () => {
    render(<RouteChunkFallback label="Loading page content" />);
    expect(screen.getByRole('status', { name: 'Loading page content' })).toBeInTheDocument();
    expect(screen.getByText('Loading page content')).toBeInTheDocument();
  });

  it('renders boot variant without opacity trap', () => {
    const { container } = render(<SrBootLoader label="Loading session…" />);
    const root = container.querySelector('.sr-loader--boot');
    expect(root).toBeTruthy();
    expect(root).not.toHaveStyle({ opacity: '0' });
    expect(screen.getByRole('status', { name: 'Loading session…' })).toBeInTheDocument();
  });

  it('shows phase ticks on boot variant', () => {
    render(<SrLoader variant="boot" label="Preparing" />);
    expect(screen.getByText('Configure')).toBeInTheDocument();
    expect(screen.getByText('Release')).toBeInTheDocument();
  });
});
