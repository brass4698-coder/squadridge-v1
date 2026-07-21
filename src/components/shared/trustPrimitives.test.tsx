import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { maskValue, SensitiveField } from './SensitiveField';
import { TrustLabel, TRUST_LABEL_COPY } from './TrustLabel';
import { RoleGuard } from './RoleGuard';

vi.mock('../../contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

import { useAuthContext } from '../../contexts/AuthContext';

const mockAuth = vi.mocked(useAuthContext);

describe('maskValue / SensitiveField', () => {
  it('masks all but the last four characters', () => {
    expect(maskValue('abcdefghij', 4)).toBe('••••ghij');
  });

  it('reveals on click and calls onReveal once', () => {
    const onReveal = vi.fn();
    render(<SensitiveField value="secret-id-9999" onReveal={onReveal} />);
    expect(screen.getByText('••••9999')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /reveal sensitive value/i }));
    expect(screen.getByText('secret-id-9999')).toBeInTheDocument();
    expect(onReveal).toHaveBeenCalledTimes(1);
  });
});

describe('TrustLabel', () => {
  it('renders honest session copy', () => {
    render(<TrustLabel variant="session" />);
    expect(screen.getByText(TRUST_LABEL_COPY.session.label)).toBeInTheDocument();
  });

  it('never uses end-to-end wording', () => {
    const { container } = render(
      <>
        <TrustLabel variant="session" />
        <TrustLabel variant="anonymous" />
        <TrustLabel variant="moderator" />
        <TrustLabel variant="ledger" />
      </>,
    );
    expect(container.textContent?.toLowerCase()).not.toMatch(/end-to-end/);
  });
});

describe('RoleGuard', () => {
  it('renders children when role is allowed', () => {
    mockAuth.mockReturnValue({
      roles: [
        { role_key: 'facilitator', workspace_id: null, institution_id: null, granted_at: '' },
      ],
    } as ReturnType<typeof useAuthContext>);
    render(
      <MemoryRouter>
        <RoleGuard allowed={['facilitator']}>
          <p>Secret panel</p>
        </RoleGuard>
      </MemoryRouter>,
    );
    expect(screen.getByText('Secret panel')).toBeInTheDocument();
  });

  it('shows unauthorized state when role is missing', () => {
    mockAuth.mockReturnValue({
      roles: [{ role_key: 'observer', workspace_id: null, institution_id: null, granted_at: '' }],
    } as ReturnType<typeof useAuthContext>);
    render(
      <MemoryRouter>
        <RoleGuard allowed={['super_admin']}>
          <p>Secret panel</p>
        </RoleGuard>
      </MemoryRouter>,
    );
    expect(screen.queryByText('Secret panel')).not.toBeInTheDocument();
    expect(screen.getByText(/don't have access/i)).toBeInTheDocument();
  });
});
