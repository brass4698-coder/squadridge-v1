import { useId, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { ArrowRight, Check, ChevronDown, Lock, ShieldCheck } from 'lucide-react';
import { StatusChip } from './StatusChip';

/**
 * DocumentReleaseVisualization
 *
 * A high-fidelity, interactive visual of SquadRidge's core architectural line:
 *   private mediation room  →  facilitator release gate  →  released public record.
 *
 * The three document states are architecturally separated, and the release is
 * dramatised as an explicit facilitator action: nothing crosses from room to
 * record until the facilitator approves. The record stays sealed (obscured
 * outcome, no metadata, no anchor) until release, then reveals only approved
 * outcome text, limited metadata, and a tamper-evident verification anchor —
 * never room dialogue.
 *
 * Product truths this component encodes:
 *   - Room content never auto-publishes.
 *   - The facilitator controls release.
 *   - Only approved outcome text + limited metadata become public.
 *   - The public record is independently verifiable via an anchor, without
 *     revealing private dialogue or participant identity.
 *
 * Uses only `--sr-*` design tokens (via Tailwind aliases) so it adapts to the
 * institutional (dark) and light (paper) themes automatically. All motion is
 * gated behind `prefers-reduced-motion`.
 */

const ROOM_ENTRIES = [
  { kind: 'participant', label: 'Participant A — verified' },
  { kind: 'participant', label: 'Participant B — verified' },
  { kind: 'redacted', width: 'w-full' },
  { kind: 'redacted', width: 'w-11/12' },
  { kind: 'prompt', label: 'Facilitator prompt — round 2' },
  { kind: 'redacted', width: 'w-10/12' },
  { kind: 'redacted', width: 'w-full' },
] as const;

const GATE_CHECKPOINTS = [
  { label: 'Verification complete', detail: 'All parties confirmed before room access' },
  { label: 'Approvals recorded', detail: 'Designated approvers signed off in-session' },
  { label: 'Outcome drafted', detail: 'Authored by facilitator — no room import' },
] as const;

const RECORD_META = [
  { label: 'Organisation', value: 'Regional Mediation Centre' },
  { label: 'Released', value: 'March 14, 2024' },
  { label: 'Participants', value: '12 verified' },
  { label: 'Outcome type', value: 'Joint Statement' },
] as const;

const RECORD_OUTCOME =
  'Agreement reached on three core principles governing future land-use consultations in the northern watershed region.';

const RECORD_ANCHOR = 'sha256:8f3a…c21d';

const stageVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function DocumentReleaseVisualization() {
  const reduce = useReducedMotion();
  const [released, setReleased] = useState(false);
  const statusId = useId();

  return (
    <figure
      className="m-0"
      aria-label="Document lifecycle: a private mediation room, a facilitator-controlled release gate, and a released public record with a verification anchor"
    >
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_2.75rem_minmax(0,1fr)_2.75rem_minmax(0,1fr)]">
        {/* Stage 01 — private mediation room */}
        <Stage index={0} reduce={reduce}>
          <RoomStack reduce={reduce}>
            <StageShell
              step="01"
              title="Mediation room"
              chip={<StatusChip label="Private" variant="private" />}
              footer="Room content never auto-publishes."
            >
              <ul className="flex flex-col gap-2" aria-hidden>
                {ROOM_ENTRIES.map((entry, i) =>
                  entry.kind === 'redacted' ? (
                    <li
                      key={i}
                      className={`h-6 rounded-xs border border-line bg-surface-sunken ${entry.width}`}
                    >
                      <span className="block h-full w-full select-none rounded-xs bg-[repeating-linear-gradient(135deg,var(--sr-line)_0,var(--sr-line)_2px,transparent_2px,transparent_7px)] opacity-70" />
                    </li>
                  ) : (
                    <li
                      key={i}
                      className="flex items-center gap-2 border border-line bg-surface-sunken px-3 py-2 font-mono text-[0.7rem] text-ink-secondary"
                    >
                      {entry.kind === 'participant' ? (
                        <ShieldCheck className="size-3 shrink-0 text-brand" aria-hidden />
                      ) : (
                        <span
                          className="size-1.5 shrink-0 rounded-full bg-ink-subtle"
                          aria-hidden
                        />
                      )}
                      {entry.label}
                    </li>
                  ),
                )}
              </ul>
              <p className="sr-only">
                Room dialogue is protected and is not shown here. Verified participants take part in
                structured written rounds that never leave the room automatically.
              </p>
            </StageShell>
          </RoomStack>
        </Stage>

        <FlowConnector reduce={reduce} delay={0.18} />

        {/* Stage 02 — facilitator release gate */}
        <Stage index={1} reduce={reduce}>
          <StageShell
            step="02"
            title="Facilitator release gate"
            chip={
              <StatusChip
                label={released ? 'Released' : 'Governed'}
                variant={released ? 'released' : 'verified'}
              />
            }
            footer="You decide when — or if — an outcome is released."
            accent
          >
            <ol className="flex flex-col gap-2">
              {GATE_CHECKPOINTS.map((cp) => (
                <li
                  key={cp.label}
                  className="flex items-start gap-2.5 border border-line bg-surface-sunken px-3 py-2.5"
                >
                  <span
                    className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-brand bg-brand-soft text-brand"
                    aria-hidden
                  >
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-ink">{cp.label}</span>
                    <span className="mt-0.5 block text-[0.7rem] leading-snug text-ink-faint">
                      {cp.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-4 border-t border-line pt-4">
              <ReleaseControl
                released={released}
                reduce={reduce}
                statusId={statusId}
                onToggle={() => setReleased((v) => !v)}
              />
            </div>
          </StageShell>
        </Stage>

        <FlowConnector reduce={reduce} delay={0.3} released={released} />

        {/* Stage 03 — released public record */}
        <Stage index={2} reduce={reduce}>
          <StageShell
            step="03"
            title="Public record"
            chip={
              <StatusChip
                label={released ? 'Published' : 'Sealed'}
                variant={released ? 'released' : 'pending'}
              />
            }
            footer="No room transcript included."
          >
            <RecordBody released={released} reduce={reduce} />
          </StageShell>
        </Stage>
      </div>
    </figure>
  );
}

/* ── Stage wrapper: staggered in-view reveal ─────────────────────────────── */

function Stage({
  index,
  reduce,
  children,
}: {
  index: number;
  reduce: boolean | null;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="flex"
      custom={index}
      variants={stageVariants}
      initial={reduce ? false : 'hidden'}
      whileInView={reduce ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/* ── Layered "document stack" behind the private room ────────────────────── */

function RoomStack({ reduce, children }: { reduce: boolean | null; children: React.ReactNode }) {
  return (
    <div className="relative w-full">
      <span
        aria-hidden
        className="absolute -left-2 -top-2 hidden h-full w-full border border-line bg-surface-secondary opacity-50 lg:block"
        style={reduce ? undefined : { transform: 'rotate(-0.6deg)' }}
      />
      <span
        aria-hidden
        className="absolute -left-1 -top-1 hidden h-full w-full border border-line bg-surface-secondary opacity-70 lg:block"
      />
      <div className="relative w-full">{children}</div>
    </div>
  );
}

/* ── Shared panel shell ──────────────────────────────────────────────────── */

function StageShell({
  step,
  title,
  chip,
  footer,
  accent = false,
  children,
}: {
  step: string;
  title: string;
  chip: React.ReactNode;
  footer: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex w-full flex-col border bg-surface-elevated ${
        accent ? 'border-line-strong shadow-sr-md' : 'border-line'
      }`}
    >
      <header className="flex items-center justify-between gap-2 border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-faint">
            {step}
          </span>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
        </div>
        {chip}
      </header>
      <div className="flex flex-1 flex-col px-5 py-5">{children}</div>
      <footer className="border-t border-line px-5 py-3 text-[0.7rem] leading-snug text-ink-faint">
        {footer}
      </footer>
    </div>
  );
}

/* ── Directional connector between stages ────────────────────────────────── */

function FlowConnector({
  reduce,
  delay,
  released,
}: {
  reduce: boolean | null;
  delay: number;
  released?: boolean;
}) {
  const active = released ?? true;
  return (
    <div className="flex items-center justify-center py-1 lg:py-0" aria-hidden>
      {/* Desktop: horizontal arrow */}
      <motion.div
        className="hidden items-center lg:flex"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={reduce ? undefined : { opacity: 1 }}
        transition={{ duration: 0.4, delay }}
        viewport={{ once: true }}
      >
        <span
          className={`h-px w-6 transition-colors duration-500 ${
            active ? 'bg-brand' : 'bg-line-strong'
          }`}
        />
        <ArrowRight
          className={`-ml-1 size-3.5 transition-colors duration-500 ${
            active ? 'text-brand' : 'text-ink-subtle'
          }`}
          strokeWidth={2}
        />
      </motion.div>
      {/* Mobile: downward chevron */}
      <ChevronDown
        className={`size-4 lg:hidden ${active ? 'text-brand' : 'text-ink-subtle'}`}
        strokeWidth={2}
      />
    </div>
  );
}

/* ── Facilitator release control ─────────────────────────────────────────── */

function ReleaseControl({
  released,
  reduce,
  statusId,
  onToggle,
}: {
  released: boolean;
  reduce: boolean | null;
  statusId: string;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={released}
        aria-describedby={statusId}
        className="focus-ring group flex w-full items-center justify-center gap-2 rounded-sm border border-brand bg-brand px-4 py-2.5 text-[0.8125rem] font-medium tracking-[0.01em] text-brand-on transition-colors duration-normal hover:bg-brand-hover data-[released=true]:border-line-strong data-[released=true]:bg-surface-secondary data-[released=true]:text-ink"
        data-released={released}
      >
        {released ? (
          <>
            <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
            Outcome released
          </>
        ) : (
          <>
            <Lock className="size-3.5" strokeWidth={2} aria-hidden />
            Approve &amp; release outcome
          </>
        )}
      </button>
      <p
        id={statusId}
        aria-live="polite"
        className="mt-2 text-center text-[0.7rem] leading-snug text-ink-faint"
      >
        {released ? (
          <>Approved outcome published with a verification anchor. Reset to replay.</>
        ) : (
          <>Nothing crosses to the public record until you approve.</>
        )}
      </p>
      {released && !reduce ? (
        <span className="sr-only" role="status">
          Outcome released and anchored.
        </span>
      ) : null}
    </div>
  );
}

/* ── Released record body (sealed → published) ───────────────────────────── */

function RecordBody({ released, reduce }: { released: boolean; reduce: boolean | null }) {
  return (
    <div className="flex flex-1 flex-col">
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-faint">
        Outcome summary — facilitator-authored
      </span>

      {released ? (
        <motion.p
          key="outcome"
          className="mt-2 text-xs leading-relaxed text-ink-secondary"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {RECORD_OUTCOME}
        </motion.p>
      ) : (
        <div className="relative mt-2" aria-hidden>
          <div className="flex flex-col gap-1.5">
            <span className="h-3 w-full rounded-xs bg-surface-sunken" />
            <span className="h-3 w-11/12 rounded-xs bg-surface-sunken" />
            <span className="h-3 w-9/12 rounded-xs bg-surface-sunken" />
          </div>
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">
            <Lock className="size-3" strokeWidth={2} /> Awaiting release
          </span>
        </div>
      )}

      {/* Metadata rail */}
      <dl className="mt-4 grid grid-cols-2 gap-px border border-line bg-line">
        {RECORD_META.map((m) => (
          <MetaCell
            key={m.label}
            label={m.label}
            value={m.value}
            shown={released}
            reduce={reduce}
          />
        ))}
        <div className="col-span-2 bg-surface px-3 py-2.5">
          <dt className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-ink-faint">
            Verification anchor
          </dt>
          <dd className="mt-1 flex items-center gap-2">
            {released ? (
              <>
                <AnchorPulse reduce={reduce} />
                <span className="truncate font-mono text-[0.7rem] text-ink-secondary">
                  {RECORD_ANCHOR}
                </span>
              </>
            ) : (
              <span className="font-mono text-[0.7rem] text-ink-subtle">— not yet anchored</span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function MetaCell({
  label,
  value,
  shown,
  reduce,
}: {
  label: string;
  value: string;
  shown: boolean;
  reduce: boolean | null;
}) {
  return (
    <div className="bg-surface px-3 py-2.5">
      <dt className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-ink-faint">{label}</dt>
      <dd className="mt-1 text-[0.75rem] text-ink">
        {shown ? (
          <motion.span
            className="block"
            initial={reduce ? false : { opacity: 0 }}
            animate={reduce ? undefined : { opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            {value}
          </motion.span>
        ) : (
          <span className="block h-3 w-3/4 rounded-xs bg-surface-sunken" aria-hidden />
        )}
      </dd>
    </div>
  );
}

/* ── Tamper-evident anchor with a calm verification pulse ─────────────────── */

function AnchorPulse({ reduce }: { reduce: boolean | null }) {
  return (
    <span className="relative flex size-3.5 shrink-0 items-center justify-center" aria-hidden>
      {!reduce ? (
        <motion.span
          className="absolute inset-0 rounded-full border border-brand"
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.9, 1] }}
          transition={{ duration: 2.6, ease: 'easeInOut', repeat: Infinity }}
        />
      ) : null}
      <span className="flex size-3.5 items-center justify-center rounded-full border border-brand bg-brand-soft text-brand">
        <Check className="size-2" strokeWidth={3} />
      </span>
    </span>
  );
}
