import { Link } from 'react-router-dom';
import { MarketingPageHero } from '../../components/shared';

export function NotFoundPage() {
  return (
    <MarketingPageHero
      slim
      label="404"
      title="Page not found"
      lead="The page you are looking for does not exist, has been moved, or is no longer available."
      actions={
        <Link to="/" className="btn-institutional btn-institutional--ghost">
          Return to home
        </Link>
      }
    />
  );
}
