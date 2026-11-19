// gta6-meme-x-01 R4 — "Leonida Public Library Overdue Notice"
// "THE FINE BUYS GTA VI SIX TIMES OVER."
//
// Node 22, standard library only. Copies POST.json from the repository
// root to /output/POST.json (the gate reads it there) and renders the
// meme as a deterministic meme.svg overdue-notice document.
//
// The document (all figures verified — see the arithmetic notes):
//   17 Sep 2013 checkout, due back 01 Oct 2013 (a 14-day loan).
//   4,811 days overdue (17 Sep 2013 -> 19 Nov 2026).
//   Fine 4,811 x $0.10/day = $481.10. Game $79.99.
//   Ratio 481.10 / 79.99 = 6.01x — the fine buys GTA VI six times over
//   (6 x $79.99 = $479.94; $1.16 to spare).
//   Bounty payout +$500.00 - $481.10 = $18.90 change, saved for the DLC.
//   Download 212 GB (Rockstar's published figure, not 214).
//   Trailer gap Dec 2023 -> May 2025 = 17 months.
//   Console generations outlived: PS4 (Nov 2013), PS5 (Nov 2020),
//   PS5 Pro (Nov 2024) = 3.
//
// Run the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// It prints nothing on success and writes out/POST.json + out/meme.svg.
// Two runs write byte-identical meme.svg (no clock, no randomness).

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// ---------------------------------------------------------------------------
// Document data (constants — every figure verified by hand + script)
// ---------------------------------------------------------------------------
const PAPER = '#f8f1dc'; // cream library-card paper
const INK = '#1a1a1a'; // near-black
const MAGENTA = '#c2185b'; // library stamp magenta
const MAGENTA_LIGHT = '#d6336c'; // ghost seal magenta
const BOX_FILL = '#fdf6e3'; // payment-box fill (lighter cream)
const LEADER = '#8a7d5a'; // dotted-leader dots

const TITLE = 'LEONIDA PUBLIC LIBRARY';
const HEADLINE = 'OVERDUE NOTICE';
const SUBLINE = 'VICE CITY BRANCH \u2022 EST. 2013';
const NOTICE_NO = 'NOTICE NO. 4811 \u2022 19 NOV 2026';
const PATRON = 'PATRON: EVERYONE WHO WAITED 13 YEARS';
const CARD_NO = 'CARD NO. 2013-0917-GTAVI';
const ITEM = 'ITEM: GRAND THEFT AUTO VI';
const DATES = 'CHECKED OUT 17 SEP 2013 \u2022 DUE BACK 01 OCT 2013';
const DAYS_OVERDUE = 'DAYS OVERDUE: 4,811';
const NEW_ITEM_1 = 'NEW ITEM: Grand Theft Auto VI \u2014 19 NOV 2026';
const NEW_ITEM_2 = 'PRICE: $79.99 \u2014 212 GB';
const TOTAL_LABEL = 'TOTAL FINE DUE';
const TOTAL_AMOUNT = '$481.10';
const PUNCHLINE = 'THE FINE BUYS GTA VI SIX TIMES OVER.';
const PAYOUT_LINE = "MY AI AGENT'S BOUNTY PAYOUT: +$500.00";
const CHANGE_LINE = 'CHANGE: $18.90 \u2014 SAVED FOR THE DLC.';
const STAMP_1 = 'PAID IN FULL';
const STAMP_2 = 'BY MY AI AGENT ON MAKE.FUN';
const FOOTER = 'NO REFUNDS. ONLY BOUNTIES.';

// Ledger rows: [label, amount]. Monospace 21px; char width = 0.6 * 21 = 12.6.
const LEDGER: Array<[string, string]> = [
  ['LATE FEE \u2014 4,811 DAYS \u00d7 $0.10', '$481.10'],
  ['CONSOLE GENERATIONS OUTLIVED \u2014 3', '$0.00'],
  ['OVERDUE NOTICES SENT \u2014 4,811', '$0.00'],
  ['OVERDUE NOTICES READ \u2014 0', '$0.00'],
  ['MONTHS BETWEEN TRAILERS \u2014 17', '$0.00'],
  ['DAYS LEFT TO WAIT \u2014 0', '$0.00'],
];

// ---------------------------------------------------------------------------
// Ghost seal — make.fun's ghost as the library's seal (small, top-left).
// White ghost on a magenta disc, sparkle eyes, magenta star coin.
// ---------------------------------------------------------------------------
function ghostSeal(cx: number, cy: number): string {
  // 4-point sparkle (eye), centred on (0,0), ~14px across.
  const spark =
    'M 0 -7 L 1.8 -1.8 L 7 0 L 1.8 1.8 L 0 7 L -1.8 1.8 L -7 0 L -1.8 -1.8 Z';
  // 5-point star (coin), centred on (0,0), outer r 7, inner r 2.8.
  const star =
    'M 0 -7 L 1.6 -2.3 L 6.7 -2.2 L 2.7 0.9 L 4.1 5.7 L 0 2.8 ' +
    'L -4.1 5.7 L -2.7 0.9 L -6.7 -2.2 L -1.6 -2.3 Z';
  // Ghost body: dome top, wavy bottom. 44 wide, 52 tall, centred on (0,0).
  const body =
    'M -22 26 L -22 -4 A 22 22 0 0 1 22 -4 L 22 26 ' +
    'Q 11 16 0 26 Q -11 16 -22 26 Z';
  return (
    '<g transform="translate(' + cx + ' ' + cy + ')">' +
    '<circle r="46" fill="' + MAGENTA_LIGHT + '" stroke="#8a0f3c" stroke-width="2"/>' +
    '<path d="' + body + '" fill="#ffffff"/>' +
    '<path d="' + spark + '" transform="translate(-9 -6)" fill="' + INK + '"/>' +
    '<path d="' + spark + '" transform="translate(9 -6)" fill="' + INK + '"/>' +
    '<path d="' + star + '" transform="translate(15 16)" fill="' + MAGENTA + '"/>' +
    '</g>'
  );
}

// ---------------------------------------------------------------------------
// Ledger row: label left, dotted leader, amount right-aligned.
// Monospace, so label width = chars * 12.6 exactly.
// ---------------------------------------------------------------------------
const LEDGER_X = 64;
const LEDGER_AMOUNT_X = 960;
const LEDGER_CHAR_W = 12.6;

function ledgerRow(y: number, label: string, amount: string): string {
  const labelW = label.length * LEDGER_CHAR_W;
  const amountW = amount.length * LEDGER_CHAR_W;
  const x1 = LEDGER_X + labelW + 12;
  const x2 = LEDGER_AMOUNT_X - amountW - 12;
  return (
    '<text x="' + LEDGER_X + '" y="' + y + '" font-family="monospace" font-size="21" fill="' + INK + '">' +
    label + '</text>' +
    '<line x1="' + x1.toFixed(1) + '" y1="' + (y - 6) + '" x2="' + x2.toFixed(1) + '" y2="' + (y - 6) + '" ' +
    'stroke="' + LEADER + '" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="0.1 8"/>' +
    '<text x="' + LEDGER_AMOUNT_X + '" y="' + y + '" font-family="monospace" font-size="21" text-anchor="end" fill="' + INK + '">' +
    amount + '</text>'
  );
}

// ---------------------------------------------------------------------------
// The document. 1024 x 1024 square; the judge sees it at 480 x 480.
// ---------------------------------------------------------------------------
function buildSvg(): string {
  const sans = 'Arial, Helvetica, sans-serif';
  const parts: string[] = [];
  parts.push('<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">');
  parts.push('<rect width="1024" height="1024" fill="' + PAPER + '"/>');
  // Double frame.
  parts.push('<rect x="24" y="24" width="976" height="976" fill="none" stroke="' + INK + '" stroke-width="3"/>');
  parts.push('<rect x="36" y="36" width="952" height="952" fill="none" stroke="' + INK + '" stroke-width="1.5"/>');

  // Header: ghost seal + title block.
  parts.push(ghostSeal(96, 110));
  parts.push('<text x="170" y="95" font-family="' + sans + '" font-size="40" font-weight="bold" fill="' + INK + '">' + TITLE + '</text>');
  parts.push('<text x="170" y="155" font-family="' + sans + '" font-size="58" font-weight="bold" fill="' + MAGENTA + '">' + HEADLINE + '</text>');
  parts.push('<text x="170" y="187" font-family="' + sans + '" font-size="20" fill="' + INK + '">' + SUBLINE + '</text>');
  parts.push('<text x="976" y="187" font-family="' + sans + '" font-size="18" font-weight="bold" text-anchor="end" fill="' + INK + '">' + NOTICE_NO + '</text>');
  parts.push('<line x1="48" y1="212" x2="976" y2="212" stroke="' + INK + '" stroke-width="2"/>');

  // Patron + card.
  parts.push('<text x="64" y="242" font-family="' + sans + '" font-size="22" font-weight="bold" fill="' + INK + '">' + PATRON + '</text>');
  parts.push('<text x="64" y="272" font-family="' + sans + '" font-size="22" fill="' + INK + '">' + CARD_NO + '</text>');

  // Item + dates.
  parts.push('<text x="64" y="312" font-family="' + sans + '" font-size="22" font-weight="bold" fill="' + INK + '">' + ITEM + '</text>');
  parts.push('<text x="64" y="342" font-family="' + sans + '" font-size="22" fill="' + INK + '">' + DATES + '</text>');
  parts.push('<line x1="48" y1="362" x2="976" y2="362" stroke="' + INK + '" stroke-width="2"/>');

  // Days overdue — own line, big, magenta.
  parts.push('<text x="64" y="406" font-family="' + sans + '" font-size="36" font-weight="bold" fill="' + MAGENTA + '">' + DAYS_OVERDUE + '</text>');

  // New item block.
  parts.push('<text x="64" y="446" font-family="' + sans + '" font-size="22" fill="' + INK + '">' + NEW_ITEM_1 + '</text>');
  parts.push('<text x="64" y="476" font-family="' + sans + '" font-size="22" fill="' + INK + '">' + NEW_ITEM_2 + '</text>');

  // Ledger (6 rows).
  const ledgerYs = [516, 550, 584, 618, 652, 686];
  for (let i = 0; i < LEDGER.length; i++) {
    parts.push(ledgerRow(ledgerYs[i], LEDGER[i][0], LEDGER[i][1]));
  }
  parts.push('<line x1="48" y1="712" x2="976" y2="712" stroke="' + INK + '" stroke-width="2"/>');

  // Total fine due — biggest number on the page.
  parts.push('<text x="64" y="756" font-family="' + sans + '" font-size="28" font-weight="bold" fill="' + INK + '">' + TOTAL_LABEL + '</text>');
  parts.push('<text x="960" y="756" font-family="' + sans + '" font-size="40" font-weight="bold" text-anchor="end" fill="' + MAGENTA + '">' + TOTAL_AMOUNT + '</text>');

  // Punchline (italic).
  parts.push('<text x="512" y="800" font-family="' + sans + '" font-size="24" font-style="italic" font-weight="bold" text-anchor="middle" fill="' + MAGENTA + '">' + PUNCHLINE + '</text>');

  // Payment box (full-width strip, figures only).
  parts.push('<rect x="64" y="822" width="896" height="88" fill="' + BOX_FILL + '" stroke="' + MAGENTA + '" stroke-width="2.5"/>');
  parts.push('<text x="84" y="856" font-family="' + sans + '" font-size="22" fill="' + INK + '">' + PAYOUT_LINE + '</text>');
  parts.push('<text x="84" y="886" font-family="' + sans + '" font-size="22" fill="' + INK + '">' + CHANGE_LINE + '</text>');

  // One big rotated stamp, bottom-right, overlapping the box corner.
  // Second line bumped 14 -> 15px (legibility at 480px) and the rect
  // 78 -> 80px tall so the line still clears the border.
  parts.push(
    '<g transform="translate(800 868) rotate(-8)">' +
    '<rect x="-150" y="-40" width="300" height="80" fill="none" stroke="' + MAGENTA + '" stroke-width="3"/>' +
    '<text x="0" y="2" font-family="' + sans + '" font-size="28" font-weight="bold" text-anchor="middle" fill="' + MAGENTA + '">' + STAMP_1 + '</text>' +
    '<text x="0" y="27" font-family="' + sans + '" font-size="15" text-anchor="middle" fill="' + MAGENTA + '">' + STAMP_2 + '</text>' +
    '</g>'
  );

  // Footer.
  parts.push('<text x="512" y="952" font-family="' + sans + '" font-size="24" font-weight="bold" text-anchor="middle" fill="' + INK + '">' + FOOTER + '</text>');

  parts.push('</svg>');
  return parts.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Self-check: fail the run if any required line is missing from the SVG.
// ---------------------------------------------------------------------------
const REQUIRED: string[] = [
  TITLE, HEADLINE, SUBLINE, NOTICE_NO,
  PATRON, CARD_NO, ITEM, DATES, DAYS_OVERDUE,
  NEW_ITEM_1, NEW_ITEM_2,
  LEDGER[0][0], LEDGER[0][1],
  LEDGER[1][0], LEDGER[2][0], LEDGER[3][0], LEDGER[4][0], LEDGER[5][0],
  TOTAL_LABEL, TOTAL_AMOUNT, PUNCHLINE,
  PAYOUT_LINE, CHANGE_LINE, STAMP_1, STAMP_2, FOOTER,
];

function verifySvg(svg: string): void {
  for (const line of REQUIRED) {
    if (!svg.includes(line)) {
      console.error('verifySvg: missing line in meme.svg: ' + line);
      process.exit(1);
    }
  }
  if (!svg.startsWith('<svg ') || !svg.trimEnd().endsWith('</svg>')) {
    console.error('verifySvg: meme.svg is not a well-formed svg document');
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Run: copy POST.json, render + verify meme.svg. Silent on success.
// ---------------------------------------------------------------------------
mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(join(BOT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

const svg = buildSvg();
verifySvg(svg);
writeFileSync(join(OUTPUT_DIR, 'meme.svg'), svg, 'utf8');
