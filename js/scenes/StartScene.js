import { GAME_WIDTH, GAME_HEIGHT, SAFE_BOTTOM, COLORS } from '../config.js';
import { getLocalHighScoreSync, getHighScore } from '../progress.js';
import { PIXEL_FONT } from '../ui.js';
import { fitImageInto } from '../artFit.js';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('Start');
  }

  create() {
    const cx = GAME_WIDTH / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.background, 1).setOrigin(0);

    this.add.text(cx, 130, 'KUEH\nMACHINE', {
      fontFamily: PIXEL_FONT,
      fontSize: '46px',
      color: COLORS.hudGold,
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(cx, 228, 'THE GREAT REVERSE MAKAN', {
      fontFamily: PIXEL_FONT,
      fontSize: '11px',
      color: COLORS.hudCream,
      align: 'center',
    }).setOrigin(0.5);

    const scoreText = this.add.text(cx, 256, `BEST: ${getLocalHighScoreSync()}`, {
      fontFamily: PIXEL_FONT,
      fontSize: '13px',
      color: COLORS.mint,
    }).setOrigin(0.5);
    getHighScore().then((best) => scoreText.setText(`BEST: ${best}`));

    // The reference illustration is a real image (not pixel art we drew
    // ourselves), so it's shown at its own aspect ratio — "fit", not
    // stretched or cropped — with smooth filtering rather than this
    // project's usual nearest-neighbor pixel-art scaling. It already has
    // its own "TAP TO START" baked into the art, so there's no separate
    // duplicate prompt here — just a slow whole-image pulse for the
    // "sparse ambient life" touch the brief asked for.
    const zoneTop = 286;
    const zoneH = Math.min(SAFE_BOTTOM - 20, 730) - zoneTop;
    const art = fitImageInto(this, 'bg_office_night', cx, zoneTop + zoneH / 2, GAME_WIDTH - 20, zoneH);
    this.tweens.add({ targets: art, alpha: 0.88, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.text(cx, Math.min(SAFE_BOTTOM, 800), 'by Azri — part of kuehmachine.com', {
      fontFamily: 'Syne, sans-serif',
      fontSize: '11px',
      color: '#5b5480',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      if (this.sound && this.sound.context && this.sound.context.state === 'suspended') {
        this.sound.context.resume();
      }
      this.scene.start('Story');
    });
  }
}
