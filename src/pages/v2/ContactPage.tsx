import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <p className="text-app-meta font-semibold uppercase tracking-widest text-ink-secondary">
        Contact
      </p>
      <h1 className="mt-2 text-page-title text-ink">Get in touch</h1>
      <p className="mt-4 text-app-body leading-relaxed text-ink-secondary">
        For pilot access, security questions, or partnership inquiries, email our team or submit a
        formal access request.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <a href="mailto:hello@squadridge.org">hello@squadridge.org</a>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/request-access">Request access</Link>
        </Button>
      </div>
    </div>
  );
}
