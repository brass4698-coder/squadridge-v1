/** Buckets users by optional intent tags (max length for DB pool_key). */
export function poolKeyFromIntentTags(tags: readonly string[]): string {
  const cleaned = tags.map((t) => t.trim()).filter(Boolean);
  if (cleaned.length === 0) return 'default';
  const raw = `tag:${[...cleaned].sort().join('|')}`;
  return raw.length > 128 ? raw.slice(0, 128) : raw;
}
