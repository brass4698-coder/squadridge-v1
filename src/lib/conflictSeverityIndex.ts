/**
 * Conflict Severity Index (CSI) — pure calculation + trace for pilot analytics.
 * Design: docs/product/conflict-severity-index.md. Not a shipped public API until in CURRENT_STATUS.
 */
export type CsiSeverityBand = 'green' | 'yellow' | 'red';

export type CsiComponentKey =
  | 'sentimentTrajectory'
  | 'grievanceClustering'
  | 'resourceScarcity'
  | 'ingroupOutgroup'
  | 'escalationVelocity'
  | 'violenceNormalization';

const COMPONENT_ORDER: CsiComponentKey[] = [
  'sentimentTrajectory',
  'grievanceClustering',
  'resourceScarcity',
  'ingroupOutgroup',
  'escalationVelocity',
  'violenceNormalization',
];

export interface CsiComponentWeights {
  sentimentTrajectory: number;
  grievanceClustering: number;
  resourceScarcity: number;
  ingroupOutgroup: number;
  escalationVelocity: number;
  violenceNormalization: number;
}

export const DEFAULT_CSI_COMPONENT_WEIGHTS: CsiComponentWeights = {
  sentimentTrajectory: 1 / 6,
  grievanceClustering: 1 / 6,
  resourceScarcity: 1 / 6,
  ingroupOutgroup: 1 / 6,
  escalationVelocity: 1 / 6,
  violenceNormalization: 1 / 6,
};

export interface CsiBandThresholds {
  /** Inclusive upper bound of green (default 30). */
  greenMax: number;
  /** Inclusive upper bound of yellow (default 60); above is red. */
  yellowMax: number;
}

export const DEFAULT_CSI_BANDS: CsiBandThresholds = { greenMax: 30, yellowMax: 60 };

/** Reference points for 0–100 mapping — tune per program and locale. */
export interface CsiReferenceThresholds {
  sentimentNegativeRef: number;
  grievanceRef: number;
  resourceRefPer1k: number;
  ingroupRef: number;
  sentimentDeltaRef: number;
  violenceRefPerSession: number;
}

export const DEFAULT_CSI_REFS: CsiReferenceThresholds = {
  /** Treat ~15% negative in 24h as “saturating” the sentiment sub-score. */
  sentimentNegativeRef: 0.15,
  /** Clustering index at or above this maps to 100 on grievance. */
  grievanceRef: 0.4,
  /** Resource keywords per 1k messages. */
  resourceRefPer1k: 8,
  /** In-group / out-group marker rate. */
  ingroupRef: 0.12,
  /** Magnitude of day-over-day sentiment drop (positive stress number). */
  sentimentDeltaRef: 0.25,
  /** Violence-justifying lines per session. */
  violenceRefPerSession: 2.5,
};

/** One row of trace for audit / UI (“why did CSI move?”). */
export interface CsiTraceLine {
  component: CsiComponentKey;
  label: string;
  rawInput: string;
  normalizedScore: number;
  weight: number;
  weightedContribution: number;
}

export interface CsiComponentScores {
  sentimentTrajectory: number;
  grievanceClustering: number;
  resourceScarcity: number;
  ingroupOutgroup: number;
  escalationVelocity: number;
  violenceNormalization: number;
}

export interface CsiGrievanceEntry {
  theme: string;
  weight: number;
}

/**
 * All inputs in interpretable units; see docs/product/conflict-severity-index.md.
 * Values are expected from a trusted feature pipeline, not from raw client ciphertext.
 */
export interface CsiSignalInputs {
  /** Share 0–1 of messages in the rolling 24h window classified negative / high tension. */
  negativeMessageRatio24h: number;
  /** Thematic cluster strength normalized by program (0+). */
  grievanceClusterIndex: number;
  topGrievances?: CsiGrievanceEntry[];
  /** Count per 1000 messages. */
  resourceKeywordsPer1k: number;
  /** Rate 0–1 of in/out-group rhetorical hits. */
  ingroupOutgroupRate: number;
  /** Day-over-day change in mean composite sentiment: negative = worse (typ. -1..1). */
  sentimentDeltaDayOverDay: number;
  /** Violence-justifying statements per session in the window. */
  violenceJustifyingPerSession: number;
}

export interface CsiComputeOptions {
  weights?: Partial<CsiComponentWeights>;
  references?: Partial<CsiReferenceThresholds>;
  bands?: CsiBandThresholds;
  /** If true, flag when score enters yellow+ or any component is very high. */
  detectEscalationOnBand?: boolean;
}

export interface CsiResult {
  csiScore: number;
  band: CsiSeverityBand;
  componentScores: CsiComponentScores;
  trace: CsiTraceLine[];
  /** True when the composite or a component exceeds configured escalation rules. */
  detectedEscalation: boolean;
  topGrievances: CsiGrievanceEntry[];
  meta: {
    weights: CsiComponentWeights;
    references: CsiReferenceThresholds;
    bands: CsiBandThresholds;
  };
}

function mergeWeights(partial?: Partial<CsiComponentWeights>): CsiComponentWeights {
  const d = DEFAULT_CSI_COMPONENT_WEIGHTS;
  return {
    sentimentTrajectory: partial?.sentimentTrajectory ?? d.sentimentTrajectory,
    grievanceClustering: partial?.grievanceClustering ?? d.grievanceClustering,
    resourceScarcity: partial?.resourceScarcity ?? d.resourceScarcity,
    ingroupOutgroup: partial?.ingroupOutgroup ?? d.ingroupOutgroup,
    escalationVelocity: partial?.escalationVelocity ?? d.escalationVelocity,
    violenceNormalization: partial?.violenceNormalization ?? d.violenceNormalization,
  };
}

function normalizeSumWeights(w: CsiComponentWeights): CsiComponentWeights {
  const sum =
    w.sentimentTrajectory +
    w.grievanceClustering +
    w.resourceScarcity +
    w.ingroupOutgroup +
    w.escalationVelocity +
    w.violenceNormalization;
  if (sum <= 0) return { ...DEFAULT_CSI_COMPONENT_WEIGHTS };
  return {
    sentimentTrajectory: w.sentimentTrajectory / sum,
    grievanceClustering: w.grievanceClustering / sum,
    resourceScarcity: w.resourceScarcity / sum,
    ingroupOutgroup: w.ingroupOutgroup / sum,
    escalationVelocity: w.escalationVelocity / sum,
    violenceNormalization: w.violenceNormalization / sum,
  };
}

export function mergeReferences(partial?: Partial<CsiReferenceThresholds>): CsiReferenceThresholds {
  return { ...DEFAULT_CSI_REFS, ...partial };
}

/** Map a nonnegative ratio to 0–100 where `ref` corresponds to "full" severity. */
export function ratioToSeverityScore(value: number, ref: number): number {
  if (ref <= 0) return 0;
  if (value <= 0) return 0;
  return Math.min(100, (value / ref) * 100);
}

export function scoreSentimentTrajectory(negativeMessageRatio24h: number, ref: number): number {
  return ratioToSeverityScore(negativeMessageRatio24h, ref);
}

export function scoreGrievanceClustering(clusterIndex: number, ref: number): number {
  return ratioToSeverityScore(clusterIndex, ref);
}

export function scoreResourceScarcity(keywordsPer1k: number, refPer1k: number): number {
  return ratioToSeverityScore(keywordsPer1k, refPer1k);
}

export function scoreIngroupOutgroup(rate: number, ref: number): number {
  return ratioToSeverityScore(rate, ref);
}

/** `delta` is change in mean sentiment: more negative = faster escalation. */
export function scoreEscalationVelocity(sentimentDeltaDayOverDay: number, ref: number): number {
  const stress = Math.max(0, -sentimentDeltaDayOverDay);
  return ratioToSeverityScore(stress, ref);
}

export function scoreViolenceNormalization(perSession: number, ref: number): number {
  return ratioToSeverityScore(perSession, ref);
}

export function csiBandFromScore(
  score: number,
  bands: CsiBandThresholds = DEFAULT_CSI_BANDS,
): CsiSeverityBand {
  if (score <= bands.greenMax) return 'green';
  if (score <= bands.yellowMax) return 'yellow';
  return 'red';
}

const COMPONENT_HIGH = 85;

/**
 * Build CSI from normalized signal inputs, weights, and reference thresholds. Deterministic; safe for unit tests.
 */
export function computeConflictSeverityIndex(
  input: CsiSignalInputs,
  options: CsiComputeOptions = {},
): CsiResult {
  const refs = mergeReferences(options.references);
  const weights = normalizeSumWeights(mergeWeights(options.weights));
  const bands = options.bands ?? DEFAULT_CSI_BANDS;
  const onBand = options.detectEscalationOnBand ?? true;

  const sSent = scoreSentimentTrajectory(input.negativeMessageRatio24h, refs.sentimentNegativeRef);
  const sGri = scoreGrievanceClustering(input.grievanceClusterIndex, refs.grievanceRef);
  const sRes = scoreResourceScarcity(input.resourceKeywordsPer1k, refs.resourceRefPer1k);
  const sIn = scoreIngroupOutgroup(input.ingroupOutgroupRate, refs.ingroupRef);
  const sVel = scoreEscalationVelocity(input.sentimentDeltaDayOverDay, refs.sentimentDeltaRef);
  const sVio = scoreViolenceNormalization(
    input.violenceJustifyingPerSession,
    refs.violenceRefPerSession,
  );

  const componentScores: CsiComponentScores = {
    sentimentTrajectory: Math.round(sSent),
    grievanceClustering: Math.round(sGri),
    resourceScarcity: Math.round(sRes),
    ingroupOutgroup: Math.round(sIn),
    escalationVelocity: Math.round(sVel),
    violenceNormalization: Math.round(sVio),
  };

  const componentRaw: Record<CsiComponentKey, number> = {
    sentimentTrajectory: sSent,
    grievanceClustering: sGri,
    resourceScarcity: sRes,
    ingroupOutgroup: sIn,
    escalationVelocity: sVel,
    violenceNormalization: sVio,
  };

  const trace: CsiTraceLine[] = COMPONENT_ORDER.map((key) => {
    const n = componentRaw[key];
    const w = weights[key];
    return {
      component: key,
      label: key,
      rawInput: describeRawInput(key, input),
      normalizedScore: Math.round(n),
      weight: w,
      weightedContribution: n * w,
    };
  });

  const rawCsi = trace.reduce((acc, row) => acc + row.weightedContribution, 0);
  const csiScore = Math.max(0, Math.min(100, Math.round(rawCsi)));
  const band = csiBandFromScore(csiScore, bands);

  const anyComponentHigh = COMPONENT_ORDER.some(
    (k) => (componentScores[k] as number) >= COMPONENT_HIGH,
  );
  const bandNotGreen = band !== 'green';
  const detectedEscalation = onBand ? bandNotGreen || anyComponentHigh : anyComponentHigh;

  return {
    csiScore,
    band,
    componentScores,
    trace,
    detectedEscalation,
    topGrievances: input.topGrievances ? [...input.topGrievances] : [],
    meta: { weights, references: refs, bands },
  };
}

function describeRawInput(key: CsiComponentKey, input: CsiSignalInputs): string {
  switch (key) {
    case 'sentimentTrajectory':
      return `neg_ratio_24h=${input.negativeMessageRatio24h.toFixed(4)}`;
    case 'grievanceClustering':
      return `grievance_index=${input.grievanceClusterIndex.toFixed(4)}; top=${(
        input.topGrievances ?? []
      )
        .slice(0, 3)
        .map((g) => g.theme)
        .join(',')}`;
    case 'resourceScarcity':
      return `resource_per_1k=${input.resourceKeywordsPer1k.toFixed(4)}`;
    case 'ingroupOutgroup':
      return `in_out_rate=${input.ingroupOutgroupRate.toFixed(4)}`;
    case 'escalationVelocity':
      return `sentiment_dod_delta=${input.sentimentDeltaDayOverDay.toFixed(4)}`;
    case 'violenceNormalization':
      return `violence_justify_per_session=${input.violenceJustifyingPerSession.toFixed(4)}`;
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}
