import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config.js';
import { createPixelButton, PIXEL_FONT } from '../ui.js';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create(data) {
    this.gameScene = data.gameScene;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0a0820, 0.82).setOrigin(0);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, 'PAUSED', {
      fontFamily: PIXEL_FONT,
      fontSize: '30px',
      color: COLORS.hudGold,
    }).setOrigin(0.5);

    createPixelButton(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, 200, 60, 'RESUME', {
      fontSize: '20px',
      onClick: () => {
        this.gameScene.resumeGame();
        this.scene.stop();
      },
    });
  }
}
