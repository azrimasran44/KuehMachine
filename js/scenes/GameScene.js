import {
  GAME_WIDTH, GAME_HEIGHT, COLS, ROWS, TILE, WORLD_HEIGHT,
  SAFE_TOP, GOAL_ROW, START_COL,
  MOVE_DURATION, COLORS, rowToY, colToX, scrollYForRow,
  MAX_SCROLL_Y, ENVIRONMENT_ADVANCE_SPEED, START_GRACE_MS,
  INITIAL_BUFFER_PX, MAX_BUFFER_PX, BUFFER_REFILL_PX,
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
    this.inputManager = new InputManager();
    this.buffer = INITIAL_BUFFER_PX;
    this.hasMoved = false;

    this.cameras.main.setBounds(0, 0, GAME_WIDTH, WORLD_HEIGHT);

    this.drawBoard();
    this.createPlayer();
    this.furthestRow = this.player.row;
    this.setupCarLanes();
    this.createHud();

    this.cameras.main.scrollY = scrollYForRow(this.player.row);

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
      this.updateEnvironmentAdvance(time, delta);
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

    this.createBufferMeter(HUD_DEPTH);
    this.createPauseButton(HUD_DEPTH);
    this.createGraceHint(HUD_DEPTH);
  }

  createBufferMeter(depth) {
    const width = 100;
    const height = 6;
    const x = GAME_WIDTH - 20 - width;
    const y = SAFE_TOP + 12;

    this.add.rectangle(x, y, width, height, 0x000000, 0.3)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(depth);
    this.bufferMeterFill = this.add.rectangle(x, y, width, height, COLORS.mint, 1)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(depth);
    this.bufferMeterWidth = width;
  }

  updateBufferMeter() {
    const ratio = Phaser.Math.Clamp(this.buffer / MAX_BUFFER_PX, 0, 1);
    this.bufferMeterFill.width = this.bufferMeterWidth * ratio;
    const color = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(COLORS.danger),
      Phaser.Display.Color.ValueToColor(COLORS.mint),
      100,
      ratio * 100,
    );
    this.bufferMeterFill.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
  }

  createGraceHint(depth) {
    // Stays up until the player actually moves rather than fading on a
    // fixed timer — nothing else starts happening until then either, so
    // there's no rush to read it.
    this.graceHint = this.add.text(GAME_WIDTH / 2, SAFE_TOP + 70, 'SWIPE OR ARROW KEYS TO MOVE', {
      fontFamily: 'Syne, sans-serif',
      fontSize: '12px',
      color: '#cfc9e8',
      letterSpacing: 1,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth).setAlpha(0.85);
  }

  dismissGraceHint() {
    if (!this.graceHint) return;
    const hint = this.graceHint;
    this.graceHint = null;
    this.tweens.add({
      targets: hint,
      alpha: 0,
      duration: 400,
      onComplete: () => hint.destroy(),
    });
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

  // --- environment auto-advance -----------------------------------------
  //
  // The survival "buffer" is an independent countdown, not something
  // derived from camera scrollY — scrollY is clamped to [0, MAX_SCROLL_Y]
  // for legitimate rendering reasons (can't scroll past the world edges)
  // and would hit that floor partway through a normal run, silently
  // disabling the danger for the rest of the game. Camera scrollY here is
  // purely cosmetic: a continuous auto-pan so the environment visibly
  // advances even when the player doesn't move, independent of whatever
  // is actually threatening them.

  updateEnvironmentAdvance(time, delta) {
    const dt = delta / 1000;

    if (time - this.gameplayStartAt > START_GRACE_MS) {
      this.buffer -= ENVIRONMENT_ADVANCE_SPEED * dt;
      this.updateBufferMeter();
      if (this.buffer <= 0) {
        this.triggerCaught();
        return;
      }
    }

    this.cameras.main.scrollY = Phaser.Math.Clamp(
      this.cameras.main.scrollY - ENVIRONMENT_ADVANCE_SPEED * dt,
      0, MAX_SCROLL_Y,
    );

    // Safety net: scrollY only ever moves forward (the passive tick, plus
    // tryMovePlayer's forward-only pull), so a player who retreats after
    // banking forward progress can end up positioned below the visible
    // viewport while the buffer still has charge left — technically
    // alive but genuinely invisible. That's a loss regardless of buffer.
    const viewBottom = this.cameras.main.scrollY + GAME_HEIGHT;
    if (this.player.container.y - SPRITE_SIZE / 2 > viewBottom) {
      this.triggerCaught();
    }
  }

  triggerCaught() {
    this.gameEnded = true;
    const blackout = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(2000);
    this.tweens.add({
      targets: blackout,
      alpha: 1,
      duration: 350,
      onComplete: () => this.finishLose('caught'),
    });
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

    if (!this.hasMoved) {
      // Nothing auto-advances until the player acts for the first time —
      // they get unlimited time to see where they are before any
      // pressure starts. The grace period below then applies from here,
      // not from scene start.
      this.hasMoved = true;
      this.gameplayStartAt = this.time.now;
      this.dismissGraceHint();
    }

    // Moving can only ever pull the camera further forward than wherever
    // the passive auto-advance has already brought it — never backward.
    this.cameras.main.scrollY = Math.min(this.cameras.main.scrollY, scrollYForRow(row));
    if (row < this.player.row) {
      this.buffer = Math.min(MAX_BUFFER_PX, this.buffer + BUFFER_REFILL_PX);
      this.updateBufferMeter();
    }

    this.moveEntity(this.player, col, row, MOVE_DURATION, () => this.onPlayerMoveComplete());
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
    // The 'caught' death already has its own dedicated visual (the
    // blackout fade in triggerCaught) — shake/flash on top of a fully
    // opaque screen would just be a pointless colour blip on black.
    if (cause !== 'caught') {
      this.cameras.main.shake(200, 0.01);
      this.cameras.main.flash(200, 255, 77, 109);
    }
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
    this.scene.resume();
  }
}
