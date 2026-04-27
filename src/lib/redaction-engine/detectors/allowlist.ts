/** Returns true if span is fully covered by an allowlisted term (case-insensitive). */
export function spanMatchesAllowlist(
  text: string,
  start: number,
  end: number,
  allowlist: string[] | undefined,
): boolean {
  if (!allowlist?.length) return false;
  const slice = text.slice(start, end);
  const lower = slice.toLowerCase();
  for (const term of allowlist) {
    const t = term.trim().toLowerCase();
    if (!t) continue;
    if (lower === t) return true;
  }
  return false;
}
