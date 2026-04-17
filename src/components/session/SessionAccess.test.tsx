import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionAccess } from './SessionAccess';

vi.mock('../../lib/env', () => ({
  isDemoSquadShortcutsEnabled: vi.fn(),
}));

vi.mock('../../pages/SessionHubPage', () => ({
  SessionHubPage: () => <div data-testid="session-hub">hub</div>,
}));
vi.mock('../../pages/SessionPage', () => ({
  SessionPage: ({ squadId }: { squadId: string }) => (
    <div data-testid="session-page">{squadId}</div>
  ),
}));
vi.mock('../auth/RequireAuth', () => ({
  RequireAuth: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="require-auth">{children}</div>
  ),
}));

import { isDemoSquadShortcutsEnabled } from '../../lib';

describe('SessionAccess', () => {
  beforeEach(() => {
    vi.mocked(isDemoSquadShortcutsEnabled).mockReset();
  });

  it('renders hub when no squad id', () => {
    vi.mocked(isDemoSquadShortcutsEnabled).mockReturnValue(false);
    const router = createMemoryRouter(
      [{ path: '/session/:squadId?', element: <SessionAccess /> }],
      {
        initialEntries: ['/session'],
      },
    );
    render(<RouterProvider router={router} />);
    expect(screen.getByTestId('session-hub')).toBeInTheDocument();
  });

  it('renders session room when squad id is present', () => {
    vi.mocked(isDemoSquadShortcutsEnabled).mockReturnValue(false);
    const router = createMemoryRouter(
      [{ path: '/session/:squadId?', element: <SessionAccess /> }],
      {
        initialEntries: ['/session/real-squad'],
      },
    );
    render(<RouterProvider router={router} />);
    expect(screen.getByTestId('session-page')).toHaveTextContent('real-squad');
  });

  it('redirects demo session to hub when demo shortcuts disabled', () => {
    vi.mocked(isDemoSquadShortcutsEnabled).mockReturnValue(false);
    const router = createMemoryRouter(
      [{ path: '/session/:squadId?', element: <SessionAccess /> }],
      {
        initialEntries: ['/session/demo-session-001'],
      },
    );
    render(<RouterProvider router={router} />);
    expect(router.state.location.pathname).toBe('/session');
  });

  it('allows demo session when shortcuts enabled', () => {
    vi.mocked(isDemoSquadShortcutsEnabled).mockReturnValue(true);
    const router = createMemoryRouter(
      [{ path: '/session/:squadId?', element: <SessionAccess /> }],
      {
        initialEntries: ['/session/demo-session-001'],
      },
    );
    render(<RouterProvider router={router} />);
    expect(screen.getByTestId('session-page')).toHaveTextContent('demo-session-001');
  });
});
