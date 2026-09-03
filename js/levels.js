import { COLS } from './config.js';

// Every crossing row in a level is EXACTLY one of:
//   'traffic'  — Level 1 only, cars (today's buildCarLanes, parameterized)
//   'monster'  — Levels 2-3, a horizontal hazard lane, obstacle-free
//   'obstacle' — Levels 2-3, static props, hazard-free
// Never both, never neither — see buildLaneLayout() below.

export const LEVELS = [
  {
    id: 1,
    name: 'HDB PANIC',
    subtitle: 'Cross the street. Reach the lab.',
    rows: 28,
    laneMode: 'traffic',
    goalTexture: 'lab_building',
    floorTexture: 'tile',
    hazardTexture: 'road',
    hazardSpeedSlow: 60,
    hazardSpeedFast: 125,
  },
  {
    id: 2,
    name: 'GROUND FLOOR',
    subtitle: 'The kueh monsters are already inside.',
    rows: 22,
    laneMode: 'alternating',
    goalTexture: 'staircase',
    floorTexture: 'office_tile',
    hazardTexture: 'office_tile',
    hazardSpeedSlow: 70,
    hazardSpeedFast: 140,
    obstacleDensity: 0.35,
    obstacleTypes: ['office_table', 'office_chair', 'office_plant'],
  },
  {
    id: 3,
    name: 'THE MACHINE FLOOR',
    subtitle: "One floor left. Don't slow down.",
    rows: 24,
    laneMode: 'alternating',
    goalTexture: 'machine',
    floorTexture: 'office_tile',
    hazardTexture: 'office_tile',
    hazardSpeedSlow: 95,
    hazardSpeedFast: 175,
    obstacleDensity: 0.5,
    obstacleTypes: ['office_table', 'office_chair', 'office_plant'],
  },
];

export function getLevelConfig(levelNum) {
  return LEVELS[Phaser.Math.Clamp(levelNum, 1, LEVELS.length) - 1];
}

export function buildLaneLayout(levelConfig) {
  const crossingRows = levelConfig.rows - 2; // excludes goal row (0) and start row (rows-1)

  if (levelConfig.laneMode === 'traffic') {
    return buildTrafficLanes(crossingRows, levelConfig);
  }

  const lanes = [];
  for (let i = 1; i <= crossingRows; i++) {
    lanes.push(i % 2 === 1
      ? buildMonsterLane(i, crossingRows, levelConfig)
      : buildObstacleLane(i, levelConfig));
  }
  return lanes;
}

// Level 1's original buildCarLanes() logic, parameterized instead of
// reading ROWS/CAR_SPEED_SLOW/CAR_SPEED_FAST off config.js directly, so
// this module is the single source of truth for level-specific tuning.
// Direction alternates by row parity; speed/density both ramp up the
// closer a lane is to the goal, same rhythm as before.
function buildTrafficLanes(crossingRows, levelConfig) {
  const lanes = [];
  for (let i = 1; i <= crossingRows; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const progress = (crossingRows - i) / (crossingRows - 1);
    const isFast = i % 3 === 0 || progress > 0.7;
    const baseGap = isFast ? 4200 : 6200;
    const spawnGapMs = Math.max(1800, baseGap - progress * 2600);
    lanes.push({
      row: i,
      type: 'traffic',
      dir,
      speed: isFast ? levelConfig.hazardSpeedFast : levelConfig.hazardSpeedSlow,
      spawnGapMs,
      isFast,
    });
  }
  return lanes;
}

// Mirrors buildTrafficLanes' progress-based ramp (alternating direction,
// speed/gap tightening near the goal) so Levels 2-3 feel like the same
// engine as Level 1, just with a monster instead of a car.
function buildMonsterLane(i, crossingRows, levelConfig) {
  const dir = i % 4 === 1 ? 1 : -1;
  const progress = (crossingRows - i) / (crossingRows - 1);
  const isFast = progress > 0.6;
  const speed = isFast ? levelConfig.hazardSpeedFast : levelConfig.hazardSpeedSlow;
  const baseGap = isFast ? 4000 : 5800;
  const spawnGapMs = Math.max(1600, baseGap - progress * 2200);
  return { row: i, type: 'monster', dir, speed, spawnGapMs, isFast };
}

// Guarantees at least one open column BY CONSTRUCTION (pick the
// guaranteed-open column first, then fill up to density*(COLS-1) of the
// rest) rather than by chance — the level always stays solvable, since
// tryMovePlayer already allows free lateral movement independent of
// forward progress, so one open column per row is enough.
function buildObstacleLane(row, levelConfig) {
  const targetCount = Math.round((COLS - 1) * levelConfig.obstacleDensity);
  const allCols = Phaser.Utils.Array.NumberArray(0, COLS - 1);
  const openCol = Phaser.Utils.Array.GetRandom(allCols);
  const candidates = Phaser.Utils.Array.Shuffle(allCols.filter((c) => c !== openCol));
  const occupiedCols = candidates.slice(0, targetCount);
  const propTypes = occupiedCols.map(() => Phaser.Utils.Array.GetRandom(levelConfig.obstacleTypes));
  return { row, type: 'obstacle', occupiedCols, propTypes };
}
