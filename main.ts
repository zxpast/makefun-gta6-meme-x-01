// gta6-meme-x-01 — Round 7 (Node 22, standard library only).
//
// A code-rendered meme: LEONIDA PUBLIC LIBRARY — OVERDUE NOTICE, a flat
// paper document (1024x1024 SVG) with the make.fun ghost as the library
// seal. The joke: GTA VI checked out 17 Sep 2013 is 4,811 days overdue;
// at $0.10 a day the fine is $481.10 — the fine buys GTA VI six times
// over — and my AI agent paid it on make.fun (+$500.00, $18.90 change).
//
// The program does two things:
//   1. Copies POST.json from the bot directory to the output directory
//      (validated first, read back after the copy). This is the step
//      Round 6's fresh rewrite dropped, which made R6 non-compliant:
//      the grader wrote only meme.svg, /output/POST.json was missing,
//      and the harness gate refused the entry. It must never be
//      dropped again.
//   2. Renders meme.svg and verifies its content before writing it:
//      every required line present, every banned line absent, and the
//      ghost outline-only (no filled magenta disc).
//
// Run it locally:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// Deterministic: no clock, no randomness — two runs write identical bytes.

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR: string = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR: string = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// --- Colours ----------------------------------------------------------------
const PAPER = '#FFF8E7';
const INK = '#191919';
const MAGENTA = '#E6007E';
const BOX_FILL = '#FFF1CE';

// --- Document text (all figures verified: see verifySvg + arithmetic) ------
// 17 Sep 2013 -> 19 Nov 2026 = 4,811 days; 4,811 x $0.10 = $481.10;
// 481.10 / 79.99 = 6.01x (6 x 79.99 = $479.94, $1.16 to spare);
// $500.00 - $481.10 = $18.90 change. Download 212 GB.
const TITLE = 'LEONIDA PUBLIC LIBRARY';
const HEADLINE = 'OVERDUE NOTICE';
const SUBLINE = 'VICE CITY BRANCH \u2022 EST. 2013';
const NOTICE = 'NOTICE NO. 4811 \u2022 19 NOV 2026';
const PATRON = 'PATRON: EVERYONE WHO WAITED 13 YEARS \u2022 CARD NO. 2013-0917-GTAVI';
const ITEM = 'ITEM: GRAND THEFT AUTO VI';
const DATES = 'CHECKED OUT 17 SEP 2013 \u2022 DUE BACK 01 OCT 2013';
const DAYS_OVERDUE = 'DAYS OVERDUE: 4,811';
const NEW_ITEM = 'NEW ITEM: GRAND THEFT AUTO VI \u2014 19 NOV 2026 \u2022 $79.99 \u2014 212 GB';

// Ledger: every row a lived beat. Label, amount.
const LEDGER: Array<[string, string]> = [
  ['LATE FEE \u2014 4,811 DAYS \u00D7 $0.10', '$481.10'],
  ['TIMES I SAID "NEXT YEAR" \u2014 13', '$0.00'],
  ['GTA V PLAYTHROUGHS FINISHED \u2014 4', '$0.00'],
  ['FIRST HEIST \u2014 PLANNED SINCE 2013', '$0.00'],
  ['BIRTHDAYS WISHED ON ONE GAME \u2014 13', '$0.00'],
  ['DAYS LEFT TO WAIT \u2014 0', '$0.00'],
];

const TOTAL_LABEL = 'TOTAL FINE DUE';
const TOTAL_AMOUNT = '$481.10';
const PUNCHLINE = 'THE FINE BUYS GTA VI SIX TIMES OVER.';
const PAY_LEFT_1 = 'AMOUNT PAID BY AGENT';
const PAY_LEFT_2 = 'CHANGE \u2014 SAVED FOR THE DLC';
const PAY_RIGHT_1 = '+$500.00';
const PAY_RIGHT_2 = '$18.90';
const STAMP_1 = 'PAID IN FULL';
const STAMP_2 = 'BY MY AI AGENT ON MAKE.FUN';

// --- Layout (1024x1024) ------------------------------------------------------
// Frame 24/36; ghost (96,110) r~46; title y95, headline y155, subline /
// notice y187, rule y212; patron+card y244; item y308, dates y338, rule
// y360; days overdue y402; new item y442; ledger y496..676 (pitch 36),
// rule y700; total y744; punchline y786; payment box 806..876 (lines
// y832, y862); stamp centre (800,928), 300x80, rotate -3deg; no footer;
// bottom-left band (x 64..640, y 876..1000) is empty paper.
// Stamp tilt note (measured from the R7 render): at -8deg the stamp's TRUE
// rotated bbox is y 867.5..988.5 — its top edge crosses into the payment
// box (which ends at y876) and its bottom-left corner touches the inner
// frame (y988). At -3deg the true bbox is y 880.2..975.8: 3.2px clear of
// the box border and 11.7px clear of the frame. Same centre, same size,
// same words — only the tilt changed, so the stamp is truly overlap-free.
const W = 1024;
const H = 1024;
const LEFT = 64;
const RIGHT = 960;
const LEDGER_Y0 = 496;
const LEDGER_PITCH = 36;
const MONO = 'Courier New, Courier, monospace';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function text(
  x: number,
  y: number,
  s: string,
  size: number,
  opts: { bold?: boolean; italic?: boolean; fill?: string; anchor?: string; spacing?: number } = {},
): string {
  const attrs: string[] = [
    `x="${x}"`,
    `y="${y}"`,
    `font-family="${MONO}"`,
    `font-size="${size}"`,
    `fill="${opts.fill ?? INK}"`,
  ];
  if (opts.bold) attrs.push('font-weight="bold"');
  if (opts.italic) attrs.push('font-style="italic"');
  if (opts.anchor) attrs.push(`text-anchor="${opts.anchor}"`);
  if (opts.spacing) attrs.push(`letter-spacing="${opts.spacing}"`);
  return `<text ${attrs.join(' ')}>${esc(s)}</text>`;
}

// Four-pointed sparkle star path centred at (cx, cy) with radius r.
function starPath(cx: number, cy: number, r: number): string {
  const q = (r * 0.25).toFixed(2);
  return (
    `M ${cx} ${cy - r} L ${cx + Number(q)} ${cy - Number(q)} ` +
    `L ${cx + r} ${cy} L ${cx + Number(q)} ${cy + Number(q)} ` +
    `L ${cx} ${cy + r} L ${cx - Number(q)} ${cy + Number(q)} ` +
    `L ${cx - r} ${cy} L ${cx - Number(q)} ${cy - Number(q)} Z`
  );
}

// The ghost as the library's seal: OUTLINE ONLY — white body, INK outline
// 3px, sparkle eyes, one small magenta star. NO filled magenta disc.
function ghostSeal(): string {
  const body =
    'M -44 34 L -44 -8 A 44 44 0 0 1 44 -8 L 44 34 ' +
    'Q 33 22 22 34 Q 11 22 0 34 Q -11 22 -22 34 Q -33 22 -44 34 Z';
  return (
    `<g id="ghost" transform="translate(96 110)">` +
    `<path d="${body}" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="${starPath(-15, -6, 9)}" fill="${INK}"/>` +
    `<path d="${starPath(15, -6, 9)}" fill="${INK}"/>` +
    `<path d="${starPath(24, 16, 8)}" fill="${MAGENTA}"/>` +
    `</g>`
  );
}

function ledgerRows(): string {
  const parts: string[] = [];
  LEDGER.forEach(([label, amount], i) => {
    const y = LEDGER_Y0 + i * LEDGER_PITCH;
    // Monospace 21px: ~12.6px per char. Dotted leader between label and amount.
    const labelW = label.length * 12.6;
    const amountW = amount.length * 12.6;
    const x1 = LEFT + labelW + 12;
    const x2 = RIGHT - amountW - 12;
    parts.push(text(LEFT, y, label, 21));
    parts.push(
      `<line x1="${x1.toFixed(1)}" y1="${y - 6}" x2="${x2.toFixed(1)}" y2="${y - 6}" ` +
        `stroke="${INK}" stroke-width="2" stroke-dasharray="1 8" stroke-linecap="round"/>`,
    );
    const first = i === 0;
    parts.push(
      text(RIGHT, y, amount, 21, { bold: true, fill: first ? MAGENTA : INK, anchor: 'end' }),
    );
  });
  return parts.join('\n    ');
}

function buildSvg(): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n` +
    `  <rect x="0" y="0" width="${W}" height="${H}" fill="${PAPER}"/>\n` +
    `  <rect x="24" y="24" width="976" height="976" fill="none" stroke="${INK}" stroke-width="3"/>\n` +
    `  <rect x="36" y="36" width="952" height="952" fill="none" stroke="${INK}" stroke-width="1"/>\n` +
    `  ${ghostSeal()}\n` +
    `  ${text(170, 95, TITLE, 40, { bold: true })}\n` +
    `  ${text(170, 155, HEADLINE, 58, { bold: true, fill: MAGENTA })}\n` +
    `  ${text(LEFT, 187, SUBLINE, 20)}\n` +
    `  ${text(RIGHT, 187, NOTICE, 20, { bold: true, anchor: 'end' })}\n` +
    `  <line x1="${LEFT}" y1="212" x2="${RIGHT}" y2="212" stroke="${INK}" stroke-width="2"/>\n` +
    `  ${text(LEFT, 244, PATRON, 22)}\n` +
    `  ${text(LEFT, 308, ITEM, 26, { bold: true })}\n` +
    `  ${text(LEFT, 338, DATES, 22)}\n` +
    `  <line x1="${LEFT}" y1="360" x2="${RIGHT}" y2="360" stroke="${INK}" stroke-width="2"/>\n` +
    `  ${text(LEFT, 402, DAYS_OVERDUE, 36, { bold: true, fill: MAGENTA })}\n` +
    `  ${text(LEFT, 442, NEW_ITEM, 22)}\n` +
    `    ${ledgerRows()}\n` +
    `  <line x1="${LEFT}" y1="700" x2="${RIGHT}" y2="700" stroke="${INK}" stroke-width="2"/>\n` +
    `  ${text(LEFT, 744, TOTAL_LABEL, 26, { bold: true })}\n` +
    `  ${text(RIGHT, 744, TOTAL_AMOUNT, 40, { bold: true, fill: MAGENTA, anchor: 'end' })}\n` +
    `  ${text(512, 786, PUNCHLINE, 24, { italic: true, anchor: 'middle' })}\n` +
    `  <rect x="${LEFT}" y="806" width="896" height="70" fill="${BOX_FILL}" stroke="${MAGENTA}" stroke-width="2"/>\n` +
    `  ${text(88, 832, PAY_LEFT_1, 22)}\n` +
    `  ${text(88, 862, PAY_LEFT_2, 22)}\n` +
    `  ${text(936, 832, PAY_RIGHT_1, 22, { bold: true, fill: MAGENTA, anchor: 'end' })}\n` +
    `  ${text(936, 862, PAY_RIGHT_2, 22, { bold: true, fill: MAGENTA, anchor: 'end' })}\n` +
    `  <g transform="translate(800 928) rotate(-3)">\n` +
    `    <rect x="-150" y="-40" width="300" height="80" fill="none" stroke="${MAGENTA}" stroke-width="3"/>\n` +
    `    <rect x="-141" y="-31" width="282" height="62" fill="none" stroke="${MAGENTA}" stroke-width="1.5"/>\n` +
    `    ${text(0, 3, STAMP_1, 28, { bold: true, fill: MAGENTA, anchor: 'middle' })}\n` +
    `    ${text(0, 27, STAMP_2, 14, { fill: MAGENTA, anchor: 'middle', spacing: 1 })}\n` +
    `  </g>\n` +
    `</svg>\n`
  );
}

// --- Content verification (fails the run on any miss) -------------------------
const REQUIRED_LINES: string[] = [
  TITLE, HEADLINE, SUBLINE, NOTICE, PATRON, ITEM, DATES, DAYS_OVERDUE, NEW_ITEM,
  'LATE FEE', '4,811 DAYS', '$0.10', '$481.10',
  'TIMES I SAID "NEXT YEAR"', 'GTA V PLAYTHROUGHS FINISHED',
  'FIRST HEIST', 'PLANNED SINCE 2013', 'BIRTHDAYS WISHED ON ONE GAME',
  'DAYS LEFT TO WAIT', TOTAL_LABEL, PUNCHLINE,
  PAY_LEFT_1, PAY_LEFT_2, PAY_RIGHT_1, PAY_RIGHT_2, STAMP_1, STAMP_2,
  '$79.99', '212 GB', '17 SEP 2013', '01 OCT 2013',
];

// Banned: rival lines (copy-ban file) + our deleted lines + Jason/Lucia in
// any form. Checked case-insensitively; "OVERDUE NOTICE" (singular,
// the document title) is allowed, "OVERDUE NOTICES" (plural) is not.
const BANNED_LINES: string[] = [
  'jason', 'lucia',
  'delays survived', 'overdue notices', 'console generations outlived',
  'months between trailers', 'launch dates that moved',
  '1 childhood', 'patience left', 'no refunds',
  'trailer 2', 'map of leonida', 'renewal denied', 'my teens',
  'the fine costs more than the game',
];

function verifySvg(svg: string): void {
  if (!svg.startsWith('<svg') || !svg.trimEnd().endsWith('</svg>')) {
    throw new Error('meme.svg is not a well-formed svg document');
  }
  for (const line of REQUIRED_LINES) {
    if (!svg.includes(line)) throw new Error(`required line missing from meme.svg: ${line}`);
  }
  const lower = svg.toLowerCase();
  for (const banned of BANNED_LINES) {
    if (lower.includes(banned)) throw new Error(`banned line present in meme.svg: ${banned}`);
  }
  // Ghost must be outline-only: no <circle> at all inside the ghost group
  // (no filled magenta disc; the magenta star is a path, not a circle).
  const ghostStart = svg.indexOf('<g id="ghost"');
  const ghostEnd = svg.indexOf('</g>', ghostStart);
  const ghost = svg.slice(ghostStart, ghostEnd);
  if (ghost.includes('<circle')) {
    throw new Error('ghost seal contains a <circle> (filled disc) — ghost must be outline-only');
  }
  if (!ghost.includes(`fill="${MAGENTA}"`)) {
    throw new Error('ghost seal lost its magenta star');
  }
}

// --- POST.json: validate, copy, read back ------------------------------------
const URL_RE = /^https?:\/\/(www\.)?(x\.com|twitter\.com)\/[^/]+\/status\/(\d+)$/;

function copyPostJson(): string {
  const src = join(BOT_DIR, 'POST.json');
  let raw: string;
  try {
    raw = readFileSync(src, 'utf8');
  } catch (err) {
    throw new Error(`POST.json could not be read from ${src}: ${(err as Error).message}`);
  }
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`POST.json does not parse as JSON: ${(err as Error).message}`);
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('POST.json is not a JSON object');
  }
  const url = (data as { url?: unknown }).url;
  if (typeof url !== 'string' || !URL_RE.test(url)) {
    throw new Error(`POST.json url is not an X post address (digits-only id): ${String(url)}`);
  }
  const dest = join(OUTPUT_DIR, 'POST.json');
  copyFileSync(src, dest);
  // Read the copy back and re-validate: the gate reads this file.
  const back = JSON.parse(readFileSync(dest, 'utf8')) as { url?: unknown };
  if (back.url !== url) {
    throw new Error('POST.json copy-back mismatch: copied url differs from source');
  }
  return url;
}

// --- main ---------------------------------------------------------------------
function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const url = copyPostJson();
  console.log(`POST.json copied to ${OUTPUT_DIR}/POST.json (${url})`);
  const svg = buildSvg();
  verifySvg(svg);
  writeFileSync(join(OUTPUT_DIR, 'meme.svg'), svg, 'utf8');
  console.log(`meme.svg written to ${OUTPUT_DIR}/meme.svg (${svg.length} bytes, verified)`);
}

main();
