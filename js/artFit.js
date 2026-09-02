// Real reference photos/illustrations (as opposed to the pixel art we
// draw ourselves) are shown "contain"-fit — scaled to fit entirely
// within a box, preserving their native aspect ratio, never cropped or
// stretched — with smooth (linear) texture filtering overriding this
// project's global pixelArt:true default, which would otherwise make a
// detailed photo scale with harsh nearest-neighbor blockiness.
export function fitImageInto(scene, key, cx, cy, maxW, maxH) {
  const image = scene.add.image(cx, cy, key);
  image.setTexture(key); // ensure the frame is resolved before reading native size
  const scale = Math.min(maxW / image.width, maxH / image.height);
  image.setDisplaySize(image.width * scale, image.height * scale);
  image.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
  return image;
}
