export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844; // the camera viewport, not the whole level

export const COLS = 6;
export const TILE = GAME_WIDTH / COLS;

// Full-screen (ENVELOP scale mode) crops a bit off the top/bottom on
// aspect ratios flatter than our 390:844 design — worst case among our
// required test sizes is ~75 logical px. Keep HUD text inside this band
// so it survives every tested size instead of getting clipped.
export const SAFE_TOP = 90;
export const SAFE_BOTTOM = GAME_HEIGHT - 90;

export const ROWS = 28; // total rows in the level — much taller than one screen
// World-space padding above the goal row. Needs to clear the fixed HUD
// bar (see SAFE_TOP below) — otherwise the Machine's big reveal at the
// end of the route scrolls in right behind the score/pause bar instead
// of appearing cleanly on the board.
export const BOARD_TOP = 140;
export const WORLD_HEIGHT = BOARD_TOP + ROWS * TILE + 40;

export const GOAL_ROW = 0;
export const START_ROW = ROWS - 1;
export const START_COL = Math.floor(COLS / 2);

export const MOVE_DURATION = 130;

// Once the player has advanced far enough, the camera settles into
// tracking them at roughly this screen height, world scrolling beneath —
// clamped at both ends so it pins to the start row at the beginning and
// to the goal row at the very end instead of over-scrolling past them.
export const CAMERA_FOLLOW_Y = GAME_HEIGHT * 0.62;
export const MAX_SCROLL_Y = Math.max(0, WORLD_HEIGHT - GAME_HEIGHT);

// Every crossing row is a road: safe to stand on, dangerous only while a
// car is actually passing through your tile.
export const CAR_SPEED_SLOW = 60; // world px / second
export const CAR_SPEED_FAST = 125;

// Stand still (or dawdle) this long and a kueh monster starts closing in
// from behind while the camera creeps in on you — matches Crossy Road's
// "don't just sit there" pressure.
export const IDLE_THRESHOLD_MS = 3000;
export const CHASE_STEP_MS = 550; // how often the chaser advances one row
export const CHASE_SPAWN_ROWS_BEHIND = 3;
export const CAMERA_ZOOM_IDLE = 1.16;
export const CAMERA_ZOOM_LERP = 0.06; // per-frame ease toward the target zoom

export const COLORS = {
  background: 0x0a0820,
  laneA: 0x1c1650,
  laneB: 0x241c63,
  goalLane: 0x0f3d33,
  goalGlow: 0x38d39f,
  playerHalo: 0xffb703,
  angKuKuehHalo: 0xff4d6d,
  ondehOndehHalo: 0x38d39f,
  hudGold: '#ffd166',
  hudCream: '#fdf6ec',
  danger: '#ff4d6d',
  mint: '#38d39f',
};

export function rowToY(row) {
  return BOARD_TOP + row * TILE + TILE / 2;
}

export function colToX(col) {
  return col * TILE + TILE / 2;
}

export function scrollYForRow(row) {
  return Phaser.Math.Clamp(rowToY(row) - CAMERA_FOLLOW_Y, 0, MAX_SCROLL_Y);
}
