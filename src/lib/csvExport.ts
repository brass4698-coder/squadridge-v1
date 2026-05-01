/**
 * Client-side CSV export.
 *
 * Used by the Insights prototype so institutional partners and funders can
 * inspect the CSV shape before production reporting is wired. The signed-URL /
 * edge-function variant lives in phase 3 work; this module only exports
 * client-side sample rows today.
 *
 * No external deps — Blob + URL.createObjectURL + a hidden anchor. Works in
 * every modern browser. Unicode is preserved via a UTF-8 BOM so Excel does
 * not mojibake the result.
 */

/** Quote a single CSV cell per RFC 4180. Values that contain quotes, commas,
 *  or newlines are wrapped in double quotes; embedded quotes are doubled. */
function escapeCell(value: unknown): string {
  if (value == null) return '';
  const s = typeof value === 'string' ? value : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function rowsToCsv<T extends Record<string, unknown>>(
  rows: ReadonlyArray<T>,
  columns: ReadonlyArray<{ key: keyof T & string; label: string }>,
): string {
  const header = columns.map((c) => escapeCell(c.label)).join(',');
  const body = rows.map((row) => columns.map((c) => escapeCell(row[c.key])).join(',')).join('\r\n');
  return `${header}\r\n${body}`;
}

/**
 * Trigger a CSV download for the given rows. Filename is sanitized to a
 * filesystem-safe slug; the supplied extension is preserved.
 */
export function downloadCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: ReadonlyArray<T>,
  columns: ReadonlyArray<{ key: keyof T & string; label: string }>,
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const csv = rowsToCsv(rows, columns);
  /* UTF-8 BOM so Excel reads non-ASCII correctly. */
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const safeName = filename.replace(/[^a-z0-9_\-.]+/gi, '-').replace(/^-+|-+$/g, '');
  const a = document.createElement('a');
  a.href = url;
  a.download = safeName.endsWith('.csv') ? safeName : `${safeName}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  /* Defer revoke so Safari has a chance to start the download. */
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
