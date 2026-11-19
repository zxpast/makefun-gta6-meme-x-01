// gta6-meme-x-01 — Leonida Public Library OVERDUE NOTICE (Round 3).
//
// The entry is the X post itself: the house reads the post from X and the
// judge sees its first picture, then its text. This program is the entry's
// reproducible half. It does two deterministic things, with no network, no
// wall clock and no files outside the repository:
//
//   1. It copies POST.json (the post's address) to the output directory,
//      where the gate reads it.
//   2. It renders the same overdue notice the post pictures as meme.svg —
//      the document, drawn from code so every line is spelled right and
//      legible when the picture is shrunk to 480 by 480.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// It prints nothing on success. Run it twice and the bytes are identical.

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The document, as the post pictures it. Every number is the joke's
// evidence: 17 Sep 2013 is 4,811 days before 19 Nov 2026.
const FIELDS: Array<{ label: string; lines: string[]; hot?: boolean }> = [
  { label: 'ITEM', lines: ['Grand Theft Auto V'] },
  { label: 'BORROWED', lines: ['17 SEP 2013'] },
  { label: 'DUE BACK', lines: ['17 SEP 2013'] },
  { label: 'DAYS OVERDUE', lines: ['4,811'] },
  { label: 'LATE FEE', lines: ['$0.00/day × 4,811 days = $0.00'] },
  { label: 'REPLACEMENT COST', lines: ['1 CHILDHOOD — 1 HOPE (SPENT)', '0 PATIENCE LEFT'] },
  { label: 'NEW ITEM AVAILABLE', lines: ['Grand Theft Auto VI — 19 NOV 2026', '$79.99 — 214 GB'] },
  { label: 'TOTAL DUE', lines: ['$0.00 — PAID IN FULL'], hot: true },
];

const PAPER = '#f6efdc';
const INK = '#1a1a1a';
const MAGENTA = '#e6007e';
const BOX = '#fdf6e3';
const MUTED = '#6b6252';
const FONT = 'monospace';

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ghostSeal(cx: number, cy: number, r: number): string {
  // make.fun's ghost, as the library's seal: a white ghost in a magenta
  // disc, sparkle eyes, and a magenta star coin at its shoulder.
  const star = 'M0,-14 L5,-5 L14,0 L5,5 L0,14 L-5,5 L-14,0 L-5,-5 Z';
  return [
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${MAGENTA}"/>`,
    `<g transform="translate(${cx} ${cy})" fill="#ffffff">`,
    `<path d="M -36 34 V -2 A 36 36 0 0 1 36 -2 V 34 L 24 22 L 12 34 L 0 22 L -12 34 L -24 22 Z"/>`,
    `</g>`,
    `<g fill="${INK}">`,
    `<ellipse cx="${cx - 13}" cy="${cy - 4}" rx="6" ry="9"/>`,
    `<ellipse cx="${cx + 13}" cy="${cy - 4}" rx="6" ry="9"/>`,
    `</g>`,
    `<g fill="#ffffff">`,
    `<circle cx="${cx - 11}" cy="${cy - 7}" r="2"/>`,
    `<circle cx="${cx + 15}" cy="${cy - 7}" r="2"/>`,
    `</g>`,
    `<g transform="translate(${cx + 52} ${cy - 54})" fill="${MAGENTA}"><path d="${star}"/></g>`,
  ].join('\n');
}

function noticeSvg(): string {
  const W = 1024;
  const H = 1024;
  const out: string[] = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  out.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="${PAPER}"/>`);
  out.push(`<rect x="24" y="24" width="976" height="976" fill="none" stroke="${INK}" stroke-width="3"/>`);
  out.push(`<rect x="36" y="36" width="952" height="952" fill="none" stroke="${INK}" stroke-width="1"/>`);
  out.push(`<rect x="24" y="24" width="976" height="14" fill="${MAGENTA}"/>`);
  out.push(ghostSeal(128, 138, 72));
  out.push(`<text x="228" y="118" font-family="${FONT}" font-size="42" font-weight="bold" fill="${INK}" letter-spacing="2">LEONIDA PUBLIC LIBRARY</text>`);
  out.push(`<text x="228" y="172" font-family="${FONT}" font-size="52" font-weight="bold" fill="${MAGENTA}" letter-spacing="3">OVERDUE NOTICE</text>`);
  out.push(`<text x="228" y="206" font-family="${FONT}" font-size="21" fill="${MUTED}">EST. 2013 — LEONIDA, FLORIDA</text>`);
  out.push(`<line x1="60" y1="238" x2="964" y2="238" stroke="${INK}" stroke-width="2"/>`);
  out.push(`<line x1="60" y1="246" x2="964" y2="246" stroke="${INK}" stroke-width="1"/>`);
  let y = 288;
  for (const field of FIELDS) {
    const valueFill = field.hot === true ? MAGENTA : INK;
    const valueWeight = field.hot === true ? 'bold' : 'normal';
    if (field.lines.length === 1) {
      out.push(`<text x="60" y="${y}" font-family="${FONT}" font-size="25" font-weight="bold" fill="${INK}">${esc(field.label)}: <tspan fill="${valueFill}" font-weight="${valueWeight}">${esc(field.lines[0])}</tspan></text>`);
      y += 50;
    } else {
      out.push(`<text x="60" y="${y}" font-family="${FONT}" font-size="25" font-weight="bold" fill="${INK}">${esc(field.label)}:</text>`);
      y += 38;
      for (const line of field.lines) {
        out.push(`<text x="60" y="${y}" font-family="${FONT}" font-size="25" fill="${valueFill}" font-weight="${valueWeight}">${esc(line)}</text>`);
        y += 38;
      }
      y += 10;
    }
  }
  out.push(`<g transform="rotate(-8 760 782)">`);
  out.push(`<rect x="620" y="750" width="280" height="64" fill="none" stroke="${MAGENTA}" stroke-width="3"/>`);
  out.push(`<text x="760" y="792" text-anchor="middle" font-family="${FONT}" font-size="22" font-weight="bold" fill="${MAGENTA}">PAID IN FULL</text>`);
  out.push(`</g>`);
  out.push(`<rect x="60" y="852" width="904" height="88" fill="${BOX}" stroke="${MAGENTA}" stroke-width="2"/>`);
  out.push(`<text x="76" y="886" font-family="${FONT}" font-size="23" fill="${INK}">PAID BY MY AI AGENT ON make.fun — bounty payout +$250.00.</text>`);
  out.push(`<text x="76" y="918" font-family="${FONT}" font-size="23" fill="${INK}">Your agent reads the fine print. You play.</text>`);
  out.push(`<text x="512" y="972" text-anchor="middle" font-family="${FONT}" font-size="24" font-weight="bold" fill="${INK}">NO REFUNDS. ONLY BOUNTIES.</text>`);
  out.push(`</svg>`);
  return out.join('\n') + '\n';
}

// The program checks its own work: the rendered notice must carry every
// field label, the key numbers and the make.fun name. A silent drop of a
// line would leave the post's picture without its joke, so a miss fails
// the run instead of shipping a broken document.
function verifySvg(svg: string): void {
  const required = FIELDS.map((field) => field.label).concat([
    '4,811',
    'Grand Theft Auto V',
    'Grand Theft Auto VI',
    'make.fun',
    'PAID IN FULL',
    'NO REFUNDS. ONLY BOUNTIES.',
  ]);
  for (const text of required) {
    if (!svg.includes(text)) {
      throw new Error(`meme.svg is missing required text: ${text}`);
    }
  }
}

function readPostUrl(botDir: string): string {
  const raw = readFileSync(join(botDir, 'POST.json'), 'utf8');
  const data = JSON.parse(raw) as { url?: unknown };
  if (typeof data.url !== 'string') {
    throw new Error('POST.json has no url string');
  }
  if (!/^https:\/\/(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/[0-9]+$/.test(data.url)) {
    throw new Error(`POST.json url is not an X post address: ${data.url}`);
  }
  return data.url;
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  readPostUrl(BOT_DIR);
  copyFileSync(join(BOT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
  const svg = noticeSvg();
  verifySvg(svg);
  writeFileSync(join(OUTPUT_DIR, 'meme.svg'), svg, 'utf8');
}

try {
  main();
} catch (err) {
  console.error(`main.ts failed: ${(err as Error).message}`);
  process.exit(1);
}
