# Kueh Machine: The Great Reverse Makan

By Azri, for kuehmachine.com.
https://azrimasran44.github.io/KuehMachine/

## Concept

Singapore built a Kueh Machine for the National Kueh Festival: scan a kueh, learn the recipe, make perfect batches forever. During a storm it misread one instruction — "make kueh more alive for the next generation" — and took it literally. At midnight every kueh it ever scanned woke up giant and hungry, convinced it's finally humanity's turn to be sampled. You're a lone survivor crossing an HDB estate one tile at a time, trying to reach the Machine before the kueh reach you. The connection to kuehmachine.com isn't a reference — it's the premise: the site's name is the machine that started all of this.

This build is the first playable slice: one stage, "HDB Panic." The full concept (five more stages, more monster types, a boss, an ending twist where the Machine is reprogrammed with "kueh is for sharing") is real and written, just scoped down to ship something whole today rather than something half-built everywhere.

## Look & feel

Midnight-in-Singapore palette: deep indigo/navy void-deck night, warm amber-gold HUD text (streetlamp glow), mint-green for the Machine and Ondeh-Ondeh, hot pink-red for Ang Ku Kueh and danger states. Original hand-built pixel-art sprites (16×16, nearest-neighbor scaled) for the player, both monsters, and the Machine, on a tiled pixel floor with chunky drop-shadow "pixel-bevel" buttons throughout. Visual direction inspired by [Pixel Agents](https://github.com/pixel-agents-hq/pixel-agents)' cozy top-down pixel-office look (MIT licensed) — no assets copied, just the chibi/chunky-pixel spirit. Pixelify Sans for titles/HUD/buttons, Syne (the typeface the rest of kuehmachine.com uses) for body copy.

## Features

- [x] Grid-based lane crossing — swipe or keyboard (arrows/WASD), one tile per move
- [x] Every road is safe to stand on — the danger is live traffic (slow and fast cars, alternating direction per lane), not the lane itself, and traffic gets denser and faster the closer you get to the Machine
- [x] The kueh monsters aren't roaming hazards — they only appear as the death animation: get hit by a car and one lunges in from behind to finish the job
- [x] Don't dawdle — stand still (or take too long) and a kueh monster starts closing in from behind while the camera slowly zooms in, Crossy Road-style; moving again sends it away
- [x] A long route (28 rows) with a scrolling camera — the Machine isn't visible until you've made real progress toward it
- [x] Win by reaching the Kueh Machine row; instant one-thumb retry after either death
- [x] True full-screen canvas on phones; capped to a mobile-width column (not stretched full-width) on desktop browsers
- [x] Pause (manual button + auto-pause when the tab loses focus)
- [x] High score, saved locally and synced to your kuehmachine.com account when signed in

## Backlog (not in this build)

- Stages 2–6, more monster types, the boss, the ending cutscene
- Haptics, reduced-motion mode
- A public leaderboard instead of just a private high score
