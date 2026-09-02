import { GAME_WIDTH, GAME_HEIGHT, SAFE_TOP, COLORS } from '../config.js';
import { STORY_PAGES, STORY_BEAT_COUNT } from '../storyData.js';
import { createPixelButton, createPixelPanel, PIXEL_FONT } from '../ui.js';

const ILLUSTRATION_KEYS = {
  lab: 'story_lab',
  machine: 'story_machine',
  storm: 'story_storm',
  strike: 'story_strike',
  monsters: 'story_monsters',
  stakes: 'story_stakes',
};

const ILLUSTRATION_HEIGHT = GAME_HEIGHT * 0.62;

export default class StoryScene extends Phaser.Scene {
  constructor() {
    super('Story');
  }

  create() {
    this.pageIndex = 0;

    // Tapping anywhere advances — attached to the background itself so
    // Phaser's own hit-testing naturally routes a tap on the Skip button
    // (drawn on top, its own interactive object) to that button instead,
    // with no coordinate math needed to avoid double-handling.
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.background, 1)
      .setOrigin(0)
      .setInteractive()
      .on('pointerdown', () => this.advance());

    this.illustration = this.add.image(GAME_WIDTH / 2, ILLUSTRATION_HEIGHT / 2, ILLUSTRATION_KEYS[STORY_PAGES[0].illustration])
      .setDisplaySize(GAME_WIDTH, ILLUSTRATION_HEIGHT);

    this.flashRect = this.add.rectangle(0, 0, GAME_WIDTH, ILLUSTRATION_HEIGHT, 0xffffff, 0).setOrigin(0);

    const panelH = GAME_HEIGHT - ILLUSTRATION_HEIGHT;
    const panelY = ILLUSTRATION_HEIGHT + panelH / 2;
    createPixelPanel(this, GAME_WIDTH / 2, panelY, GAME_WIDTH - 24, panelH - 16);

    this.dialogueText = this.add.text(GAME_WIDTH / 2, panelY - 14, '', {
      fontFamily: 'Syne, sans-serif',
      fontSize: '17px',
      color: COLORS.hudCream,
      align: 'center',
      wordWrap: { width: GAME_WIDTH - 64 },
      lineSpacing: 6,
    }).setOrigin(0.5);

    this.advanceIndicator = this.add.text(GAME_WIDTH - 34, GAME_HEIGHT - 26, '▼', {
      fontFamily: PIXEL_FONT,
      fontSize: '18px',
      color: COLORS.hudGold,
    }).setOrigin(0.5);
    this.tweens.add({ targets: this.advanceIndicator, y: '+=6', duration: 500, yoyo: true, repeat: -1 });

    this.createProgressDots();

    // Sits left of the fixed kuehmachine.com account badge (top-right,
    // ~52px, independent of our canvas) rather than under it — same
    // conflict class already resolved once for the in-game pause button.
    createPixelButton(this, GAME_WIDTH - 155, SAFE_TOP - 40, 80, 40, 'SKIP', {
      fontSize: '14px',
      fillColor: 0x2a2450,
      textColor: COLORS.hudCream,
      onClick: () => this.goToGame(),
    });

    this.renderPage();
  }

  createProgressDots() {
    this.dots = [];
    const spacing = 16;
    const startX = 24;
    const y = SAFE_TOP - 40;
    for (let i = 0; i < STORY_BEAT_COUNT; i++) {
      this.dots.push(this.add.circle(startX + i * spacing, y, 4, 0xffffff, 0.25));
    }
  }

  updateProgressDots(beatIndex) {
    this.dots.forEach((dot, i) => {
      dot.setFillStyle(i <= beatIndex ? COLORS.hudGold : 0xffffff, i <= beatIndex ? 1 : 0.25);
    });
  }

  renderPage() {
    const page = STORY_PAGES[this.pageIndex];
    const key = ILLUSTRATION_KEYS[page.illustration];
    if (this.illustration.texture.key !== key) {
      this.illustration.setTexture(key);
    }
    this.dialogueText.setText(page.lines.join('\n'));
    this.updateProgressDots(page.beatIndex);

    if (page.effect === 'flash') {
      this.flashRect.setAlpha(0.9);
      this.tweens.add({ targets: this.flashRect, alpha: 0, duration: 400 });
    }
  }

  advance() {
    if (this.pageIndex + 1 < STORY_PAGES.length) {
      this.pageIndex += 1;
      this.renderPage();
    } else {
      this.goToGame();
    }
  }

  goToGame() {
    this.scene.start('Game');
  }
}
