import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrandPresenceLoader } from './BrandPresenceLoader';

describe('BrandPresenceLoader', () => {
  it('renders brand and accessible loading label', () => {
    render(<BrandPresenceLoader label="Loading…" phrase="Preparing the room" />);
    expect(screen.getByTestId('brand-presence-loader')).toBeInTheDocument();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.getByText('SquadRidge')).toBeInTheDocument();
    expect(screen.getByText('Preparing the room')).toBeInTheDocument();
  });

  it('supports compact variant', () => {
    render(<BrandPresenceLoader variant="compact" label="Loading…" />);
    expect(screen.getByTestId('brand-presence-loader')).toHaveAttribute('data-variant', 'compact');
  });
});
