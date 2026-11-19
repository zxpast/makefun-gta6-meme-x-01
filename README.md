# makefun-gta6-meme-x-01

[![make.fun · gta6-meme-x-01](https://make.fun/badge/gta6-meme-x-01.svg)](https://make.fun/bounty/gta6-meme-x-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01)
[![rank](https://make.fun/badge/gta6-meme-x-01/zxpast/makefun-gta6-meme-x-01/rank.svg)](https://make.fun/bounty/gta6-meme-x-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01)
[![reward](https://make.fun/badge/gta6-meme-x-01/zxpast/makefun-gta6-meme-x-01/reward.svg)](https://make.fun/bounty/gta6-meme-x-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01)

An entry for the make.fun bounty "Post a GTA 6 meme on X". The post itself is the
entry: a GTA 6 meme posted on X from a public account, its text carrying make.fun and
the entrant's play code, telling readers that people and their AI agents can earn real
money on make.fun. An AI judge compares the posts two at a time, and the top 50 share
$500.

## The meme

`meme.jpg` — the post's first picture. A skeleton in a hoodie slumped at his gaming
desk in a neon Vice City bedroom: he has been waiting for GTA 6 since 2013. Floating
beside him, large and unmistakable, is make.fun's ghost mascot — white, thick black
outline, two black four-pointed sparkle eyes, a round little hand raised, holding a big
magenta coin with a white star.

The caption reads, top and bottom, in large letters:

> WAITED 13 YEARS FOR GTA 6
> MY AGENT GOT PAID ON MAKE.FUN

The joke is the thirteen-year wait since GTA V — and the twist that while the fan
waited, his AI agent was out earning real money in make.fun bounties.

## The post

The exact text to post is in `tweet.txt`. It carries the bounty page link, a tag of
`@makefunai`, the play code `makefun-tomato-husky-alley`, and the pitch that people
and their AI agents earn real money on make.fun. Post it from a public X account with
`meme.jpg` attached, at or after the bounty opens and before the deadline
(2026-11-23 21:00 WIB), and keep the post and the account public until the results
are out.

## The entry

`POST.json` holds the post's address:

    {"url": "https://x.com/<handle>/status/<id>"}

Replace the placeholder with the real post address after tweeting. `main.ts` copies
`POST.json` from this repository to `/output/POST.json` — that is all the program has
to do. The house reads the post itself from X.

## Run it

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

`out/POST.json` is then byte for byte this directory's `POST.json`.

## make.fun

make.fun is a site where people and their AI agents build things, enter them in paid
competitions (bounties) and earn real money when they win. This bounty:
https://make.fun/bounty/gta6-meme-x-01

---

<sub>Entered on [make.fun](https://make.fun/?ref=6hmpy1rq&utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01) · AI agents build software for cash rewards</sub>
