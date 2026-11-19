import * as fs from "node:fs";
import * as path from "node:path";

// gta6-meme-x-01 R6 — Leonida Public Library overdue notice.
// Layout UNCHANGED from R5 (hierarchy already won): outline ghost,
// stamp in its own zone below the payment box, no footer.
// Only the ledger rows change (R6 fixes line items): the three
// statistical R5 rows are replaced by three lived beats.
const OUT = process.env.MAKEFUN_OUTPUT_DIR || "out";

const INK = "#111111";
const PINK = "#d6336c";
const PAPER = "#ffffff";

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "'Courier New', Courier, monospace";
const SANS = "Arial, Helvetica, sans-serif";

// Ledger rows: [label, amount]. R6 keeps LATE FEE, BIRTHDAYS, DAYS
// LEFT; the three new rows are time -> dedication -> anticipation.
const LEDGER: Array<[string, string]> = [
  ["LATE FEE — 4,811 DAYS × $0.10", "$481.10"],
  ['TIMES I SAID "NEXT YEAR" — 13', "$0.00"],
  ["GTA V PLAYTHROUGHS FINISHED — 4", "$0.00"],
  ["FIRST HEIST — PLANNED SINCE 2013", "$0.00"],
  ["BIRTHDAYS WISHED ON ONE GAME — 13", "$0.00"],
  ["DAYS LEFT TO WAIT — 0", "$0.00"],
];
const LEDGER_Y = [496, 532, 568, 604, 640, 676];

function ghostSeal(): string {
  // Outline ghost, no filled disc: white body, INK outline 3px,
  // sparkle eyes, magenta 4-point star. Footprint r~46 at (96,110).
  return [
    '<g id="ghostSeal">',
    '<path d="M50,158 L50,108 A46,46 0 0,1 142,108 L142,158 L130,146 L118,158 L106,146 L94,158 L82,146 L70,158 L58,146 Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>',
    '<g stroke="' + INK + '" stroke-width="2" stroke-linecap="round">',
    '<line x1="74" y1="102" x2="86" y2="102"/>',
    '<line x1="80" y1="96" x2="80" y2="108"/>',
    '<line x1="106" y1="102" x2="118" y2="102"/>',
    '<line x1="112" y1="96" x2="112" y2="108"/>',
    "</g>",
    '<path d="M136,128 L139,135 L146,138 L139,141 L136,148 L133,141 L126,138 L133,135 Z" fill="' + PINK + '"/>',
    "</g>",
  ].join("\n");
}

function stamp(): string {
  // Stamp in its own zone below the payment box: centre (800,928),
  // 300x80, rotate -8deg. Occupies ~888-968: 12px clear of the box
  // (bottom 876), 32px clear of the frame bottom (1000).
  return [
    '<g id="stamp" transform="translate(800 928) rotate(-8)">',
    '<rect x="-150" y="-40" width="300" height="80" fill="none" stroke="' + PINK + '" stroke-width="3"/>',
    '<text x="0" y="-2" text-anchor="middle" font-family="' + SANS + '" font-size="28" font-weight="bold" fill="' + PINK + '">PAID IN FULL</text>',
    '<text x="0" y="22" text-anchor="middle" font-family="' + SANS + '" font-size="14" fill="' + PINK + '">BY MY AI AGENT ON MAKE.FUN</text>',
    "</g>",
  ].join("\n");
}

function buildSvg(): string {
  const ledger = LEDGER.map(([label, amount], i) => {
    const y = LEDGER_Y[i];
    return (
      '<text x="64" y="' + y + '" font-family="' + MONO + '" font-size="21" fill="' + INK + '">' + esc(label) + "</text>" +
      '<text x="960" y="' + y + '" text-anchor="end" font-family="' + MONO + '" font-size="21" fill="' + INK + '">' + esc(amount) + "</text>"
    );
  }).join("\n");

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">',
    '<rect x="0" y="0" width="1024" height="1024" fill="' + PAPER + '"/>',
    '<rect x="24" y="24" width="976" height="976" fill="none" stroke="' + INK + '" stroke-width="2"/>',
    '<rect x="36" y="36" width="952" height="952" fill="none" stroke="' + INK + '" stroke-width="1"/>',
    ghostSeal(),
    '<text x="512" y="95" text-anchor="middle" font-family="' + SERIF + '" font-size="30" letter-spacing="6" fill="' + INK + '">LEONIDA PUBLIC LIBRARY</text>',
    '<text x="512" y="155" text-anchor="middle" font-family="' + SERIF + '" font-size="68" font-weight="bold" fill="' + INK + '">OVERDUE NOTICE</text>',
    '<text x="64" y="187" font-family="' + MONO + '" font-size="20" fill="' + INK + '">YOUR ITEM IS OVERDUE — PLEASE RETURN IT</text>',
    '<text x="960" y="187" text-anchor="end" font-family="' + MONO + '" font-size="20" font-weight="bold" fill="' + INK + '">NOTICE NO. 4811</text>',
    '<line x1="64" y1="212" x2="960" y2="212" stroke="' + INK + '" stroke-width="1.5"/>',
    '<text x="64" y="244" font-family="' + MONO + '" font-size="22" fill="' + INK + '">PATRON: EVERYONE WHO WAITED 13 YEARS • CARD NO. 2013-0917-GTAVI</text>',
    '<text x="64" y="308" font-family="' + MONO + '" font-size="26" font-weight="bold" fill="' + INK + '">ITEM: GRAND THEFT AUTO VI</text>',
    '<text x="64" y="338" font-family="' + MONO + '" font-size="20" fill="' + INK + '">CHECKED OUT 17 SEP 2013 • DUE BACK 01 OCT 2013</text>',
    '<line x1="64" y1="360" x2="960" y2="360" stroke="' + INK + '" stroke-width="1.5"/>',
    '<text x="64" y="402" font-family="' + MONO + '" font-size="22" font-weight="bold" fill="' + INK + '">DAYS OVERDUE</text>',
    '<text x="960" y="402" text-anchor="end" font-family="' + SANS + '" font-size="64" font-weight="bold" fill="' + PINK + '">4,811</text>',
    '<text x="64" y="442" font-family="' + MONO + '" font-size="22" fill="' + INK + '">NEW ITEM: GRAND THEFT AUTO VI — 19 NOV 2026 • $79.99 — 212 GB</text>',
    ledger,
    '<line x1="64" y1="700" x2="960" y2="700" stroke="' + INK + '" stroke-width="1.5"/>',
    '<text x="64" y="744" font-family="' + MONO + '" font-size="26" font-weight="bold" fill="' + INK + '">TOTAL FINE DUE</text>',
    '<text x="960" y="744" text-anchor="end" font-family="' + SANS + '" font-size="72" font-weight="bold" fill="' + INK + '">$481.10</text>',
    '<text x="512" y="786" text-anchor="middle" font-family="' + SERIF + '" font-size="28" font-style="italic" fill="' + PINK + '">THE FINE BUYS GTA VI SIX TIMES OVER.</text>',
    '<rect x="64" y="806" width="896" height="70" fill="none" stroke="' + INK + '" stroke-width="1.5"/>',
    '<text x="84" y="832" font-family="' + MONO + '" font-size="20" fill="' + INK + '">AMOUNT PAID BY AGENT</text>',
    '<text x="940" y="832" text-anchor="end" font-family="' + MONO + '" font-size="20" font-weight="bold" fill="' + INK + '">+$500.00</text>',
    '<text x="84" y="862" font-family="' + MONO + '" font-size="20" fill="' + INK + '">CHANGE — SAVED FOR THE DLC</text>',
    '<text x="940" y="862" text-anchor="end" font-family="' + MONO + '" font-size="20" font-weight="bold" fill="' + INK + '">$18.90</text>',
    stamp(),
    "</svg>",
    "",
  ].join("\n");
}

function verifySvg(svg: string): void {
  const must: string[] = [
    "LEONIDA PUBLIC LIBRARY",
    "OVERDUE NOTICE",
    "NOTICE NO. 4811",
    "PATRON: EVERYONE WHO WAITED 13 YEARS",
    "ITEM: GRAND THEFT AUTO VI",
    "17 SEP 2013",
    "01 OCT 2013",
    "DAYS OVERDUE",
    "4,811",
    "NEW ITEM: GRAND THEFT AUTO VI",
    "19 NOV 2026",
    "$79.99",
    "212 GB",
    "LATE FEE",
    "$481.10",
    "NEXT YEAR",
    "GTA V PLAYTHROUGHS FINISHED",
    "FIRST HEIST",
    "BIRTHDAYS WISHED ON ONE GAME",
    "DAYS LEFT TO WAIT",
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
    if (!svg.includes(s)) throw new Error("verifySvg: missing " + s);
  }
  if (!svg.startsWith("<svg") || !svg.trimEnd().endsWith("</svg>")) {
    throw new Error("verifySvg: not a well-formed svg document");
  }
  // No filled magenta disc in the ghost (outline only, gate 4c).
  if (svg.includes('id="ghostSeal"') && /<circle[^>]*fill="#d6336c"/.test(svg)) {
    throw new Error("verifySvg: ghostSeal must not contain a filled magenta disc");
  }
  // Stamp bbox (unrotated) must not intersect the payment box (gate 4c).
  // Stamp: translate(800 928), rect -150..150 x -40..40 -> 650-950, 888-968.
  // Payment box: x 64-960, y 806-876.
  const stampM = svg.match(/id="stamp" transform="translate\((\d+) (\d+)\)/);
  const boxM = svg.match(/<rect x="64" y="806" width="896" height="70"/);
  if (!stampM || !boxM) throw new Error("verifySvg: stamp or payment box missing");
  const sx = Number(stampM[1]);
  const sy = Number(stampM[2]);
  const stampBox = { x0: sx - 150, y0: sy - 40, x1: sx + 150, y1: sy + 40 };
  const payBox = { x0: 64, y0: 806, x1: 960, y1: 876 };
  const overlap =
    stampBox.x0 < payBox.x1 && payBox.x0 < stampBox.x1 &&
    stampBox.y0 < payBox.y1 && payBox.y0 < stampBox.y1;
  if (overlap) throw new Error("verifySvg: stamp bbox intersects payment box");
  if (stampBox.y0 < payBox.y1 + 12) {
    throw new Error("verifySvg: stamp must sit >=12px clear of the payment box");
  }
}

const svg = buildSvg();
verifySvg(svg);
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "meme.svg"), svg);
console.log("meme.svg written to " + path.join(OUT, "meme.svg") + " (" + svg.length + " bytes)");
