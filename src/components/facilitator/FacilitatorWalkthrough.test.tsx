import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FacilitatorWalkthrough } from './FacilitatorWalkthrough';

vi.mock('../../demo/DemoWalkthroughContext', () => ({
  useDemoWalkthrough: () => ({ startWalkthrough: vi.fn() }),
}));

vi.mock('../../lib/demoLogin', () => ({
  isDemoLoginEnabled: () => false,
}));

describe('FacilitatorWalkthrough', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the first Configure step and advances', () => {
    render(
      <MemoryRouter>
        <FacilitatorWalkthrough />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Pilot walkthrough/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Create a governed room/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    expect(
      screen.getByRole('heading', { name: /Issue participant credentials/i }),
    ).toBeInTheDocument();
  });

  it('can be dismissed and restarted', () => {
    render(
      <MemoryRouter>
        <FacilitatorWalkthrough />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Dismiss walkthrough/i }));
    expect(screen.getByText(/Pilot walkthrough dismissed/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Restart guide/i }));
    expect(screen.getByRole('heading', { name: /Create a governed room/i })).toBeInTheDocument();
  });
});
