/** Kebab-case slug for /use-cases#[slug] deep links. */
export function contextSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
