import type { DetectorHit, RedactionMode } from '../types';
import { detectAddressHeuristics } from './addressHeuristic';
import { detectContextualInferential } from './contextual';
import { detectEmails } from './email';
import { detectExactDates } from './dates';
import { detectGovernmentStyleIds } from './governmentId';
import { detectIpv4 } from './ipv4';
import { detectSuspiciousFilenames } from './ocrFilename';
import { detectPhones } from './phone';
import { detectQuasiIdentifiers } from './quasi';
import { detectRelationshipPhrases } from './relationship';
import { detectGenericUrls, detectSocialUrls } from './urlSocial';
import { detectSignatureBlocks } from './signatureBlock';
import { mergeDetectorHits } from './mergeSpans';

/** Fast deterministic + heuristic layer; depth depends on redaction mode. */
export function runDeterministicLayer(text: string, mode: RedactionMode): DetectorHit[] {
  const acc: DetectorHit[] = [];
  acc.push(
    ...detectEmails(text),
    ...detectPhones(text),
    ...detectSocialUrls(text),
    ...detectIpv4(text),
    ...detectGovernmentStyleIds(text),
    ...detectSignatureBlocks(text),
  );

  if (mode !== 'live_chat') {
    acc.push(
      ...detectAddressHeuristics(text),
      ...detectExactDates(text),
      ...detectQuasiIdentifiers(text),
      ...detectRelationshipPhrases(text),
      ...detectSuspiciousFilenames(text),
    );
  }

  if (mode === 'upload_ocr' || mode === 'export_ledger') {
    acc.push(...detectGenericUrls(text), ...detectContextualInferential(text));
  }

  return mergeDetectorHits(acc);
}
