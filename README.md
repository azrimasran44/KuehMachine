# Kueh Machine: The Great Reverse Makan

By Azri, for kuehmachine.com.
https://azrimasran44.github.io/KuehMachine/

## Concept

Singapore built a Kueh Machine for the National Kueh Festival: scan a kueh, learn the recipe, make perfect batches forever. During a storm it misread one instruction — "make kueh more alive for the next generation" — and took it literally. At midnight every kueh it ever scanned woke up giant and hungry, convinced it's finally humanity's turn to be sampled. You're a lone survivor crossing an HDB estate one tile at a time, trying to reach the Machine before the kueh reach you. The connection to kuehmachine.com isn't a reference — it's the premise: the site's name is the machine that started all of this.

This build is the first playable slice: one stage, "HDB Panic," now with a proper on-ramp — a Start Screen and a skippable storyline sequence that sets up the whole premise before dropping you into the game as Dr Leonard Rizz, the machine's own creator. The full concept (five more stages, more monster types, a boss, a Character Select carousel with a full chef/monster roster, an ending twist where the Machine is reprogrammed with "kueh is for sharing") is real and written, just scoped down to ship something whole rather than something half-built everywhere.

## Look & feel

Gameplay stays chunky pixel art throughout — deep indigo/navy void-deck night, warm amber-gold HUD text (streetlamp glow), mint-green for the Machine and Ondeh-Ondeh, hot pink-red for Ang Ku Kueh and danger states, hand-built 16×16 nearest-neighbor sprites for traffic, monsters, and the Machine, chunky drop-shadow "pixel-bevel" buttons throughout. Pixelify Sans for titles/HUD/buttons, Syne (the typeface the rest of kuehmachine.com uses) for body copy.

The Start Screen, the story sequence's 6 illustrations, and Dr Leonard Rizz's own sprite are real illustrated reference art (smoothly filtered, not pixel-scaled) rather than pixel art we drew ourselves — a deliberate style contrast between "cinematic" character/story moments and "retro" gameplay, not a mismatch. `assets/sprites/Image for reference.jpg` is the original reference sheet everything here was cropped from.

## Features

- [x] Start Screen — the actual reference illustration: a lightning-struck rooftop Machine atop a lit office tower at night, tap anywhere to begin
- [x] Skippable storyline sequence — 6 story beats across 12 tap-through pages, visual-novel style, each with its own real illustration (the lab, a close-up scan, the storm, the lightning strike, the monster reveal, the stairwell to the switch) — with a Skip button visible throughout and progress dots showing how much is left
- [x] Dr Leonard Rizz — the Machine's own creator, hardcoded as the (for now) only playable character, dropped straight into the building he built once the story ends or is skipped
- [x] The environment auto-advances independent of the player, Crossy Road-style — a survival buffer drains continuously and only refills when you move toward the Machine, and doesn't start at all until your first move so you always get a clear look at your character before any pressure begins; let it hit zero (or retreat far enough to fall off the bottom of the screen) and the screen shakes and blacks out
- [x] Grid-based lane crossing — swipe or keyboard (arrows/WASD), one tile per move
- [x] Every road is safe to stand on — the danger is live traffic (slow and fast cars, alternating direction per lane), not the lane itself, and traffic gets denser and faster the closer you get to the Machine
- [x] The kueh monsters aren't roaming hazards — they only appear as the death animation: get hit by a car and one lunges in from behind to finish the job
- [x] A long route (28 rows) with a scrolling camera that eases smoothly toward the player rather than snapping — the Machine isn't visible until you've made real progress toward it
- [x] Win by reaching the Kueh Machine row; instant one-thumb retry after any death
- [x] True full-screen canvas on phones; capped to a mobile-width column (not stretched full-width) on desktop browsers
- [x] Pause (manual button + auto-pause when the tab loses focus), with a "3, 2, 1, GO!" countdown before play actually resumes
- [x] High score, saved locally and synced to your kuehmachine.com account when signed in

## Backlog (not in this build)

- Character Select — a swipeable carousel to choose from a full chef roster (each one also doubling as their corresponding in-game monster design), deferred until there's more than one playable character
- Stages 2–6, more monster types, the boss, the ending cutscene
- Haptics, reduced-motion mode
- A public leaderboard instead of just a private high score
