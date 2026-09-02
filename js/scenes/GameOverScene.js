import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config.js';
import { createPixelButton, PIXEL_FONT } from '../ui.js';

const CAR_TAUNTS = [
  'Come back, human! We haven’t had dessert yet!',
  'You eat me before. Now my turn!',
  'Don’t run! I’m only slightly chewy!',
];

const CAUGHT_TAUNTS = [
  'Standing still? Rude. We were starving.',
  'Dawdling is how dessert happens.',
  'You had one job: keep walking.',
];

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data) {
    const { result, score, cause } = data;
    const cx = GAME_WIDTH / 2;
    const won = result === 'win';

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.background, 1).setOrigin(0);

    this.add.text(cx, 220, won ? 'YOU MADE IT!' : 'SAMPLED.', {
      fontFamily: PIXEL_FONT,
      fontSize: '34px',
      color: won ? COLORS.mint : COLORS.danger,
      align: 'center',
    }).setOrigin(0.5);

    const subtitle = won
      ? 'The Machine hums quietly. For now.'
      : Phaser.Utils.Array.GetRandom(cause === 'caught' ? CAUGHT_TAUNTS : CAR_TAUNTS);

    this.add.text(cx, 280, subtitle, {
      fontFamily: 'Syne, sans-serif',
      fontSize: '15px',
      color: '#cfc9e8',
      align: 'center',
      wordWrap: { width: 300 },
    }).setOrigin(0.5);

    this.add.text(cx, 380, `ROWS CROSSED: ${score}`, {
      fontFamily: PIXEL_FONT,
      fontSize: '18px',
      color: COLORS.hudGold,
    }).setOrigin(0.5);

    createPixelButton(this, cx, 500, 240, 68, 'RETRY', {
      fontSize: '26px',
      onClick: () => this.scene.start('Game'),
    });

    const menuBtn = this.add.text(cx, 590, 'BACK TO MENU', {
      fontFamily: 'Syne, sans-serif',
      fontSize: '13px',
      color: '#8b84b0',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => this.scene.start('Start'));
  }
}
