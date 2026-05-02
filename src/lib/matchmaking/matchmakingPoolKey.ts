const MAX_POOL_KEY = 128;
const ZK_SEGMENT_PREFIX = '|zk:';
const MAX_ZK_SCOPE_IN_KEY = 64;

/** Buckets users by optional intent tags and optional ZK-verified scope (max length for DB pool_key). */
export function poolKeyFromIntentTags(
  tags: readonly string[],
  zkVerifiedScope?: string | null,
): string {
  const cleaned = tags.map((t) => t.trim()).filter(Boolean);
  let tagPart = cleaned.length === 0 ? 'default' : `tag:${[...cleaned].sort().join('|')}`;

  if (tagPart.length > MAX_POOL_KEY) {
    tagPart = tagPart.slice(0, MAX_POOL_KEY);
  }

  const zk = zkVerifiedScope?.trim();
  if (!zk) {
    return tagPart;
  }

  const zkSeg = `${ZK_SEGMENT_PREFIX}${zk.slice(0, MAX_ZK_SCOPE_IN_KEY)}`;
  let combined = tagPart + zkSeg;

  if (combined.length <= MAX_POOL_KEY) {
    return combined;
  }

  const reserve = zkSeg.length;
  const maxTag = Math.max(0, MAX_POOL_KEY - reserve);
  const shrunk =
    cleaned.length === 0 ? 'def' : `tag:${[...cleaned].sort().join('|')}`.slice(0, maxTag);

  combined = shrunk + zkSeg;
  return combined.slice(0, MAX_POOL_KEY);
}
