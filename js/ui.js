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

export { PIXEL_FONT };
