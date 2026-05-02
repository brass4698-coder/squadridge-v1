import { useId, useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Loader2, Minus, Send } from 'lucide-react';
import {
  CardEyebrow,
  CTAGroup,
  FormField,
  InfoCard,
  InlineAction,
  PageHero,
  SectionBand,
  SectionIntro,
  SurfaceCard,
  StatusDot,
} from '../components';
import { areInvestorFixturesEnabled, usePartnerCaseStudies } from '../lib';

/**
 * PartnersPage — Phase 2 institutional hub.
 *
 * Surface includes:
 *   - hero with apply / read trust / request deployment template CTAs
 *   - pilot deployments (case studies, fixture-backed)
 *   - deployment templates with the full operational shape (identity defaults,
 *     room boundary, release format, reporting fields)
 *   - role-permission matrix across visitor / participant / facilitator /
 *     moderator / partner / admin
 *   - integration notes grid (SSO, audit log export, reporting, API)
 *   - contract-stage lifecycle (Discovery → Co-design → Pilot → Review → Renewal)
 *   - inline "Request deployment template" form that resolves to a confirmation
 *     state; phase 3 wires this to the existing waitlist Supabase function.
 */

type DeploymentTemplate = {
  id: string;
  label: string;
  body: string;
  identity: string;
  boundary: string;
  release: string;
  reporting: string;
};

const DEPLOYMENT_TEMPLATES: ReadonlyArray<DeploymentTemplate> = [
  {
    id: 'funder-evaluation',
    label: 'Funder evaluation template',
    body: 'Eligibility model, room boundary, release format, and reporting fields tuned for funder-led program evaluation.',
    identity: 'Verified eligibility, pseudonymous in-room',
    boundary: '8–12 participants, 4–6 weeks, 3 rounds',
    release: 'Structured consensus + outcome metrics',
    reporting: 'Anonymous timestamped record, aggregate metrics on request',
  },
  {
    id: 'workplace-mediation',
    label: 'Workplace mediation template',
    body: 'Harm-report structure, witness protection defaults, and HR-readable consensus output. Includes optional anonymized aggregate reports.',
    identity: 'Verified eligibility, anonymous default',
    boundary: '4–8 participants, 1–3 sessions, no transcript',
    release: 'Resolution statement + recommended action',
    reporting: 'HR-readable consensus, optional aggregate',
  },
  {
    id: 'veterans-dialogue',
    label: 'Veterans dialogue template',
    body: 'Career-risk-aware identity defaults, unit-level pseudonymous handles, and facilitator-only attribution storage.',
    identity: 'Verified eligibility, unit-level pseudonyms',
    boundary: '6–10 participants, recurring weekly, no recording',
    release: 'Facilitator-approved learnings, no participant ID',
    reporting: 'Institutional record, no external attribution',
  },
];

type Permission = 'yes' | 'no' | 'cond';
type Role = 'Visitor' | 'Participant' | 'Facilitator' | 'Moderator' | 'Partner' | 'Admin';
type PermissionRow = { action: string } & Record<Role, Permission>;

const ROLES: ReadonlyArray<Role> = [
  'Visitor',
  'Participant',
  'Facilitator',
  'Moderator',
  'Partner',
  'Admin',
];

const PERMISSION_MATRIX: ReadonlyArray<PermissionRow> = [
  {
    action: 'Read public records',
    Visitor: 'yes',
    Participant: 'yes',
    Facilitator: 'yes',
    Moderator: 'yes',
    Partner: 'yes',
    Admin: 'yes',
  },
  {
    action: 'Join a sealed room',
    Visitor: 'no',
    Participant: 'cond',
    Facilitator: 'yes',
    Moderator: 'yes',
    Partner: 'no',
    Admin: 'yes',
  },
  {
    action: 'Initiate a cohort',
    Visitor: 'no',
    Participant: 'no',
    Facilitator: 'yes',
    Moderator: 'yes',
    Partner: 'cond',
    Admin: 'yes',
  },
  {
    action: 'Approve release',
    Visitor: 'no',
    Participant: 'no',
    Facilitator: 'yes',
    Moderator: 'yes',
    Partner: 'no',
    Admin: 'yes',
  },
  {
    action: 'View aggregate metrics',
    Visitor: 'yes',
    Participant: 'yes',
    Facilitator: 'yes',
    Moderator: 'yes',
    Partner: 'yes',
    Admin: 'yes',
  },
  {
    action: 'Drill into per-cohort metrics',
    Visitor: 'no',
    Participant: 'no',
    Facilitator: 'cond',
    Moderator: 'yes',
    Partner: 'cond',
    Admin: 'yes',
  },
  {
    action: 'Audit log access',
    Visitor: 'no',
    Participant: 'no',
    Facilitator: 'no',
    Moderator: 'yes',
    Partner: 'cond',
    Admin: 'yes',
  },
  {
    action: 'Export institutional reports',
    Visitor: 'no',
    Participant: 'no',
    Facilitator: 'cond',
    Moderator: 'yes',
    Partner: 'yes',
    Admin: 'yes',
  },
  {
    action: 'Manage roles and access',
    Visitor: 'no',
    Participant: 'no',
    Facilitator: 'no',
    Moderator: 'cond',
    Partner: 'no',
    Admin: 'yes',
  },
];

type IntegrationNote = {
  id: string;
  label: string;
  status: 'live' | 'stale' | 'empty';
  body: string;
};

const INTEGRATION_NOTES: ReadonlyArray<IntegrationNote> = [
  {
    id: 'sso',
    label: 'Single sign-on',
    status: 'live',
    body: 'SAML and OIDC for institutional identity providers. Participants stay anonymous in-room regardless of how they signed in.',
  },
  {
    id: 'audit',
    label: 'Audit log export',
    status: 'live',
    body: 'Structured operational events exportable to a partner-controlled bucket on request, with a configurable retention window.',
  },
  {
    id: 'reporting',
    label: 'Institutional reporting',
    status: 'live',
    body: 'Anonymous, timestamped outcomes published to the public ledger, with partner-readable aggregate metrics on a configurable cadence.',
  },
  {
    id: 'api',
    label: 'Read API',
    status: 'stale',
    body: 'Read-only REST and GraphQL endpoints for ledger records and aggregate metrics, currently in private preview for pilot partners.',
  },
];

type LifecycleStage = {
  id: string;
  label: string;
  body: string;
  /** Where the typical deployment is in the lifecycle. */
  current?: boolean;
};

const LIFECYCLE: ReadonlyArray<LifecycleStage> = [
  {
    id: 'discovery',
    label: 'Discovery',
    body: 'Joint review of program goals, risk model, and the rooms in scope. Sets the eligibility model and release format.',
  },
  {
    id: 'co-design',
    label: 'Co-design',
    body: 'Pick a deployment template, configure room boundaries, and align reporting fields with the partner stakeholder group.',
  },
  {
    id: 'pilot',
    label: 'Pilot',
    current: true,
    body: '1–3 squads run the configured rooms over 4–6 weeks. Outcomes are released to the public ledger as cohorts complete.',
  },
  {
    id: 'review',
    label: 'Review',
    body: 'Joint review of operating metrics, partner reporting, and any incidents. Confirms whether the trust model held under load.',
  },
  {
    id: 'renewal',
    label: 'Renewal',
    body: 'Expand to additional cohorts or program areas, or close out with a final report. Renewal is opt-in, not automatic.',
  },
];

function permissionCell(p: Permission): { icon: ReactElement; label: string; cls: string } {
  switch (p) {
    case 'yes':
      return {
        icon: <Check aria-hidden className="size-3.5" strokeWidth={2.5} />,
        label: 'Allowed',
        cls: 'bg-brand-soft text-brand-hover border-brand/40',
      };
    case 'cond':
      return {
        icon: <Minus aria-hidden className="size-3.5" strokeWidth={2.5} />,
        label: 'Conditional',
        cls: 'bg-amber/[0.08] text-amber-light border-amber/40',
      };
    case 'no':
      return {
        icon: <Minus aria-hidden className="size-3.5" strokeWidth={2.5} />,
        label: 'Not allowed',
        cls: 'bg-surface-sunken text-ink-subtle border-line',
      };
  }
}

function PermissionMatrix() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-auto overscroll-x-contain rounded-md border border-line bg-surface-elevated">
      <table className="w-full min-w-[44rem] border-collapse font-sans text-[0.84rem]">
        <thead className="bg-surface-secondary">
          <tr>
            <th className="border-b border-line px-3 py-2.5 text-left font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Action
            </th>
            {ROLES.map((r) => (
              <th
                key={r}
                className="border-b border-l border-line px-2 py-2.5 text-center font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-ink-faint"
              >
                {r}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_MATRIX.map((row) => (
            <tr key={row.action} className="border-b border-line last:border-b-0">
              <th
                scope="row"
                className="px-3 py-2 text-left font-sans text-[0.85rem] font-medium text-ink"
              >
                {row.action}
              </th>
              {ROLES.map((role) => {
                const cell = permissionCell(row[role]);
                return (
                  <td key={role} className="border-l border-line px-2 py-2 text-center">
                    <span
                      title={cell.label}
                      className={`inline-flex size-6 items-center justify-center rounded-md border ${cell.cls}`}
                    >
                      {cell.icon}
                      <span className="sr-only">{cell.label}</span>
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 border-t border-line bg-surface-elevated px-3 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-faint">
        <li className="flex items-center gap-1.5">
          <span className="inline-flex size-4 items-center justify-center rounded-[3px] border border-brand/40 bg-brand-soft text-brand-hover">
            <Check aria-hidden className="size-2.5" strokeWidth={2.5} />
          </span>
          Allowed
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-flex size-4 items-center justify-center rounded-[3px] border border-amber/40 bg-amber/[0.08] text-amber-light">
            <Minus aria-hidden className="size-2.5" strokeWidth={2.5} />
          </span>
          Conditional
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-flex size-4 items-center justify-center rounded-[3px] border border-line bg-surface-sunken text-ink-subtle">
            <Minus aria-hidden className="size-2.5" strokeWidth={2.5} />
          </span>
          Not allowed
        </li>
      </ul>
    </div>
  );
}

function LifecycleStrip() {
  return (
    <ol className="grid gap-3 md:grid-cols-5 md:gap-2">
      {LIFECYCLE.map((stage, i) => (
        <li
          key={stage.id}
          className={`relative flex flex-col rounded-md border bg-surface-elevated p-4 ${
            stage.current ? 'border-brand' : 'border-line'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
              {String(i + 1).padStart(2, '0')}
            </span>
            {stage.current ? <StatusDot state="live">In progress</StatusDot> : null}
          </div>
          <p className="mt-3 font-sans text-[0.95rem] font-semibold leading-snug text-ink">
            {stage.label}
          </p>
          <p className="mt-2 font-sans text-[0.82rem] leading-relaxed text-ink-secondary">
            {stage.body}
          </p>
        </li>
      ))}
    </ol>
  );
}

type RequestState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'submitted'; templateId: string }
  | { kind: 'error'; message: string };

function RequestTemplateForm() {
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [templateId, setTemplateId] = useState<string>(DEPLOYMENT_TEMPLATES[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [state, setState] = useState<RequestState>({ kind: 'idle' });
  const formId = useId();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !organization.trim() || !email.trim()) {
      setState({ kind: 'error', message: 'Name, organization, and contact email are required.' });
      return;
    }
    setState({ kind: 'submitting' });
    /* Phase 2 ships this as an inline confirmation; phase 3 wires it to the
     * existing waitlist edge function with the selected template id pre-filled
     * into the application stream. */
    setTimeout(() => {
      setState({ kind: 'submitted', templateId });
    }, 400);
  }

  function handleReset() {
    setName('');
    setOrganization('');
    setEmail('');
    setNotes('');
    setTemplateId(DEPLOYMENT_TEMPLATES[0]?.id ?? '');
    setState({ kind: 'idle' });
  }

  if (state.kind === 'submitted') {
    const template = DEPLOYMENT_TEMPLATES.find((t) => t.id === state.templateId);
    return (
      <SurfaceCard role="status" aria-live="polite" className="border-brand bg-brand-soft">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand bg-brand text-brand-on"
          >
            <Check className="size-4" />
          </span>
          <CardEyebrow tone="brand">Request received</CardEyebrow>
        </div>
        <p className="mt-3 font-sans text-[0.94rem] leading-relaxed text-ink">
          Thanks — we'll reach out to <span className="font-semibold">{name}</span> at{' '}
          <span className="font-semibold">{organization}</span> within five business days with the{' '}
          <span className="font-semibold">{template?.label ?? 'requested template'}</span> and a
          private walkthrough.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <InlineAction as={Link} to="/#waitlist">
            Continue to pilot application
            <ArrowRight aria-hidden className="size-3.5" />
          </InlineAction>
          <button
            type="button"
            onClick={handleReset}
            className="font-sans text-[0.85rem] text-ink-secondary underline-offset-4 hover:text-ink hover:underline"
          >
            Send another request
          </button>
        </div>
      </SurfaceCard>
    );
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      aria-busy={state.kind === 'submitting'}
      className="rounded-md border border-line bg-surface-elevated p-5 md:p-6"
    >
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <FormField label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="sr-input"
            placeholder="Full name"
          />
        </FormField>
        <FormField label="Organization">
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
            className="sr-input"
            placeholder="Institution or program"
          />
        </FormField>
        <FormField label="Contact email" className="md:col-span-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            inputMode="email"
            autoComplete="email"
            className="sr-input"
            placeholder="name@organization.org"
          />
        </FormField>
        <fieldset className="md:col-span-2">
          <legend className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Template
          </legend>
          <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(min(12rem,100%),1fr))] gap-3">
            {DEPLOYMENT_TEMPLATES.map((tpl) => {
              const active = templateId === tpl.id;
              return (
                <label
                  key={tpl.id}
                  className={`group flex min-h-[60px] min-w-0 cursor-pointer items-start gap-3 rounded-md border px-3.5 py-3 transition-colors ${
                    active
                      ? 'border-brand bg-brand-soft'
                      : 'border-line bg-surface-elevated hover:border-line-strong'
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={tpl.id}
                    checked={active}
                    onChange={() => setTemplateId(tpl.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-ink-faint bg-surface-sunken peer-checked:border-brand peer-checked:bg-brand"
                  >
                    <span className="size-1.5 rounded-full bg-brand-on opacity-0 transition-opacity peer-checked:opacity-100" />
                  </span>
                  <span
                    className={`min-w-0 whitespace-normal break-words font-sans text-[0.84rem] leading-[1.35] ${
                      active ? 'font-medium text-ink' : 'text-ink-secondary'
                    }`}
                  >
                    {tpl.label}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <FormField label="Notes (optional)" className="md:col-span-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="sr-input resize-none py-2.5"
            placeholder="Program scope, jurisdictions, room count, or open questions."
          />
        </FormField>
      </div>
      {state.kind === 'error' ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-sem-warning bg-sem-warning-soft px-3 py-2 font-sans text-[0.85rem] text-sem-warning"
        >
          {state.message}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={state.kind === 'submitting'}
          className="focus-ring btn-primary inline-flex min-h-[44px] items-center justify-center gap-2 px-5 py-2.5 font-sans text-[0.9rem] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.kind === 'submitting' ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden /> Sending…
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden /> Request template
            </>
          )}
        </button>
        <span className="font-sans text-[0.82rem] text-ink-faint">
          We respond within five business days.
        </span>
      </div>
    </form>
  );
}

export function PartnersPage() {
  const enabled = areInvestorFixturesEnabled();
  const { data: caseStudies } = usePartnerCaseStudies();

  return (
    <>
      <SectionBand tone="navy">
        <PageHero
          eyebrow="Partners"
          title="Deploy SquadRidge inside your program."
          actions={
            <CTAGroup>
              <Link to="/#waitlist" className="btn-primary no-underline">
                Apply for pilot access
              </Link>
              <Link to="/trust" className="btn-secondary no-underline">
                Read the trust architecture
              </Link>
              <Link to="#request-template" className="btn-secondary no-underline">
                Request a deployment template
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
              <a
                href="/partner-one-pager.html"
                target="_blank"
                rel="noopener"
                className="btn-secondary no-underline"
              >
                One-pager (printable)
              </a>
            </CTAGroup>
          }
        >
          <p>
            Institutional partners run pilots with one of three templates, each tuned for a class of
            high-stakes dialogue. Templates ship with the room boundary, identity defaults, release
            format, and reporting fields the partner needs.
          </p>
        </PageHero>
      </SectionBand>

      <SectionBand tone="black">
        <div className="flex min-w-0 flex-col gap-12">
          {enabled ? (
            <section aria-labelledby="case-heading">
              <SectionIntro id="case-heading" title="Pilot deployments to date">
                <p>
                  Pilot data, illustrative. Real partner names are not published unless partners opt
                  in.
                </p>
              </SectionIntro>
              <ul className="mt-6 grid gap-4 md:grid-cols-3 md:gap-5">
                {(caseStudies ?? []).map((p) => (
                  <InfoCard
                    as="li"
                    key={p.id}
                    eyebrow={p.sector}
                    title={p.outcome}
                    className="list-none"
                    footer={
                      <p className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-faint">
                        Template: {p.templateLabel}
                      </p>
                    }
                  >
                    <p className="mt-2 font-sans text-[0.82rem] leading-snug text-ink-faint">
                      {p.scale}
                    </p>
                    <p>{p.body}</p>
                  </InfoCard>
                ))}
              </ul>
            </section>
          ) : null}

          <section id="pilot-scope" className="scroll-mt-24" aria-labelledby="template-heading">
            <SectionIntro id="template-heading" title="Deployment templates">
              <p>
                Each template specifies the operational defaults that survive contact with a real
                program: identity model, room boundary, release format, and reporting fields.
              </p>
            </SectionIntro>
            <ul className="mt-6 grid gap-4 md:grid-cols-3 md:gap-5">
              {DEPLOYMENT_TEMPLATES.map((tpl) => (
                <SurfaceCard as="li" key={tpl.id} className="list-none">
                  <CardEyebrow>Template</CardEyebrow>
                  <p className="mt-2 font-sans text-[1rem] font-semibold leading-snug text-ink">
                    {tpl.label}
                  </p>
                  <p className="mt-3 font-sans text-[0.86rem] leading-relaxed text-ink-secondary">
                    {tpl.body}
                  </p>
                  <dl className="mt-4 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 border-t border-line pt-3 font-sans text-[0.8rem] leading-snug">
                    <dt className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-ink-faint">
                      Identity
                    </dt>
                    <dd className="text-ink-secondary">{tpl.identity}</dd>
                    <dt className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-ink-faint">
                      Boundary
                    </dt>
                    <dd className="text-ink-secondary">{tpl.boundary}</dd>
                    <dt className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-ink-faint">
                      Release
                    </dt>
                    <dd className="text-ink-secondary">{tpl.release}</dd>
                    <dt className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-ink-faint">
                      Reporting
                    </dt>
                    <dd className="text-ink-secondary">{tpl.reporting}</dd>
                  </dl>
                </SurfaceCard>
              ))}
            </ul>
          </section>
        </div>
      </SectionBand>

      <SectionBand tone="navy">
        <div className="flex min-w-0 flex-col gap-12">
          <section aria-labelledby="permissions-heading">
            <SectionIntro id="permissions-heading" title="Role-permission matrix">
              <p>
                What each role can do across rooms, records, metrics, and controls. Conditional
                cells mean the action is allowed for explicitly delegated rooms or programs only.
              </p>
            </SectionIntro>
            <div className="mt-6 min-w-0 max-w-full">
              <PermissionMatrix />
            </div>
          </section>

          <section id="pilot-process" className="scroll-mt-24" aria-labelledby="lifecycle-heading">
            <SectionIntro id="lifecycle-heading" title="Contract lifecycle">
              <p>
                Typical pilot lifecycle. Renewal is opt-in; programs can also exit cleanly at any
                stage with their public records preserved.
              </p>
            </SectionIntro>
            <div className="mt-6">
              <LifecycleStrip />
            </div>
          </section>
        </div>
      </SectionBand>

      <SectionBand tone="black">
        <div className="flex min-w-0 flex-col gap-12">
          <section aria-labelledby="integration-heading">
            <SectionIntro id="integration-heading" title="Integration notes" />
            <ul className="mt-5 grid gap-4 md:grid-cols-2 md:gap-5">
              {INTEGRATION_NOTES.map((note) => (
                <SurfaceCard as="li" key={note.id} className="list-none">
                  <div className="flex items-baseline justify-between gap-3">
                    <CardEyebrow>{note.label}</CardEyebrow>
                    <StatusDot state={note.status} />
                  </div>
                  <p className="mt-3 font-sans text-[0.9rem] leading-[1.6] text-ink-secondary">
                    {note.body}
                  </p>
                </SurfaceCard>
              ))}
            </ul>
          </section>

          <section id="request-template" aria-labelledby="request-heading" className="scroll-mt-24">
            <SectionIntro id="request-heading" title="Request a deployment template">
              <p>
                Tell us a little about the program and pick the template closest to your shape —
                we'll schedule a private walkthrough and prefill your pilot application accordingly.
              </p>
            </SectionIntro>
            <div className="mt-6">
              <RequestTemplateForm />
            </div>
          </section>

          <SurfaceCard as="aside">
            <CardEyebrow tone="brand">Coming next</CardEyebrow>
            <p className="mt-2 font-sans text-[0.92rem] leading-relaxed text-ink-secondary">
              Production-wired deployment-template requests routed to the same intake stream as
              pilot applications, with downloadable PDF templates and contract-stage status visible
              to authenticated partner contacts.
            </p>
            <InlineAction as={Link} to="/insights" className="mt-4">
              See operating metrics
              <ArrowRight aria-hidden className="size-3.5" />
            </InlineAction>
          </SurfaceCard>
        </div>
      </SectionBand>
    </>
  );
}
