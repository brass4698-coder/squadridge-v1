/**
 * FinancialProjectionsPage
 *
 * Interactive financial projections dashboard for SquadRidge.
 * Accessible to admin and moderator roles only.
 *
 * Sections:
 *   1. Scenario selector (Conservative / Base / Optimistic)
 *   2. Editable assumption controls (growth rate, per-seat price, burn)
 *   3. KPI summary row (ARR, active squads, mediator activations, runway)
 *   4. Quarterly revenue vs. burn area chart
 *   5. Impact-to-revenue correlation chart (5-pillar metrics)
 *   6. Cohort projection table
 */

import { useState, useMemo, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────── */
type Scenario = 'conservative' | 'base' | 'optimistic';

interface Assumptions {
  initialSquads: number;        // squads at Q1
  squadGrowthPct: number;       // quarterly squad growth rate (0–100)
  perSeatMonthly: number;       // institutional per-seat $/mo
  seatsPerSquad: number;        // avg institutional seats per squad
  grantAnnual: number;          // annual grant funding $
  ngoLicenseMonthly: number;    // flat NGO license $/mo per org
  ngoOrgs: number;              // number of NGO orgs at launch
  ngoGrowthPct: number;         // quarterly NGO org growth
  monthlyBurn: number;          // base operating burn $/mo
  burnGrowthPct: number;        // burn growth per quarter (headcount)
  initialGrantRunwayMonths: number; // months of grant coverage at start
}

interface QuarterRow {
  quarter: string;
  squads: number;
  mediatorActivations: number;
  seatRevenue: number;
  ngoRevenue: number;
  grantRevenue: number;
  totalRevenue: number;
  quarterlyBurn: number;
  netCashFlow: number;
  cumulativeCash: number;
  costPerIntervention: number;
}

// ── Scenario presets ────────────────────────────────────────────────────────── */
const SCENARIO_PRESETS: Record<Scenario, Assumptions> = {
  conservative: {
    initialSquads: 8,
    squadGrowthPct: 15,
    perSeatMonthly: 24,
    seatsPerSquad: 3,
    grantAnnual: 80_000,
    ngoLicenseMonthly: 180,
    ngoOrgs: 4,
    ngoGrowthPct: 12,
    monthlyBurn: 22_000,
    burnGrowthPct: 3,
    initialGrantRunwayMonths: 18,
  },
  base: {
    initialSquads: 20,
    squadGrowthPct: 28,
    perSeatMonthly: 32,
    seatsPerSquad: 4,
    grantAnnual: 200_000,
    ngoLicenseMonthly: 240,
    ngoOrgs: 10,
    ngoGrowthPct: 22,
    monthlyBurn: 28_000,
    burnGrowthPct: 5,
    initialGrantRunwayMonths: 24,
  },
  optimistic: {
    initialSquads: 45,
    squadGrowthPct: 42,
    perSeatMonthly: 40,
    seatsPerSquad: 5,
    grantAnnual: 500_000,
    ngoLicenseMonthly: 320,
    ngoOrgs: 22,
    ngoGrowthPct: 35,
    monthlyBurn: 35_000,
    burnGrowthPct: 8,
    initialGrantRunwayMonths: 30,
  },
};

// ── Projection engine ────────────────────────────────────────────────────────── */
function buildProjections(a: Assumptions, quarters = 12): QuarterRow[] {
  const rows: QuarterRow[] = [];
  let squads = a.initialSquads;
  let ngoOrgs = a.ngoOrgs;
  let burnMonthly = a.monthlyBurn;
  let cumulativeCash = a.initialGrantRunwayMonths * a.monthlyBurn; // opening grant runway

  const SESSIONS_PER_SQUAD_PER_MONTH = 6;
  const INTERVENTION_RATE = 0.4; // 40% of sessions are de-escalation interventions

  for (let q = 0; q < quarters; q++) {
    const year = Math.floor(q / 4) + 2025;
    const qNum = (q % 4) + 1;
    const label = `Q${qNum} '${String(year).slice(2)}`;

    // Revenue streams (quarterly)
    const seatRevenue  = squads * a.seatsPerSquad * a.perSeatMonthly * 3;
    const ngoRevenue   = ngoOrgs * a.ngoLicenseMonthly * 3;
    const grantRevenue = a.grantAnnual / 4; // evenly distributed
    const totalRevenue = seatRevenue + ngoRevenue + grantRevenue;

    // Burn
    const quarterlyBurn = burnMonthly * 3;
    const netCashFlow   = totalRevenue - quarterlyBurn;
    cumulativeCash     += netCashFlow;

    // Impact metric
    const sessionsThisQuarter = squads * SESSIONS_PER_SQUAD_PER_MONTH * 3;
    const interventions = sessionsThisQuarter * INTERVENTION_RATE;
    const mediatorActivations = Math.round(squads * 1.8); // avg mediators per squad cadence
    const costPerIntervention = interventions > 0 ? quarterlyBurn / interventions : 0;

    rows.push({
      quarter: label,
      squads: Math.round(squads),
      mediatorActivations,
      seatRevenue,
      ngoRevenue,
      grantRevenue,
      totalRevenue,
      quarterlyBurn,
      netCashFlow,
      cumulativeCash,
      costPerIntervention,
    });

    // Compound for next quarter
    squads    *= (1 + a.squadGrowthPct / 100);
    ngoOrgs   *= (1 + a.ngoGrowthPct / 100);
    burnMonthly *= (1 + a.burnGrowthPct / 100);
  }

  return rows;
}

// ── Helpers ──────────────────────────────────────────────────────────────────── */
const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtK = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : fmt.format(n);
const fmtNum = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));

// Chart colors (token-aligned, from sr- palette)
const C = {
  primary:  '#2aa39a',
  secondary:'#6f8ab1',
  success:  '#5aa67f',
  warning:  '#c79a4a',
  danger:   '#c46a5e',
  grid:     'rgba(255,255,255,0.06)',
  tooltip:  '#12151c',
};

// ── Sub-components ────────────────────────────────────────────────────────────── */
interface KpiCardProps { label: string; value: string; sub?: string; trend?: 'up' | 'down' | 'neutral'; }
function KpiCard({ label, value, sub, trend }: KpiCardProps) {
  const trendColor = trend === 'up' ? C.success : trend === 'down' ? C.danger : C.secondary;
  return (
    <div style={{
      background: 'var(--sr-bg-elevated)',
      border: '1px solid var(--sr-line)',
      borderRadius: 'var(--sr-radius-lg)',
      padding: 'var(--space-5) var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-1)',
      minWidth: 0,
    }}>
      <span style={{ fontSize: 'var(--sr-text-xs)', color: 'var(--sr-ink-faint)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: 'var(--sr-text-xl)', fontFamily: 'var(--font-display)', color: 'var(--sr-ink)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 'var(--sr-text-xs)', color: trendColor }}>
          {sub}
        </span>
      )}
    </div>
  );
}

interface SliderProps { label: string; value: number; min: number; max: number; step: number; format: (v: number) => string; onChange: (v: number) => void; }
function Slider({ label, value, min, max, step, format, onChange }: SliderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label style={{ fontSize: 'var(--sr-text-sm)', color: 'var(--sr-ink-secondary)', fontWeight: 500 }}>{label}</label>
        <span style={{ fontSize: 'var(--sr-text-sm)', color: 'var(--sr-primary)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{format(value)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: 'var(--sr-primary)',
          cursor: 'pointer',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--sr-text-xs)', color: 'var(--sr-ink-subtle)' }}>{format(min)}</span>
        <span style={{ fontSize: 'var(--sr-text-xs)', color: 'var(--sr-ink-subtle)' }}>{format(max)}</span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.tooltip,
      border: '1px solid var(--sr-line)',
      borderRadius: 'var(--sr-radius-md)',
      padding: 'var(--space-3) var(--space-4)',
      fontSize: 'var(--sr-text-xs)',
      color: 'var(--sr-ink)',
      boxShadow: 'var(--sr-shadow-md)',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--sr-ink-secondary)' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, marginBottom: 'var(--space-1)' }}>
          {p.name}: {typeof p.value === 'number' ? fmtK(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────── */
export default function FinancialProjectionsPage() {
  const [scenario, setScenario] = useState<Scenario>('base');
  const [assumptions, setAssumptions] = useState<Assumptions>(SCENARIO_PRESETS.base);
  const [showTable, setShowTable] = useState(false);

  const selectScenario = useCallback((s: Scenario) => {
    setScenario(s);
    setAssumptions(SCENARIO_PRESETS[s]);
  }, []);

  const updateAssumption = useCallback(<K extends keyof Assumptions>(key: K, value: Assumptions[K]) => {
    setAssumptions(prev => ({ ...prev, [key]: value }));
    setScenario('base'); // mark as custom
  }, []);

  const rows = useMemo(() => buildProjections(assumptions, 12), [assumptions]);

  // Derived KPIs from final quarter
  const lastRow   = rows[rows.length - 1];
  const firstRow  = rows[0];
  const annualArr = lastRow.totalRevenue * 4; // annualized from last quarter
  const runwayMonths = lastRow.cumulativeCash > 0
    ? Math.round(lastRow.cumulativeCash / (lastRow.quarterlyBurn / 3))
    : 0;
  const arrGrowthPct = firstRow.totalRevenue > 0
    ? Math.round(((lastRow.totalRevenue - firstRow.totalRevenue) / firstRow.totalRevenue) * 100)
    : 0;

  // Impact-to-revenue chart data (last 4 quarters as representative year)
  const impactData = rows.slice(-4).map(r => ({
    quarter: r.quarter,
    'Seat Revenue':  r.seatRevenue,
    'NGO Licenses':  r.ngoRevenue,
    'Grants':        r.grantRevenue,
    'Burn':          r.quarterlyBurn,
    'Active Squads': r.squads,
    'Cost/Interv.':  Math.round(r.costPerIntervention),
  }));

  // Revenue stream breakdown for area chart
  const revenueData = rows.map(r => ({
    quarter: r.quarter,
    'Seat Revenue':  r.seatRevenue,
    'NGO Licenses':  r.ngoRevenue,
    'Grants':        r.grantRevenue,
    'Burn':          r.quarterlyBurn,
    'Net Cash Flow': r.netCashFlow,
  }));

  const SCENARIO_LABELS: Record<Scenario, string> = {
    conservative: 'Conservative',
    base: 'Base',
    optimistic: 'Optimistic',
  };

  const sectionHead: React.CSSProperties = {
    fontSize: 'var(--sr-text-lg)',
    fontFamily: 'var(--font-display)',
    color: 'var(--sr-ink)',
    marginBottom: 'var(--space-4)',
    fontWeight: 400,
  };

  const card: React.CSSProperties = {
    background: 'var(--sr-bg-elevated)',
    border: '1px solid var(--sr-line)',
    borderRadius: 'var(--sr-radius-lg)',
    padding: 'var(--space-6)',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--sr-bg)',
      color: 'var(--sr-ink)',
      fontFamily: 'var(--font-body)',
      padding: 'var(--space-8) var(--space-6)',
      maxWidth: 'var(--content-wide)',
      margin: '0 auto',
    }}>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5" aria-hidden="true">
            <path d="M3 3v18h18"/>
            <path d="m7 16 4-4 4 4 4-4"/>
          </svg>
          <h1 style={{ fontSize: 'var(--sr-text-xl)', fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.01em' }}>
            Financial Projections
          </h1>
          <span style={{
            marginLeft: 'auto',
            fontSize: 'var(--sr-text-xs)',
            background: 'var(--sr-primary-soft)',
            color: 'var(--sr-primary)',
            padding: '0.2em 0.7em',
            borderRadius: 'var(--sr-radius-full)',
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}>CONFIDENTIAL</span>
        </div>
        <p style={{ fontSize: 'var(--sr-text-sm)', color: 'var(--sr-ink-secondary)', maxWidth: '60ch' }}>
          12-quarter forward model. Adjust assumptions below to explore scenarios.
          All projections are illustrative and intended for internal planning only.
        </p>
      </div>

      {/* ── Scenario selector ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
        {(Object.keys(SCENARIO_LABELS) as Scenario[]).map(s => (
          <button
            key={s}
            onClick={() => selectScenario(s)}
            style={{
              padding: 'var(--space-2) var(--space-5)',
              borderRadius: 'var(--sr-radius-full)',
              border: scenario === s ? `1.5px solid ${C.primary}` : '1.5px solid var(--sr-line)',
              background: scenario === s ? 'var(--sr-primary-soft)' : 'transparent',
              color: scenario === s ? C.primary : 'var(--sr-ink-secondary)',
              fontSize: 'var(--sr-text-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--sr-transition)',
            }}
          >
            {SCENARIO_LABELS[s]}
          </button>
        ))}
      </div>

      {/* ── KPI row ───────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-10)',
      }}>
        <KpiCard
          label="Year-3 ARR"
          value={fmtK(annualArr)}
          sub={`+${arrGrowthPct}% vs Q1`}
          trend="up"
        />
        <KpiCard
          label="Active Squads (Q12)"
          value={fmtNum(lastRow.squads)}
          sub={`Started at ${firstRow.squads}`}
          trend="up"
        />
        <KpiCard
          label="Mediator Acts. (Q12)"
          value={fmtNum(lastRow.mediatorActivations)}
          trend="up"
        />
        <KpiCard
          label="Runway (post Q12)"
          value={`${runwayMonths}mo`}
          sub={lastRow.cumulativeCash > 0 ? 'Cash positive' : 'Needs funding'}
          trend={lastRow.cumulativeCash > 0 ? 'up' : 'down'}
        />
        <KpiCard
          label="Cost / Intervention"
          value={fmt.format(Math.round(lastRow.costPerIntervention))}
          sub="Q12 efficiency"
          trend="neutral"
        />
        <KpiCard
          label="Quarterly Burn (Q12)"
          value={fmtK(lastRow.quarterlyBurn)}
          sub={`+${assumptions.burnGrowthPct}% qoq`}
          trend="neutral"
        />
      </div>

      {/* ── Charts + Assumptions ─────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 340px',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-8)',
        alignItems: 'start',
      }}>

        {/* Revenue vs. Burn area chart */}
        <div style={card}>
          <h2 style={sectionHead}>Revenue Streams vs. Burn Rate</h2>
          <p style={{ fontSize: 'var(--sr-text-xs)', color: 'var(--sr-ink-faint)', marginBottom: 'var(--space-5)' }}>
            Stacked quarterly revenue by stream against operating burn
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradSeat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.primary} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={C.primary} stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="gradNgo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.secondary} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={C.secondary} stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="gradGrant" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.success} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.success} stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#7b8290' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmtK(v)} tick={{ fontSize: 11, fill: '#7b8290' }} axisLine={false} tickLine={false} width={56} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#7b8290' }} />
              <Area type="monotone" dataKey="Seat Revenue" stackId="1" stroke={C.primary} fill="url(#gradSeat)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="NGO Licenses" stackId="1" stroke={C.secondary} fill="url(#gradNgo)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="Grants" stackId="1" stroke={C.success} fill="url(#gradGrant)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="Burn" stroke={C.danger} fill="none" strokeWidth={2} strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Assumptions panel */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <h2 style={sectionHead}>Assumptions</h2>
          <Slider
            label="Squad Growth Rate (qoq)"
            value={assumptions.squadGrowthPct}
            min={5} max={80} step={1}
            format={v => `${v}%`}
            onChange={v => updateAssumption('squadGrowthPct', v)}
          />
          <Slider
            label="Per-Seat Monthly Price"
            value={assumptions.perSeatMonthly}
            min={10} max={100} step={1}
            format={v => `$${v}`}
            onChange={v => updateAssumption('perSeatMonthly', v)}
          />
          <Slider
            label="Seats Per Squad"
            value={assumptions.seatsPerSquad}
            min={1} max={12} step={1}
            format={v => `${v}`}
            onChange={v => updateAssumption('seatsPerSquad', v)}
          />
          <Slider
            label="NGO License ($/mo per org)"
            value={assumptions.ngoLicenseMonthly}
            min={50} max={800} step={10}
            format={v => `$${v}`}
            onChange={v => updateAssumption('ngoLicenseMonthly', v)}
          />
          <Slider
            label="Monthly Burn"
            value={assumptions.monthlyBurn}
            min={5_000} max={100_000} step={1_000}
            format={v => fmtK(v)}
            onChange={v => updateAssumption('monthlyBurn', v)}
          />
          <Slider
            label="Annual Grant Funding"
            value={assumptions.grantAnnual}
            min={0} max={1_000_000} step={10_000}
            format={v => fmtK(v)}
            onChange={v => updateAssumption('grantAnnual', v)}
          />

          {/* Quick-reset */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'auto' }}>
            {(Object.keys(SCENARIO_LABELS) as Scenario[]).map(s => (
              <button
                key={s}
                onClick={() => selectScenario(s)}
                style={{
                  flex: 1,
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--sr-radius-md)',
                  border: '1px solid var(--sr-line)',
                  background: 'var(--sr-bg-secondary)',
                  color: 'var(--sr-ink-secondary)',
                  fontSize: 'var(--sr-text-xs)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'var(--sr-transition)',
                }}
              >
                Reset to {SCENARIO_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Impact-to-revenue bar chart ───────────────────────────────────── */}
      <div style={{ ...card, marginBottom: 'var(--space-8)' }}>
        <h2 style={sectionHead}>Impact → Revenue: Final Year</h2>
        <p style={{ fontSize: 'var(--sr-text-xs)', color: 'var(--sr-ink-faint)', marginBottom: 'var(--space-5)' }}>
          Revenue streams vs. burn across the final four quarters (Year 3)
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={impactData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
            <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#7b8290' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => fmtK(v)} tick={{ fontSize: 11, fill: '#7b8290' }} axisLine={false} tickLine={false} width={56} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#7b8290' }} />
            <Bar dataKey="Seat Revenue" stackId="rev" fill={C.primary} radius={[0,0,0,0]} />
            <Bar dataKey="NGO Licenses" stackId="rev" fill={C.secondary} radius={[0,0,0,0]} />
            <Bar dataKey="Grants" stackId="rev" fill={C.success} radius={[4,4,0,0]} />
            <Bar dataKey="Burn" fill={C.danger} opacity={0.5} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Projection table ─────────────────────────────────────────────────── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ ...sectionHead, marginBottom: 0 }}>Quarterly Cohort Breakdown</h2>
          <button
            onClick={() => setShowTable(t => !t)}
            style={{
              fontSize: 'var(--sr-text-xs)',
              color: 'var(--sr-primary)',
              background: 'var(--sr-primary-soft)',
              border: 'none',
              borderRadius: 'var(--sr-radius-sm)',
              padding: 'var(--space-1) var(--space-3)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'var(--sr-transition)',
            }}
          >
            {showTable ? 'Hide table' : 'Show table'}
          </button>
        </div>

        {showTable && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 'var(--sr-text-xs)', fontVariantNumeric: 'tabular-nums' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sr-line)' }}>
                  {['Quarter','Squads','Mediators','Seat Rev.','NGO Rev.','Grants','Total Rev.','Burn','Net Flow','Cum. Cash','$/Interv.'].map(h => (
                    <th key={h} style={{ padding: 'var(--space-2) var(--space-3)', textAlign: 'right', color: 'var(--sr-ink-faint)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.quarter}
                    style={{
                      borderBottom: '1px solid var(--sr-divider)',
                      background: i % 2 === 0 ? 'transparent' : 'var(--sr-bg-secondary)',
                    }}
                  >
                    {[
                      r.quarter,
                      fmtNum(r.squads),
                      fmtNum(r.mediatorActivations),
                      fmtK(r.seatRevenue),
                      fmtK(r.ngoRevenue),
                      fmtK(r.grantRevenue),
                      fmtK(r.totalRevenue),
                      fmtK(r.quarterlyBurn),
                      fmtK(r.netCashFlow),
                      fmtK(r.cumulativeCash),
                      fmt.format(Math.round(r.costPerIntervention)),
                    ].map((v, ci) => (
                      <td
                        key={ci}
                        style={{
                          padding: 'var(--space-2) var(--space-3)',
                          textAlign: ci === 0 ? 'left' : 'right',
                          color: ci === 0
                            ? 'var(--sr-ink-secondary)'
                            : (ci === 8 && typeof r.netCashFlow === 'number')
                              ? r.netCashFlow >= 0 ? C.success : C.danger
                              : 'var(--sr-ink)',
                          fontWeight: ci === 0 ? 500 : 400,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer note */}
      <p style={{
        marginTop: 'var(--space-8)',
        fontSize: 'var(--sr-text-xs)',
        color: 'var(--sr-ink-subtle)',
        maxWidth: '80ch',
      }}>
        Revenue model: per-seat institutional licensing + NGO flat-rate subscriptions + grant disbursements.
        Impact correlation uses a 40% intervention rate on squad session volume.
        Projections are forward-looking estimates and should not be relied upon as financial advice.
      </p>
    </div>
  );
}
