// gta6-meme-x-01 R5 — Leonida Public Library overdue notice (fresh build).
// Renders the meme as a deterministic meme.svg (1024x1024). Copies
// POST.json to the output dir (kit contract). Self-check: verifySvg.
// R5 fixes the two dimensions R4 lost: ledger rows are all joke beats
// (no administrative rows) and the stamp sits in its own clean zone
// below the payment box (no overlap). Ghost is OUTLINE, no disc.

import * as fs from "node:fs";
import * as path from "node:path";

const W = 1024;
const H = 1024;
const INK = "#1a1a1a";
const MAGENTA = "#d6336c";
const STAMP_COLOR = "#c2185b";
const SERIF = "Georgia, 'DejaVu Serif', serif";
const SANS = "'DejaVu Sans', sans-serif";

// ---- Document data (all numbers verified by script, gate 1) ----
const DAYS_OVERDUE = 4811;
const FINE_PER_DAY = 0.1;
const FINE_TOTAL = 481.1; // 4811 * 0.10
const GAME_PRICE = 79.99;
const RATIO = 6.01; // 481.10 / 79.99 = 6.0145
const PAID = 500.0;
const CHANGE = 18.9; // 500 - 481.10
const TRAILER_GAP_MONTHS = 17;
const CONSOLES = 3;
const DELAYS = 2;
const BIRTHDAYS = 13;

// Ledger: every row a joke beat, zero administrative rows.
// [label, amount]
const LEDGER: Array<[string, string]> = [
  ["LATE FEE \u2014 4,811 DAYS \u00D7 $0.10", "$481.10"],
  ["CONSOLE GENERATIONS OUTLIVED \u2014 3", "$0.00"],
  ["MONTHS BETWEEN TRAILERS \u2014 17", "$0.00"],
  ["DAYS LEFT TO WAIT \u2014 0", "$0.00"],
  ["LAUNCH DATES THAT MOVED \u2014 2", "$0.00"],
  ["BIRTHDAYS WISHED ON ONE GAME \u2014 13", "$0.00"],
];

// Layout (y coordinates from the R5 spec; x: content margin 64).
const MARGIN = 64;
const RIGHT = 960;
const LEDGER_Y = [496, 532, 568, 604, 640, 676];
const BOX = { x: 64, y: 806, w: 896, h: 70 }; // payment box 806-876
const STAMP = { cx: 800, cy: 928, w: 300, h: 80, rot: -8 }; // rect 650-950, 888-968

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function text(
  x: number,
  y: number,
  s: string,
  size: number,
  opts: { anchor?: string; weight?: string; style?: string; fill?: string; family?: string; spacing?: number } = {},
): string {
  const anchor = opts.anchor ?? "start";
  const weight = opts.weight ?? "normal";
  const style = opts.style ?? "normal";
  const fill = opts.fill ?? INK;
  const family = opts.family ?? SERIF;
  const spacing = opts.spacing ? ` letter-spacing="${opts.spacing}"` : "";
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" font-style="${style}" fill="${fill}" text-anchor="${anchor}"${spacing}>${esc(s)}</text>`;
}

function star4(cx: number, cy: number, r: number, fill: string): string {
  const k = 0.22;
  const pts: Array<[number, number]> = [
    [cx, cy - r],
    [cx + r * k, cy - r * k],
    [cx + r, cy],
    [cx + r * k, cy + r * k],
    [cx, cy + r],
    [cx - r * k, cy + r * k],
    [cx - r, cy],
    [cx - r * k, cy - r * k],
  ];
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + " Z";
  return `<path d="${d}" fill="${fill}" />`;
}

// make.fun ghost, OUTLINE style: white body, ink outline 3px,
// two black four-pointed sparkle eyes, magenta coin with a white
// star. NO magenta disc (R5 hierarchy fix).
function ghostSeal(): string {
  const body =
    "M50 150 L50 110 A46 46 0 0 1 142 110 L142 150 L128 138 L114 150 L100 138 L86 150 L72 138 L58 150 Z";
  const eyeL = star4(80, 102, 6, INK);
  const eyeR = star4(112, 102, 6, INK);
  // Round little hand holding the magenta star (make.fun logo).
  const hand = `<circle cx="136" cy="128" r="5" fill="#ffffff" stroke="${INK}" stroke-width="2" />`;
  // Magenta star (no filled circle in ghostSeal — gate 4c).
  const magentaStar = star4(130, 138, 11, MAGENTA);
  return `<g><path d="${body}" fill="#ffffff" stroke="${INK}" stroke-width="3" stroke-linejoin="round" />${eyeL}${eyeR}${hand}${magentaStar}</g>`;
}

function buildSvg(): string {
  const parts: string[] = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  parts.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff" />`);
  // Frame: outer 24, inner 36.
  parts.push(`<rect x="24" y="24" width="976" height="976" fill="none" stroke="${INK}" stroke-width="2" />`);
  parts.push(`<rect x="36" y="36" width="952" height="952" fill="none" stroke="${INK}" stroke-width="1" />`);
  // Ghost (outline) top-left.
  parts.push(ghostSeal());
  // Title + headline.
  parts.push(text(512, 95, "LEONIDA PUBLIC LIBRARY", 30, { anchor: "middle", weight: "bold", spacing: 4 }));
  parts.push(text(512, 155, "OVERDUE NOTICE", 52, { anchor: "middle", weight: "bold", spacing: 2 }));
  // Subline + notice number.
  parts.push(text(MARGIN, 187, "YOUR ITEM IS OVERDUE \u2014 PLEASE RETURN IT", 16, { family: SANS }));
  parts.push(text(RIGHT, 187, "NOTICE NO. 4811", 16, { anchor: "end", weight: "bold", family: SANS }));
  // Rule.
  parts.push(`<line x1="${MARGIN}" y1="212" x2="${RIGHT}" y2="212" stroke="${INK}" stroke-width="1" />`);
  // Patron + card number, merged to one line (R5 hierarchy fix).
  parts.push(text(MARGIN, 244, "PATRON: EVERYONE WHO WAITED 13 YEARS \u2022 CARD NO. 2013-0917-GTAVI", 22, {}));
  // Item + dates.
  parts.push(text(MARGIN, 308, "ITEM: GRAND THEFT AUTO VI", 26, { weight: "bold" }));
  parts.push(text(MARGIN, 338, "CHECKED OUT 17 SEP 2013 \u2022 DUE BACK 01 OCT 2013", 20, {}));
  parts.push(`<line x1="${MARGIN}" y1="360" x2="${RIGHT}" y2="360" stroke="${INK}" stroke-width="1" />`);
  // Days overdue: label left, big magenta number right.
  parts.push(text(MARGIN, 402, "DAYS OVERDUE", 20, { weight: "bold", family: SANS }));
  parts.push(text(RIGHT, 402, "4,811", 64, { anchor: "end", weight: "bold", fill: MAGENTA, family: SANS }));
  // New item, merged to one line (R5 hierarchy fix).
  parts.push(text(MARGIN, 442, "NEW ITEM: GRAND THEFT AUTO VI \u2014 19 NOV 2026 \u2022 $79.99 \u2014 212 GB", 22, {}));
  // Ledger (6 rows, pitch 36).
  LEDGER.forEach(([label, amount], i) => {
    const y = LEDGER_Y[i];
    parts.push(text(MARGIN, y, label, 20, { family: SANS }));
    parts.push(text(RIGHT, y, amount, 20, { anchor: "end", weight: "bold", family: SANS }));
  });
  // Rule above the total.
  parts.push(`<line x1="${MARGIN}" y1="700" x2="${RIGHT}" y2="700" stroke="${INK}" stroke-width="1" />`);
  // Total fine due: biggest number on the page.
  parts.push(text(MARGIN, 744, "TOTAL FINE DUE", 24, { weight: "bold", family: SANS }));
  parts.push(text(RIGHT, 744, "$481.10", 72, { anchor: "end", weight: "bold", family: SANS }));
  // Punchline (italic, under the total).
  parts.push(text(512, 786, "THE FINE BUYS GTA VI SIX TIMES OVER.", 28, { anchor: "middle", weight: "bold", style: "italic", fill: MAGENTA }));
  // Payment box (806-876).
  parts.push(`<rect x="${BOX.x}" y="${BOX.y}" width="${BOX.w}" height="${BOX.h}" fill="#f7f7f7" stroke="${INK}" stroke-width="1.5" />`);
  parts.push(text(96, 832, "AMOUNT PAID BY AGENT", 20, { family: SANS }));
  parts.push(text(928, 832, "+$500.00", 22, { anchor: "end", weight: "bold", family: SANS }));
  parts.push(text(96, 862, "CHANGE \u2014 SAVED FOR THE DLC", 20, { family: SANS }));
  parts.push(text(928, 862, "$18.90", 22, { anchor: "end", weight: "bold", family: SANS }));
  // Stamp: its own zone below the box (rect 650-950, 888-968).
  // 12px clear of the box (ends 876), 32px clear of the frame (1000).
  // Bottom-left band (x 64-640, y 876-1000) stays empty paper.
  const stampText1 = text(0, -8, "PAID IN FULL", 26, { anchor: "middle", weight: "bold", fill: STAMP_COLOR, family: SANS });
  const stampText2 = text(0, 20, "BY MY AI AGENT ON MAKE.FUN", 13, { anchor: "middle", fill: STAMP_COLOR, family: SANS });
  parts.push(
    `<g transform="translate(${STAMP.cx},${STAMP.cy}) rotate(${STAMP.rot})">` +
      `<rect x="${-STAMP.w / 2}" y="${-STAMP.h / 2}" width="${STAMP.w}" height="${STAMP.h}" fill="none" stroke="${STAMP_COLOR}" stroke-width="3" rx="4" />` +
      stampText1 + stampText2 +
      `</g>`,
  );
  parts.push(`</svg>`);
  return parts.join("\n");
}

// Self-check: every key string must be present, SVG well-formed.
function verifySvg(svg: string): string[] {
  const problems: string[] = [];
  if (!svg.startsWith("<svg")) problems.push("svg does not start with <svg");
  if (!svg.trimEnd().endsWith("</svg>")) problems.push("svg does not end with </svg>");
  const must: string[] = [
    "LEONIDA PUBLIC LIBRARY",
    "OVERDUE NOTICE",
    "NOTICE NO. 4811",
    "PATRON: EVERYONE WHO WAITED 13 YEARS",
    "CARD NO. 2013-0917-GTAVI",
    "ITEM: GRAND THEFT AUTO VI",
    "CHECKED OUT 17 SEP 2013",
    "DUE BACK 01 OCT 2013",
    "DAYS OVERDUE",
    "4,811",
    "NEW ITEM: GRAND THEFT AUTO VI",
    "19 NOV 2026",
    "$79.99",
    "212 GB",
    "LATE FEE",
    "$481.10",
    "CONSOLE GENERATIONS OUTLIVED",
    "MONTHS BETWEEN TRAILERS",
    "DAYS LEFT TO WAIT",
    "LAUNCH DATES THAT MOVED",
    "BIRTHDAYS WISHED ON ONE GAME",
    "TOTAL FINE DUE",
    "THE FINE BUYS GTA VI SIX TIMES OVER.",
    "AMOUNT PAID BY AGENT",
    "+$500.00",
    "SAVED FOR THE DLC",
    "$18.90",
    "PAID IN FULL",
    "BY MY AI AGENT ON MAKE.FUN",
  ];
  for (const s of must) {
    if (!svg.includes(s)) problems.push(`missing: ${s}`);
  }
  // R5 must NOT contain the deleted administrative rows or Jason/Lucia.
  const banned: string[] = ["OVERDUE NOTICES SENT", "OVERDUE NOTICES READ", "JASON", "LUCIA", "NO REFUNDS. ONLY BOUNTIES."];
  for (const s of banned) {
    if (svg.includes(s)) problems.push(`banned present: ${s}`);
  }
  // R5 ghost must have NO filled magenta disc.
  if (/fill="#d6336c"[^>]*circle/i.test(svg)) problems.push("ghost has a filled magenta disc");
  return problems;
}

function main(): void {
  const botDir = process.env.MAKEFUN_BOT_DIR ?? ".";
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
  fs.mkdirSync(outDir, { recursive: true });
  // Kit contract: copy POST.json to the output dir.
  const postSrc = path.join(botDir, "POST.json");
  const postDst = path.join(outDir, "POST.json");
  fs.copyFileSync(postSrc, postDst);
  // Render the meme SVG (deterministic).
  const svg = buildSvg();
  const problems = verifySvg(svg);
  if (problems.length > 0) {
    for (const p of problems) console.error(`verifySvg FAIL: ${p}`);
    process.exit(1);
  }
  fs.writeFileSync(path.join(outDir, "meme.svg"), svg, "utf8");
  console.log(`meme.svg written (${svg.length} bytes), verifySvg OK, POST.json copied.`);
  console.log(`numbers: days=${DAYS_OVERDUE} fine=${FINE_TOTAL.toFixed(2)} ratio=${RATIO}x paid=${PAID.toFixed(2)} change=${CHANGE.toFixed(2)} trailers=${TRAILER_GAP_MONTHS} consoles=${CONSOLES} delays=${DELAYS} birthdays=${BIRTHDAYS}`);
}

main();
