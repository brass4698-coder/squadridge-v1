import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { SessionAccess } from './SessionAccess';

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

describe('SessionAccess', () => {
  it('renders hub when no squad id', () => {
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
    const router = createMemoryRouter(
      [{ path: '/session/:squadId?', element: <SessionAccess /> }],
      {
        initialEntries: ['/session/real-squad'],
      },
    );
    render(<RouterProvider router={router} />);
    expect(screen.getByTestId('session-page')).toHaveTextContent('real-squad');
  });

  it('renders session room for demo squad id when routed through SessionAccess', () => {
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
