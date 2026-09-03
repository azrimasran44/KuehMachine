# Kueh Machine: The Great Reverse Makan

By Azri, for kuehmachine.com.
https://azrimasran44.github.io/KuehMachine/

## Concept

Singapore built a Kueh Machine for the National Kueh Festival: scan a kueh, learn the recipe, make perfect batches forever. During a storm it misread one instruction — "make kueh more alive for the next generation" — and took it literally. At midnight every kueh it ever scanned woke up giant and hungry, convinced it's finally humanity's turn to be sampled. You're a lone survivor crossing an HDB estate one tile at a time, trying to reach the Machine before the kueh reach you. The connection to kuehmachine.com isn't a reference — it's the premise: the site's name is the machine that started all of this.

This build is the first full arc: a Start Screen and a skippable storyline sequence set up the whole premise, then three levels carry it through — "HDB Panic" (the street, dodging cars, reaching the lab building), "Ground Floor" (inside the lab, cars replaced by roaming kueh monsters, office furniture cluttering the lanes without one), and "The Machine Floor" (the same idea turned up — denser, faster — ending at the actual Kueh Machine). The full concept (more monster types, a boss, a Character Select carousel with a full chef/monster roster, an ending twist where the Machine is reprogrammed with "kueh is for sharing") is real and written, just scoped down to ship something whole rather than something half-built everywhere.

## Look & feel

Gameplay — including Dr Leonard Rizz's own sprite — stays chunky pixel art throughout: deep indigo/navy void-deck night, warm amber-gold HUD text (streetlamp glow), mint-green for the Machine and Ondeh-Ondeh, hot pink-red for Ang Ku Kueh and danger states, hand-built 16×16 nearest-neighbor sprites for the player, traffic, monsters, the lab building/staircase/Machine goal markers, and the ground-floor office set (floor tile, table, chair, plant), chunky drop-shadow "pixel-bevel" buttons throughout. Pixelify Sans for titles/HUD/buttons, Syne (the typeface the rest of kuehmachine.com uses) for body copy.

The Start Screen and the story sequence's 6 illustrations are the exception — real illustrated reference art (smoothly filtered, not pixel-scaled). Those onboarding/narrative moments read as "cinematic," everything you actually play stays retro.

## Features

- [x] Start Screen — the actual reference illustration: a lightning-struck rooftop Machine atop a lit office tower at night, tap anywhere to begin
- [x] Skippable storyline sequence, Pokémon-style — each of the 6 beats is a full-screen illustration with a pixel-art dialogue box (hand-drawn 9-slice frame, not a plain rectangle) overlaid near the bottom, consistent position and size throughout, with a Skip button visible the whole time and progress dots showing how much is left
- [x] Dr Leonard Rizz — the Machine's own creator, hardcoded as the (for now) only playable character; the moment the story ends or is skipped, he drops in from above the frame and lands on his starting tile with a little impact bounce, controls locked (and immune to traffic) until he's actually down
- [x] The environment auto-advances independent of the player, Crossy Road-style — a survival buffer drains continuously and only refills when you move toward the Machine, and doesn't start at all until your first move so you always get a clear look at your character before any pressure begins; let it hit zero (or retreat far enough to fall off the bottom of the screen) and the screen shakes and blacks out
- [x] Grid-based lane crossing — swipe or keyboard (arrows/WASD), one tile per move
- [x] Three levels, one continuous run, score carrying across all of them: Level 1 is the street — every lane is safe to stand on, the danger is live traffic (slow and fast cars, alternating direction per lane), denser and faster the closer you get to the lab. Levels 2–3 are the lab's ground floor — cars are replaced by roaming kueh monsters, and every crossing lane is *either* a monster lane *or* cluttered with static office furniture (table/chair/plant) to detour around, never both, with a warm tint marking which is which; Level 3 is the same idea tuned harder
- [x] The kueh monsters double duty: in Level 1 they only appear as the death animation (get hit by a car and one lunges in from behind to finish the job); in Levels 2–3 they're also the live roaming hazard
- [x] Each level has its own scrolling camera that eases smoothly toward the player rather than snapping — the goal isn't visible until you've made real progress toward it — and a lightweight title-card transition between levels
- [x] Reach Level 1's goal to unlock the lab building, Level 2's to reach the staircase, Level 3's to reach the actual Kueh Machine and win; any death, at any level, restarts the whole run from Level 1 — instant one-thumb retry
- [x] True full-screen canvas on phones; capped to a mobile-width column (not stretched full-width) on desktop browsers
- [x] Pause (manual button + auto-pause when the tab loses focus), with a "3, 2, 1, GO!" countdown before play actually resumes
- [x] High score, saved locally and synced to your kuehmachine.com account when signed in

## Backlog (not in this build)

- Character Select — a swipeable carousel to choose from a full chef roster (each one also doubling as their corresponding in-game monster design), deferred until there's more than one playable character
- More monster types beyond Ang Ku Kueh/Ondeh-Ondeh, a boss, the ending cutscene
- Haptics, reduced-motion mode
- A public leaderboard instead of just a private high score
