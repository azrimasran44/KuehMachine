import { ROWS, CAR_SPEED_SLOW, CAR_SPEED_FAST } from './config.js';

// Every crossing row is a road lane: alternating direction for visual
// rhythm, with speed and traffic density both ramping up the closer the
// lane is to the Machine — the last stretch is meant to feel hairier
// than the first. Row numbers count down from the start toward the goal
// (row 1 is nearest the Machine, row `crossingRows` is nearest the
// start), so "progress toward the goal" runs opposite to the row index.
export function buildCarLanes() {
  const lanes = [];
  const crossingRows = ROWS - 2; // excludes the goal row and the start row

  for (let i = 1; i <= crossingRows; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const progress = (crossingRows - i) / (crossingRows - 1);
    const isFast = i % 3 === 0 || progress > 0.7;

    // Gaps are sized relative to how long a car stays on screen at each
    // speed, so a lane reads as "occasional traffic" rather than a wall —
    // tightening only gradually as progress climbs toward the Machine.
    const baseGap = isFast ? 4200 : 6200;
    const spawnGapMs = Math.max(1800, baseGap - progress * 2600);

    lanes.push({
      row: i,
      dir,
      speed: isFast ? CAR_SPEED_FAST : CAR_SPEED_SLOW,
      spawnGapMs,
      isFast,
    });
  }

  return lanes;
}
