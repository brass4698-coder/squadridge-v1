/**
 * Transformers.js implementation — loaded as a separate chunk from `translation.worker.ts`
 * so the main app bundle does not include @xenova/transformers until translation runs.
 *
 * Language ID: Xenova/facebook-fasttext-language-identification (ONNX).
 * Translation: Xenova/opus-mt-{src}-{tgt} with English pivot when no direct pair loads.
 */
/// <reference lib="webworker" />

import { env, pipeline } from '@xenova/transformers';
import type { WorkerRequest, WorkerResponse } from './translationWorkerTypes';

// Configure transformers.js environment for web worker
try {
  Object.assign(env, {
    allowRemoteModels: true,
    useBrowserCache: true,
  });
} catch {
  // If env is immutable, continue with defaults
}
/** Hub model for LID (Transformers.js–compatible ONNX). */
const LANGUAGE_DETECTION_MODEL = 'Xenova/facebook-fasttext-language-identification';

type TextClassificationOutput = { label: string; score: number };
type TranslationOutput = { translation_text: string };

const iso639_3_to_1: Record<string, string> = {
  eng: 'en',
  spa: 'es',
  fra: 'fr',
  deu: 'de',
  zho: 'zh',
  cmn: 'zh',
  jpn: 'ja',
  kor: 'ko',
  rus: 'ru',
  por: 'pt',
  ita: 'it',
  ara: 'ar',
  hin: 'hi',
  tur: 'tr',
  vie: 'vi',
  pol: 'pl',
  nld: 'nl',
  ind: 'id',
  tha: 'th',
  ukr: 'uk',
  heb: 'he',
  pes: 'fa',
  ben: 'bn',
  tam: 'ta',
  tel: 'te',
  mar: 'mr',
  guj: 'gu',
  kan: 'kn',
};

function normalizeLang(code: string): string {
  return code.trim().toLowerCase().slice(0, 2);
}

function labelToIso639_1(label: string): string {
  const raw = label.replace(/^__label__/i, '').toLowerCase();
  if (raw.length === 2) return raw;
  if (raw.length === 3 && iso639_3_to_1[raw]) return iso639_3_to_1[raw];
  if (iso639_3_to_1[raw.slice(0, 3)]) return iso639_3_to_1[raw.slice(0, 3)];
  return 'en';
}

let classifierPromise: Promise<unknown> | null = null;

async function getClassifier(): Promise<
  (text: string) => Promise<TextClassificationOutput | TextClassificationOutput[]>
> {
  if (!classifierPromise) {
    classifierPromise = pipeline('text-classification', LANGUAGE_DETECTION_MODEL);
  }
  return (await classifierPromise) as (
    text: string,
  ) => Promise<TextClassificationOutput | TextClassificationOutput[]>;
}

async function detectSourceLang(text: string): Promise<string> {
  const clf = await getClassifier();
  const out = await clf(text);
  const top = Array.isArray(out) ? out[0] : out;
  return labelToIso639_1(top.label);
}

type Translator = (text: string) => Promise<TranslationOutput | TranslationOutput[]>;

const translatorCache = new Map<string, Translator>();

async function loadTranslator(src: string, tgt: string): Promise<Translator | null> {
  const key = `${src}-${tgt}`;
  if (translatorCache.has(key)) return translatorCache.get(key)!;
  const modelId = `Xenova/opus-mt-${src}-${tgt}`;
  try {
    const p = (await pipeline('translation', modelId)) as Translator;
    translatorCache.set(key, p);
    return p;
  } catch {
    return null;
  }
}

function extractTranslation(result: TranslationOutput | TranslationOutput[]): string {
  const r = Array.isArray(result) ? result[0] : result;
  return r.translation_text ?? '';
}

async function translateDirect(text: string, src: string, tgt: string): Promise<string | null> {
  if (src === tgt) return text;
  const tr = await loadTranslator(src, tgt);
  if (!tr) return null;
  const out = await tr(text);
  return extractTranslation(out);
}

async function translatePivotEn(text: string, src: string, tgt: string): Promise<string | null> {
  if (src === tgt) return text;
  let mid = text;
  let s = src;
  if (s !== 'en') {
    const toEn = await loadTranslator(s, 'en');
    if (!toEn) return null;
    mid = extractTranslation(await toEn(text));
    s = 'en';
  }
  if (tgt === 'en') return mid;
  const toTgt = await loadTranslator('en', tgt);
  if (!toTgt) return null;
  return extractTranslation(await toTgt(mid));
}

async function translateText(text: string, targetLang: string): Promise<string> {
  const tgt = normalizeLang(targetLang);
  if (!text.trim()) return text;

  const src = await detectSourceLang(text);
  if (src === tgt) return text;

  let out = await translateDirect(text, src, tgt);
  if (out !== null) return out;

  out = await translatePivotEn(text, src, tgt);
  if (out !== null) return out;

  return text;
}

function post(resp: WorkerResponse): void {
  self.postMessage(resp);
}

export async function handleMessage(ev: MessageEvent<WorkerRequest>): Promise<void> {
  const msg = ev.data;
  if (msg.kind === 'ping') {
    post({ id: msg.id, kind: 'result', text: 'pong' });
    return;
  }
  if (msg.kind !== 'translate') return;

  try {
    const text = await translateText(msg.text, msg.targetLang);
    post({ id: msg.id, kind: 'result', text });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Translation failed';
    post({ id: msg.id, kind: 'error', message });
  }
}
