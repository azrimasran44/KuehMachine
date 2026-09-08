import { GAME_WIDTH, GAME_HEIGHT, SAFE_BOTTOM, COLORS } from '../config.js';
import { getLocalHighScoreSync, getHighScore } from '../progress.js';
import { PIXEL_FONT } from '../ui.js';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('Start');
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.background, 1).setOrigin(0);

    // Full-bleed looping hero video. This is the very first screen a
    // player ever sees, reached before any tap or gesture at all — every
    // major browser silently blocks autoplay unless the video is muted
    // (and inline, or iOS Safari forces it fullscreen instead).
    // Starts invisible and fades in slightly after playback begins —
    // video decoders can throw a garbled/corrupted frame or two while
    // warming up on the very first frames, and holding it hidden for a
    // beat covers that regardless of the exact cause, while also just
    // reading as a nicer, deliberate fade-in rather than a hard pop-in.
    const video = this.add.video(cx, cy, 'heroVideo').setOrigin(0.5).setAlpha(0);
    // The GameObject's real width/height aren't known synchronously at
    // creation — Phaser fires 'created' once the video's actual texture
    // dimensions are established, and sizing before that (e.g. reading
    // video.width immediately) picks up a placeholder value instead.
    video.once('created', () => {
      // Cover-fit rather than contain — the video's own aspect ratio
      // (roughly 9:16) doesn't exactly match our 390:844 design ratio,
      // so this crops a little off the sides rather than letterboxing.
      const scale = Math.max(GAME_WIDTH / video.width, GAME_HEIGHT / video.height);
      video.setDisplaySize(video.width * scale, video.height * scale);
    });
    video.video.muted = true;
    video.video.playsInline = true;
    video.play(true);
    this.tweens.add({ targets: video, alpha: 1, duration: 300, delay: 200, ease: 'Sine.easeOut' });

    // The video already carries its own title reveal ("RUN KUEH RUN")
    // and its own "TAP TO START" prompt baked in, appearing partway into
    // the loop and holding — same "don't duplicate what's already in the
    // art" call this screen made for the previous static illustration.
    // Only the genuinely dynamic bits (the score, the credit) get their
    // own text here, kept out of the way at the very top and bottom.
    this.add.graphics()
      .fillGradientStyle(0x0a0820, 0x0a0820, 0x0a0820, 0x0a0820, 0.7, 0.7, 0, 0)
      .fillRect(0, 0, GAME_WIDTH, 90);
    this.add.graphics()
      .fillGradientStyle(0x0a0820, 0x0a0820, 0x0a0820, 0x0a0820, 0, 0, 0.7, 0.7)
      .fillRect(0, GAME_HEIGHT - 90, GAME_WIDTH, 90);

    const scoreText = this.add.text(cx, 40, `BEST: ${getLocalHighScoreSync()}`, {
      fontFamily: PIXEL_FONT,
      fontSize: '13px',
      color: COLORS.mint,
    }).setOrigin(0.5);
    getHighScore().then((best) => scoreText.setText(`BEST: ${best}`));

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
