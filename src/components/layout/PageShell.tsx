import { Outlet } from 'react-router-dom';
import { PublicNav } from '../nav/PublicNav';
import { FooterNav } from '../nav/FooterNav';

export function PageShell() {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PublicNav />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <FooterNav />
    </div>
  );
}
