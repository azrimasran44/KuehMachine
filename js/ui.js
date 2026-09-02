// Shared "chunky pixel button" widget: a hard-edged drop-shadow block
// behind a flat-color face, pressed by nudging the face toward its
// shadow on pointerdown — the pixel-UI equivalent of a button's
// box-shadow collapsing on click, no gradients or rounded corners.
const PIXEL_FONT = "'Pixelify Sans', sans-serif";
const BEVEL = 5;

export function createPixelButton(scene, x, y, width, height, label, opts = {}) {
  const {
    fontSize = '22px',
    fillColor = 0xffd166,
    hoverColor = fillColor,
    textColor = '#1a1330',
    shadowColor = 0x140f24,
    onClick = () => {},
  } = opts;

  const container = scene.add.container(x, y);

  const shadow = scene.add.rectangle(BEVEL, BEVEL, width, height, shadowColor, 1);
  const face = scene.add.rectangle(0, 0, width, height, fillColor, 1)
    .setInteractive({ useHandCursor: true });
  const text = scene.add.text(0, 0, label, {
    fontFamily: PIXEL_FONT,
    fontSize,
    color: textColor,
  }).setOrigin(0.5);

  container.add([shadow, face, text]);

  face.on('pointerover', () => face.setFillStyle(hoverColor));
  face.on('pointerout', () => {
    face.setFillStyle(fillColor);
    face.setPosition(0, 0);
    text.setPosition(0, 0);
  });
  face.on('pointerdown', () => {
    face.setPosition(BEVEL, BEVEL);
    text.setPosition(BEVEL, BEVEL);
    onClick();
  });
  face.on('pointerup', () => {
    face.setPosition(0, 0);
    text.setPosition(0, 0);
  });

  return container;
}

// A semi-opaque rounded panel for the story dialogue box — the one place
// in this project's UI that calls for a soft edge over the illustration
// behind it, rather than the hard-edged bevel language everything else
// uses.
export function createPixelPanel(scene, x, y, width, height, opts = {}) {
  const {
    fillColor = 0x0a0820,
    fillAlpha = 0.85,
    borderColor = 0xffffff,
    borderAlpha = 0.18,
    radius = 12,
  } = opts;

  const container = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(fillColor, fillAlpha);
  g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  g.lineStyle(2, borderColor, borderAlpha);
  g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  container.add(g);
  return container;
}

export { PIXEL_FONT };
