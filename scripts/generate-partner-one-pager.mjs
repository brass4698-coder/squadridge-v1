#!/usr/bin/env node
/**
 * Generate a printable, branded one-pager from
 * `docs/business/pilot-partner-one-pager.md`. Output is a self-contained HTML
 * document that any browser will render and "Save as PDF" cleanly via
 * Ctrl/Cmd+P. Deliberately ships as static HTML so we do not pull a headless
 * browser dependency into CI; partners get a deterministic artifact, and the
 * source markdown stays the single source of truth.
 *
 * Output path: `dist/partner-one-pager.html` (created if `dist/` already exists,
 * skipped silently otherwise — this script piggybacks on the existing Vite
 * build pipeline rather than introducing a new artifact directory).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = join(root, 'docs/business/pilot-partner-one-pager.md');
const outDir = join(root, 'dist');
const outPath = join(outDir, 'partner-one-pager.html');

if (!existsSync(sourcePath)) {
  console.error(`partner-one-pager: source missing at ${sourcePath}`);
  process.exit(1);
}

const md = readFileSync(sourcePath, 'utf8');

/**
 * Tiny markdown renderer scoped to the subset used in
 * `pilot-partner-one-pager.md` (h1/h2, paragraphs, bullet lists, inline links,
 * inline emphasis, inline `code`). We intentionally avoid pulling in a markdown
 * dependency for CI hygiene.
 */
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInline(text) {
  let out = escapeHtml(text);
  // links: [label](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
    const safeHref = String(href).replace(/"/g, '&quot;');
    return `<a href="${safeHref}">${label}</a>`;
  });
  // bold **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic *text*
  out = out.replace(/(^|\W)\*([^*]+)\*/g, '$1<em>$2</em>');
  // inline code `text`
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  return out;
}

function renderMarkdown(source) {
  const lines = source.split(/\r?\n/);
  const html = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('# ')) {
      html.push(`<h1>${renderInline(line.slice(2).trim())}</h1>`);
      i += 1;
      continue;
    }
    if (line.startsWith('## ')) {
      html.push(`<h2>${renderInline(line.slice(3).trim())}</h2>`);
      i += 1;
      continue;
    }
    if (line.startsWith('### ')) {
      html.push(`<h3>${renderInline(line.slice(4).trim())}</h3>`);
      i += 1;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^[-*]\s+/, ''))}</li>`);
        i += 1;
      }
      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }
    if (line.trim() === '') {
      i += 1;
      continue;
    }
    // Collect a paragraph
    const para = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('#') && !/^[-*]\s+/.test(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    html.push(`<p>${renderInline(para.join(' '))}</p>`);
  }
  return html.join('\n');
}

const stamp = new Date().toISOString().slice(0, 10);

const body = renderMarkdown(md);

const document = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>SquadRidge — Pilot Partner One-Pager</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root {
    color-scheme: light;
    --ink: #0f172a;
    --ink-muted: #475569;
    --line: #cbd5e1;
    --brand: #0e9aa7;
    --bg: #ffffff;
  }
  @media print {
    @page { size: Letter; margin: 0.75in; }
    body { background: white !important; }
  }
  * { box-sizing: border-box; }
  html, body { background: var(--bg); color: var(--ink); }
  body {
    font-family: 'DM Sans', 'Inter', system-ui, sans-serif;
    line-height: 1.55;
    margin: 0;
    padding: 48px 56px 32px;
    max-width: 900px;
    margin-inline: auto;
  }
  header.brand {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 1px solid var(--line);
    padding-bottom: 14px;
    margin-bottom: 24px;
  }
  .wordmark {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1.25rem;
    letter-spacing: -0.01em;
  }
  .meta {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--ink-muted);
  }
  h1 {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: clamp(1.5rem, 2.6vw, 1.9rem);
    margin: 0 0 4px;
  }
  h2 {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 1.05rem;
    margin: 22px 0 8px;
    color: var(--brand);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  h3 {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 0.95rem;
    margin: 16px 0 6px;
  }
  p, li { font-size: 0.92rem; color: var(--ink); }
  ul { padding-left: 1.2rem; margin: 6px 0 12px; }
  li { margin-bottom: 4px; }
  a { color: var(--brand); }
  code {
    background: rgba(14, 154, 167, 0.08);
    padding: 0 4px;
    border-radius: 3px;
    font-size: 0.86em;
  }
  footer {
    margin-top: 28px;
    padding-top: 12px;
    border-top: 1px solid var(--line);
    font-size: 0.78rem;
    color: var(--ink-muted);
  }
</style>
</head>
<body>
  <header class="brand">
    <span class="wordmark">SquadRidge</span>
    <span class="meta">Partner one-pager · generated ${stamp}</span>
  </header>
  ${body}
  <footer>
    Source: <code>docs/business/pilot-partner-one-pager.md</code>. The current operational state is summarized in <code>CURRENT_STATUS.md</code> and the security boundaries in <code>docs/security/threat-model.md</code>. Please cite those documents for diligence rather than the auto-generated one-pager alone.
  </footer>
</body>
</html>
`;

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

writeFileSync(outPath, document, 'utf8');
console.log(`partner-one-pager: wrote ${outPath} (${document.length} bytes)`);
