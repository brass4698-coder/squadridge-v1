import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PilotReadinessInstrument } from './PilotReadinessInstrument';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user', email: 't@example.com' }, loading: false }),
}));

describe('PilotReadinessInstrument', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders checklist sections and persists a check-off', () => {
    render(
      <MemoryRouter>
        <PilotReadinessInstrument />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /Before go-live/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Abort criteria/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Explicitly deferred/i })).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', {
      name: /Deployed commit recorded in the pilot kickoff doc/i,
    });
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const stored = localStorage.getItem('sr_pilot_checklist_v1:test-user');
    expect(stored).toContain('golive-commit');
  });

  it('shows implementation honesty badges without inventing live pilots', () => {
    render(
      <MemoryRouter>
        <PilotReadinessInstrument />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Implementation honesty/i)).toBeInTheDocument();
    expect(screen.getByText(/Operator-blind room encryption/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Planned/i).length).toBeGreaterThan(0);
  });
});
