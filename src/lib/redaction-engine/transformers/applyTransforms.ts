import type { Finding, TextSpan } from '../types';

function sortBySpanDesc(a: Finding, b: Finding): number {
  return b.span.start - a.span.start || b.span.end - a.span.end;
}

/** Apply findings as non-overlapping replacements from end to start. */
export function applyFindingsToText(text: string, findings: Finding[]): string {
  if (findings.length === 0) return text;
  const sorted = [...findings].filter((f) => f.decision.action !== 'preserve').sort(sortBySpanDesc);
  let out = text;
  for (const f of sorted) {
    const { start, end } = f.span;
    if (start < 0 || end > out.length || start >= end) continue;
    const repl =
      f.decision.transformType === 'audience_token'
        ? f.decision.replacementKey || '[TOKEN]'
        : f.decision.replacementKey || '[REDACTED]';
    out = out.slice(0, start) + repl + out.slice(end);
  }
  return out;
}

export function findingsToHighlights(findings: Finding[]): {
  start: number;
  end: number;
  kind: string;
  decision: Finding['decision']['action'];
  replacementPreview: string;
}[] {
  return findings
    .filter((f) => f.decision.action !== 'preserve')
    .map((f) => ({
      start: f.span.start,
      end: f.span.end,
      kind: f.kind,
      decision: f.decision.action,
      replacementPreview: f.decision.replacementKey,
    }));
}

/** Shift spans after replacements — v1 returns highlights mapped to original indices only (pre-transform). */
export function validateSpans(text: string, spans: TextSpan[]): boolean {
  return spans.every((s) => s.start >= 0 && s.end <= text.length && s.start < s.end);
}
