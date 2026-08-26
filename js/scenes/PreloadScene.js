export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.load.image('player', 'assets/sprites/player.png');
    this.load.image('angkukueh', 'assets/sprites/angkukueh.png');
    this.load.image('ondehondeh', 'assets/sprites/ondehondeh.png');
    this.load.image('machine', 'assets/sprites/machine.png');
    this.load.image('tile', 'assets/sprites/tile.png');
    this.load.image('car', 'assets/sprites/car.png');
  }

  create() {
    this.scene.start('Menu');
  }
}
