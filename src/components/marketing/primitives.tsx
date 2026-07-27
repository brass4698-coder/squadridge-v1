// ============================================================
// Marketing primitives — thin re-exports from shared components.
// Prefer importing from `src/components/shared` in new code.
// ============================================================
import { privatePublicItems } from '../../data/privatePublicItems';
import { PrivatePublicSplit, SectionLabel, type PrivatePublicSplitProps } from '../shared';

/** @deprecated Use `SectionLabel` from `src/components/shared`. */
export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <SectionLabel text={String(children)} />;
}

/** @deprecated Use `PrivatePublicSplit` from `src/components/shared`. */
export function SplitPanelVisual({
  size = 'hero',
  privateHeading,
  privateItems = privatePublicItems.private,
  publicHeading,
  publicItems = privatePublicItems.public,
  bridgeLabel,
}: Omit<PrivatePublicSplitProps, 'privateItems' | 'publicItems'> & {
  privateItems?: string[];
  publicItems?: string[];
}) {
  return (
    <PrivatePublicSplit
      size={size}
      privateHeading={privateHeading}
      privateItems={privateItems}
      publicHeading={publicHeading}
      publicItems={publicItems}
      bridgeLabel={bridgeLabel}
    />
  );
}

export { PrivacyChip, VerifiedChip, MetadataRow } from './legacy-chips';
