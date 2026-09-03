import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config.js';
import { getLevelConfig } from '../levels.js';
import { PIXEL_FONT } from '../ui.js';

// A deliberately lightweight title-card beat between levels — not a
// reskin of StoryScene's illustrated 6-beat sequence, which would be
// disproportionate for a between-level transition with no new
// illustrated-art budget. Tap-anywhere matches StoryScene's own pattern;
// the auto-advance timer means it's never a dead end if the player
// doesn't realize to tap.
const AUTO_ADVANCE_MS = 1800;

export default class LevelIntroScene extends Phaser.Scene {
  constructor() {
    super('LevelIntro');
  }

  create(data) {
    this.level = data.level;
    this.score = data.score;
    const cfg = getLevelConfig(this.level);
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.background, 1)
      .setOrigin(0)
      .setInteractive()
      .on('pointerdown', () => this.goToGame());

    this.add.text(cx, cy - 60, `LEVEL ${this.level}`, {
      fontFamily: PIXEL_FONT,
      fontSize: '16px',
      color: '#8b84b0',
      letterSpacing: 3,
    }).setOrigin(0.5);

    this.add.text(cx, cy - 20, cfg.name, {
      fontFamily: PIXEL_FONT,
      fontSize: '30px',
      color: COLORS.hudGold,
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(cx, cy + 40, cfg.subtitle, {
      fontFamily: 'Syne, sans-serif',
      fontSize: '15px',
      color: COLORS.hudCream,
      align: 'center',
      wordWrap: { width: GAME_WIDTH - 80 },
    }).setOrigin(0.5);

    const prompt = this.add.text(cx, cy + 120, 'TAP TO CONTINUE', {
      fontFamily: 'Syne, sans-serif',
      fontSize: '11px',
      color: '#5b5480',
      letterSpacing: 1,
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });

    this.time.delayedCall(AUTO_ADVANCE_MS, () => this.goToGame());
  }

  goToGame() {
    if (this.wentToGame) return;
    this.wentToGame = true;
    this.scene.start('Game', { level: this.level, score: this.score });
  }
}
