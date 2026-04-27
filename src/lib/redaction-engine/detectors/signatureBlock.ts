import type { DetectorHit } from '../types';

const SIG_LINE = /^(?:Best regards|Sincerely|Regards|Thanks,|Thank you,)\s*$/i;

export function detectSignatureBlocks(text: string): DetectorHit[] {
  const hits: DetectorHit[] = [];
  const lines = text.split(/\r?\n/);
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineStart = offset;
    offset += line.length + (i < lines.length - 1 ? 1 : 0);
    if (!SIG_LINE.test(line)) continue;
    const endLine = Math.min(lines.length - 1, i + 8);
    const blockText = lines.slice(i, endLine + 1).join('\n');
    const endOffset = lineStart + blockText.length;
    if (blockText.length > 400) continue;
    if (/@|\+?\d[\d\s.-]{8,}\d|https?:\/\//i.test(blockText)) {
      hits.push({
        span: { start: lineStart, end: endOffset },
        kind: 'direct_signature_block',
        category: 'direct_identifier',
        detectorId: 'heuristic.signature_block',
        confidence: 0.65,
      });
    }
  }
  return hits;
}
