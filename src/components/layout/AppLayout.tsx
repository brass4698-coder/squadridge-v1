import { Link, Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-navy text-white">
      <header className="border-b border-gray-light border-opacity-20 px-md py-sm">
        <nav className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-sm" aria-label="Main">
          <Link to="/" className="font-heading text-fluid-h3 text-teal">
            SquadRidge
          </Link>
          <ul className="flex flex-wrap gap-lg text-fluid-small">
            <li>
              <Link to="/" className="text-gray-light hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal">
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/onboarding"
                className="text-gray-light hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                Onboarding
              </Link>
            </li>
            <li>
              <Link
                to="/session"
                className="text-gray-light hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                Session
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-md py-xl">
        <Outlet />
      </main>
    </div>
  );
}
