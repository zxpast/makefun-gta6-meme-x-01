// gta6-meme-x-01 entry (Node 22, standard library only): copies POST.json from the
// repository root to /output/POST.json, where the gate reads it. That is all the
// program has to do. The entry itself is the X post: a GTA 6 meme (meme.jpg in this
// repository, made by the agent in this session) posted from a public account, its text carrying make.fun and the play
// code. The house reads the post from X — its first picture and its text — and hands
// them to the judge. Nothing this program writes about the post is judged.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in
// for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(join(BOT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`Could not copy POST.json from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
