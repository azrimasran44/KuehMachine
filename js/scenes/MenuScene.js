import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config.js';
import { getLocalHighScoreSync, getHighScore } from '../progress.js';
import { createPixelButton, PIXEL_FONT } from '../ui.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const cx = GAME_WIDTH / 2;

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.background, 1).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT * 0.5);
      bg.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.08, 0.4));
      bg.fillRect(x, y, 2, 2);
    }

    this.add.text(cx, 150, 'KUEH\nMACHINE', {
      fontFamily: PIXEL_FONT,
      fontSize: '52px',
      color: COLORS.hudGold,
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(cx, 262, 'THE GREAT REVERSE MAKAN', {
      fontFamily: PIXEL_FONT,
      fontSize: '13px',
      color: COLORS.hudCream,
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(cx, 340,
      'Midnight in Singapore. Every kueh the\nMachine ever scanned just woke up hungry.\n\nCross the void deck. Reach the Machine.\nDo not become dessert.', {
      fontFamily: 'Syne, sans-serif',
      fontSize: '15px',
      color: '#cfc9e8',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);

    const scoreText = this.add.text(cx, 480, `BEST: ${getLocalHighScoreSync()}`, {
      fontFamily: PIXEL_FONT,
      fontSize: '18px',
      color: COLORS.mint,
    }).setOrigin(0.5);

    getHighScore().then((best) => scoreText.setText(`BEST: ${best}`));

    createPixelButton(this, cx, 590, 220, 64, 'START', {
      fontSize: '24px',
      onClick: () => {
        if (this.sound && this.sound.context && this.sound.context.state === 'suspended') {
          this.sound.context.resume();
        }
        this.scene.start('Game');
      },
    });

    this.add.text(cx, 690, 'Swipe or use arrow keys / WASD —\none tile per move.', {
      fontFamily: 'Syne, sans-serif',
      fontSize: '12px',
      color: '#8b84b0',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(cx, GAME_HEIGHT - 90, 'by Azri — part of kuehmachine.com', {
      fontFamily: 'Syne, sans-serif',
      fontSize: '11px',
      color: '#5b5480',
    }).setOrigin(0.5);
  }
}
