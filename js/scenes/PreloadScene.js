export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.load.image('player', 'assets/sprites/leonard.png');
    this.load.image('angkukueh', 'assets/sprites/angkukueh.png');
    this.load.image('ondehondeh', 'assets/sprites/ondehondeh.png');
    this.load.image('machine', 'assets/sprites/machine.png');
    this.load.image('tile', 'assets/sprites/tile.png');
    this.load.image('road', 'assets/sprites/road.png');
    this.load.image('car', 'assets/sprites/car.png');

    this.load.image('bg_office_night', 'assets/sprites/bg_office_night.png');
    this.load.image('beat1', 'assets/sprites/beat1.png');
    this.load.image('beat2', 'assets/sprites/beat2.png');
    this.load.image('beat3', 'assets/sprites/beat3.png');
    this.load.image('beat4', 'assets/sprites/beat4.png');
    this.load.image('beat5', 'assets/sprites/beat5.png');
    this.load.image('beat6', 'assets/sprites/beat6.png');
    this.load.image('textbox', 'assets/sprites/textbox.png');
  }

  create() {
    this.scene.start('Start');
  }
}
