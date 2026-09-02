import { GAME_WIDTH, GAME_HEIGHT, SAFE_BOTTOM, COLORS } from '../config.js';
import { getLocalHighScoreSync, getHighScore } from '../progress.js';
import { PIXEL_FONT } from '../ui.js';

// bg_office_night.png is a 288x360 (48x60 logical grid, 6x scale) pixel
// illustration. These are pixel-space hotspots inside that file — the
// lightning bolt near the rooftop machine, and two of the windows the
// generator happened to light — used to place flicker overlays that
// track wherever the illustration is actually drawn on screen.
const ART_SIZE = { w: 288, h: 360 };
const LIGHTNING_SPOT = { x: 144, y: 36 };
// Windows are drawn 1x2 logical units (6x12px) starting at these
// corners in the generator script — offset to their centers so the
// glow overlay sits directly on top instead of up-and-left of it.
const WINDOW_SPOTS = [{ x: 69, y: 120 }, { x: 141, y: 120 }];

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

    // Illustration, scaled to fill most of the width while leaving the
    // bottom safe zone clear for the tap prompt.
    const displayW = 320;
    const displayH = displayW * (ART_SIZE.h / ART_SIZE.w);
    const artX = (GAME_WIDTH - displayW) / 2;
    const artY = 288;
    const scale = displayW / ART_SIZE.w;

    this.add.image(artX + displayW / 2, artY + displayH / 2, 'bg_office_night')
      .setDisplaySize(displayW, displayH);

    const toScreen = (spot) => ({
      x: artX + spot.x * scale,
      y: artY + spot.y * scale,
    });

    // Sparse ambient flicker — a static illustration with a little life,
    // not a full animation.
    const lightningSpot = toScreen(LIGHTNING_SPOT);
    const lightningFlicker = this.add.rectangle(lightningSpot.x, lightningSpot.y, 18, 40, 0xffffff, 0)
      .setBlendMode(Phaser.BlendModes.ADD);
    const scheduleFlicker = () => {
      this.tweens.add({
        targets: lightningFlicker,
        alpha: { from: 0, to: 0.55 },
        duration: 70,
        yoyo: true,
        repeat: 2,
        repeatDelay: 60,
        onComplete: () => this.time.delayedCall(Phaser.Math.Between(2500, 5000), scheduleFlicker),
      });
    };
    scheduleFlicker();

    WINDOW_SPOTS.forEach((spot, i) => {
      const p = toScreen(spot);
      const glow = this.add.rectangle(p.x, p.y, 8, 13, 0xffe9b0, 0.9);
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.9, to: 0.25 },
        duration: 900 + i * 300,
        yoyo: true,
        repeat: -1,
        repeatDelay: Phaser.Math.Between(400, 1200),
      });
    });

    const promptY = Math.min(SAFE_BOTTOM - 30, 720);
    const prompt = this.add.text(cx, promptY, 'TAP TO START', {
      fontFamily: PIXEL_FONT,
      fontSize: '20px',
      color: COLORS.hudCream,
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.15, duration: 650, yoyo: true, repeat: -1 });

    this.add.text(cx, Math.min(SAFE_BOTTOM, 748), 'by Azri — part of kuehmachine.com', {
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
