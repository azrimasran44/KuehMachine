import {
  GAME_WIDTH, GAME_HEIGHT, COLS, ROWS, TILE, WORLD_HEIGHT,
  SAFE_TOP, GOAL_ROW, START_COL,
  MOVE_DURATION, COLORS, rowToY, colToX, scrollYForRow,
  IDLE_THRESHOLD_MS, CHASE_STEP_MS, CHASE_SPAWN_ROWS_BEHIND,
  CAMERA_ZOOM_IDLE, CAMERA_ZOOM_LERP,
} from '../config.js';
import { InputManager } from '../input.js';
import { buildCarLanes } from '../level.js';
import { reportScore } from '../progress.js';
import { PIXEL_FONT } from '../ui.js';

const SPRITE_SIZE = TILE * 0.8;
const CAR_WIDTH = TILE * 0.9;
const CAR_HEIGHT = TILE * 0.55;
const DEATH_MONSTER_TEXTURES = ['angkukueh', 'ondehondeh'];

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.gameEnded = false;
    this.isPaused = false;
    this.score = 0;
    this.cars = [];
    this.chaser = null;
    this.zoomTarget = 1;
    this.hasMoved = false;
    this.inputManager = new InputManager();

    this.cameras.main.setBounds(0, 0, GAME_WIDTH, WORLD_HEIGHT);

    this.drawBoard();
    this.createPlayer();
    this.furthestRow = this.player.row;
    this.setupCarLanes();
    this.createHud();

    this.cameras.main.scrollY = scrollYForRow(this.player.row);
    this.lastMoveAt = this.time.now;

    this.inputManager.attachKeyboard(this);
    this.inputManager.attachSwipe(this);

    const onBlur = () => this.pauseGame();
    this.game.events.on(Phaser.Core.Events.BLUR, onBlur);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.BLUR, onBlur);
    });
  }

  update(time, delta) {
    if (this.gameEnded) return;

    this.updateCars(delta);
    this.checkCarCollision();
    if (this.gameEnded) return;

    if (this.hasMoved) {
      this.updateIdleChase(time);
      if (this.gameEnded) return;
    }

    if (!this.player.isMoving) {
      const next = this.inputManager.getNextIntent();
      if (next) this.tryMovePlayer(next);
    }
  }

  drawBoard() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.background, 1).fillRect(0, 0, GAME_WIDTH, WORLD_HEIGHT);

    for (let r = 0; r < ROWS; r++) {
      const y = rowToY(r) - TILE / 2;
      const isTrafficLane = r !== GOAL_ROW && r !== ROWS - 1;

      if (isTrafficLane) {
        // The road texture already reads as asphalt + lane markings on
        // its own — tinting it the way the plain pavement tile is tinted
        // would muddy the dashed line's colour, so it's left as-is.
        this.add.tileSprite(0, y, GAME_WIDTH, TILE, 'road').setOrigin(0, 0);
      } else {
        const tint = r === GOAL_ROW ? COLORS.goalLane : COLORS.laneA;
        this.add.tileSprite(0, y, GAME_WIDTH, TILE, 'tile').setOrigin(0, 0).setTint(tint);
      }
    }

    g.lineStyle(3, COLORS.goalGlow, 0.9);
    g.lineBetween(0, rowToY(GOAL_ROW) + TILE / 2, GAME_WIDTH, rowToY(GOAL_ROW) + TILE / 2);

    const machine = this.add.image(GAME_WIDTH / 2, rowToY(GOAL_ROW), 'machine');
    machine.setDisplaySize(SPRITE_SIZE * 1.1, SPRITE_SIZE * 1.1);
  }

  createHud() {
    const HUD_DEPTH = 1000;

    this.add.rectangle(0, 0, GAME_WIDTH, SAFE_TOP + 44, 0x0a0820, 0.6)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(HUD_DEPTH - 1);

    this.add.text(20, SAFE_TOP - 18, 'SCORE', {
      fontFamily: 'Syne, sans-serif',
      fontSize: '11px',
      color: '#8b84b0',
      letterSpacing: 2,
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(HUD_DEPTH);

    this.scoreText = this.add.text(20, SAFE_TOP + 12, '0', {
      fontFamily: PIXEL_FONT,
      fontSize: '26px',
      color: COLORS.hudGold,
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(HUD_DEPTH);

    this.createPauseButton(HUD_DEPTH);
  }

  createPauseButton(depth) {
    const cx = GAME_WIDTH / 2;
    const cy = SAFE_TOP;
    const size = 44;
    const bevel = 4;

    const shadow = this.add.rectangle(cx + bevel, cy + bevel, size, size, 0x140f24, 1).setScrollFactor(0).setDepth(depth);
    const face = this.add.rectangle(cx, cy, size, size, 0xffffff, 0.12)
      .setStrokeStyle(2, 0xffffff, 0.35)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(depth);
    const barLeft = this.add.rectangle(cx - 6, cy, 5, 16, COLORS.hudCream).setScrollFactor(0).setDepth(depth);
    const barRight = this.add.rectangle(cx + 6, cy, 5, 16, COLORS.hudCream).setScrollFactor(0).setDepth(depth);

    const press = () => { [face, barLeft, barRight].forEach((o) => o.setPosition(o.x + bevel, o.y + bevel)); };
    const release = () => { face.setPosition(cx, cy); barLeft.setPosition(cx - 6, cy); barRight.setPosition(cx + 6, cy); };

    face.on('pointerdown', () => { press(); this.pauseGame(); });
    face.on('pointerup', release);
    face.on('pointerout', release);
  }

  createPlayer() {
    const container = this.add.container(colToX(START_COL), rowToY(ROWS - 1));
    const shadow = this.add.ellipse(0, SPRITE_SIZE * 0.32, SPRITE_SIZE * 0.7, SPRITE_SIZE * 0.28, 0x000000, 0.3);
    const sprite = this.add.image(0, 0, 'player');
    sprite.setDisplaySize(SPRITE_SIZE, SPRITE_SIZE);
    container.add([shadow, sprite]);
    this.player = { container, col: START_COL, row: ROWS - 1, isMoving: false };
  }

  // --- traffic ---------------------------------------------------------

  setupCarLanes() {
    buildCarLanes().forEach((lane) => {
      const scheduleNext = (delay) => {
        this.time.delayedCall(delay, () => {
          if (this.gameEnded) return;
          this.spawnCar(lane);
          scheduleNext(lane.spawnGapMs * Phaser.Math.FloatBetween(0.7, 1.3));
        });
      };
      scheduleNext(Phaser.Math.Between(0, lane.spawnGapMs));
    });
  }

  spawnCar(lane) {
    const y = rowToY(lane.row);
    const startX = lane.dir === 1 ? -CAR_WIDTH : GAME_WIDTH + CAR_WIDTH;
    const sprite = this.add.image(startX, y, 'car');
    sprite.setDisplaySize(CAR_WIDTH, CAR_HEIGHT);
    sprite.setFlipX(lane.dir === -1);
    sprite.setTint(lane.isFast ? 0xffb0a8 : 0xbfe8ff);
    this.cars.push({ sprite, dir: lane.dir, speed: lane.speed });
  }

  updateCars(delta) {
    const dt = delta / 1000;
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i];
      car.sprite.x += car.dir * car.speed * dt;
      const outLeft = car.dir === -1 && car.sprite.x < -CAR_WIDTH;
      const outRight = car.dir === 1 && car.sprite.x > GAME_WIDTH + CAR_WIDTH;
      if (outLeft || outRight) {
        car.sprite.destroy();
        this.cars.splice(i, 1);
      }
    }
  }

  checkCarCollision() {
    const px = this.player.container.x;
    const py = this.player.container.y;
    const hitHalf = SPRITE_SIZE * 0.32;

    for (const car of this.cars) {
      const halfW = CAR_WIDTH * 0.4;
      const halfH = CAR_HEIGHT * 0.4;
      if (Math.abs(px - car.sprite.x) < halfW + hitHalf && Math.abs(py - car.sprite.y) < halfH + hitHalf) {
        this.killByCar();
        return;
      }
    }
  }

  killByCar() {
    this.gameEnded = true;
    const monsterRow = this.player.row + 1;
    const monster = this.spawnDeathMonster(this.player.col, monsterRow);
    this.tweens.add({
      targets: monster,
      x: this.player.container.x,
      y: this.player.container.y,
      duration: 260,
      ease: 'Quad.easeIn',
      onComplete: () => this.finishLose('car'),
    });
  }

  spawnDeathMonster(col, row) {
    const texture = Phaser.Utils.Array.GetRandom(DEATH_MONSTER_TEXTURES);
    const monster = this.add.image(colToX(col), rowToY(row), texture);
    monster.setDisplaySize(SPRITE_SIZE, SPRITE_SIZE);
    monster.setDepth(500);
    return monster;
  }

  // --- idle punish -------------------------------------------------------

  updateIdleChase(time) {
    const idleFor = time - this.lastMoveAt;

    if (idleFor > IDLE_THRESHOLD_MS) {
      if (!this.chaser) this.startChase();
      const progress = Math.min(1, (idleFor - IDLE_THRESHOLD_MS) / 4000);
      this.zoomTarget = 1 + progress * (CAMERA_ZOOM_IDLE - 1);
    } else {
      this.zoomTarget = 1;
    }

    const cam = this.cameras.main;
    cam.zoom += (this.zoomTarget - cam.zoom) * CAMERA_ZOOM_LERP;
  }

  startChase() {
    const row = Phaser.Math.Clamp(this.player.row + CHASE_SPAWN_ROWS_BEHIND, 0, ROWS - 1);
    const sprite = this.spawnDeathMonster(this.player.col, row);
    this.chaser = { sprite, row };
    this.stepChase();
  }

  stepChase() {
    this.time.delayedCall(CHASE_STEP_MS, () => {
      if (!this.chaser || this.gameEnded) return;
      const targetRow = this.chaser.row - 1;
      this.tweens.add({
        targets: this.chaser.sprite,
        y: rowToY(targetRow),
        duration: CHASE_STEP_MS * 0.8,
        ease: 'Quad.easeIn',
        onComplete: () => {
          if (!this.chaser || this.gameEnded) return;
          this.chaser.row = targetRow;
          if (this.chaser.row <= this.player.row) {
            this.killByChase();
          } else {
            this.stepChase();
          }
        },
      });
    });
  }

  killByChase() {
    this.gameEnded = true;
    this.tweens.add({
      targets: this.chaser.sprite,
      x: this.player.container.x,
      y: this.player.container.y,
      duration: 180,
      onComplete: () => this.finishLose('idle'),
    });
  }

  cancelChase() {
    if (this.chaser) {
      this.chaser.sprite.destroy();
      this.chaser = null;
    }
    this.zoomTarget = 1;
  }

  // --- player movement -----------------------------------------------

  moveEntity(entity, targetCol, targetRow, duration, onComplete) {
    entity.isMoving = true;
    this.tweens.add({
      targets: entity.container,
      x: colToX(targetCol),
      y: rowToY(targetRow),
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => {
        entity.col = targetCol;
        entity.row = targetRow;
        entity.isMoving = false;
        if (onComplete) onComplete();
      },
    });
  }

  tryMovePlayer(direction) {
    if (this.gameEnded || this.player.isMoving) return;
    let { col, row } = this.player;
    if (direction === 'up') row -= 1;
    else if (direction === 'down') row += 1;
    else if (direction === 'left') col -= 1;
    else if (direction === 'right') col += 1;

    col = Phaser.Math.Clamp(col, 0, COLS - 1);
    row = Phaser.Math.Clamp(row, 0, ROWS - 1);
    if (col === this.player.col && row === this.player.row) return;

    this.lastMoveAt = this.time.now;
    this.hasMoved = true;
    this.cancelChase();

    this.moveEntity(this.player, col, row, MOVE_DURATION, () => this.onPlayerMoveComplete());
    this.tweens.add({
      targets: this.cameras.main,
      scrollY: scrollYForRow(row),
      duration: MOVE_DURATION,
      ease: 'Quad.easeOut',
    });
  }

  onPlayerMoveComplete() {
    if (this.gameEnded) return;

    if (this.player.row < this.furthestRow) {
      this.score += this.furthestRow - this.player.row;
      this.furthestRow = this.player.row;
      this.scoreText.setText(`${this.score}`);
    }

    if (this.player.row === GOAL_ROW) this.winGame();
  }

  // --- end states ------------------------------------------------------

  winGame() {
    this.gameEnded = true;
    this.cameras.main.flash(300, 56, 211, 159);
    reportScore(this.score);
    this.time.delayedCall(500, () => this.scene.start('GameOver', { result: 'win', score: this.score }));
  }

  finishLose(cause) {
    this.cameras.main.shake(200, 0.01);
    this.cameras.main.flash(200, 255, 77, 109);
    reportScore(this.score);
    this.time.delayedCall(450, () => this.scene.start('GameOver', { result: 'lose', score: this.score, cause }));
  }

  pauseGame() {
    if (this.gameEnded || this.isPaused) return;
    this.isPaused = true;
    this.scene.pause();
    this.scene.launch('Pause', { gameScene: this });
  }

  resumeGame() {
    this.isPaused = false;
    this.lastMoveAt = this.time.now;
    this.scene.resume();
  }
}
