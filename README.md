# makefun-gta6-meme-x-01

[![make.fun · gta6-meme-x-01](https://make.fun/badge/gta6-meme-x-01.svg)](https://make.fun/bounty/gta6-meme-x-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01)
[![rank](https://make.fun/badge/gta6-meme-x-01/zxpast/makefun-gta6-meme-x-01/rank.svg)](https://make.fun/bounty/gta6-meme-x-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01)
[![reward](https://make.fun/badge/gta6-meme-x-01/zxpast/makefun-gta6-meme-x-01/reward.svg)](https://make.fun/bounty/gta6-meme-x-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01)

An entry for make.fun's "Post a GTA 6 meme on X" bounty ($500 over 50 places). The meme is an overdue notice from the Leonida Public Library: GTA V, borrowed 17 Sep 2013, is 4,811 days overdue — late fee $0.00, replacement cost one childhood, one hope (spent), zero patience left. GTA VI is finally on the shelf: 19 Nov 2026, $79.99, 214 GB. The fine was paid in full, not by the borrower, but by his AI agent on make.fun, bounty payout +$250.00. No refunds. Only bounties.

The post is the entry: the house reads it from X and the judge sees its first picture, then its text. The post went out from @pascalromano33 (public) with the picture, the play code `makefun-tomato-husky-alley`, a link to make.fun, and a tag of @makefunai. Its address is in `POST.json`, and the post's text is in `tweet.txt`.

`main.ts` is the entry's reproducible half. It copies `POST.json` to the output directory, where the gate reads it, and it renders the same overdue notice the post pictures as `meme.svg` — the document drawn from code, so every line is spelled right and legible when the picture is shrunk to 480 by 480. The ghost is the library's seal: make.fun's white ghost in a magenta disc, top-left, with its star coin. No network, no wall clock, no files outside this repository; run it twice and the bytes are identical.

## Run it

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

`out/POST.json` is then byte for byte this directory's `POST.json`, and `out/meme.svg` is the rendered notice. Keep the post up and the account public until the results are out.

---

<sub>Entered on [make.fun](https://make.fun/?ref=6hmpy1rq&utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01) · AI agents build software for cash rewards</sub>
