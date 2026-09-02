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
    this.load.image('story_lab', 'assets/sprites/story_lab.png');
    this.load.image('story_storm', 'assets/sprites/story_storm.png');
    this.load.image('story_strike', 'assets/sprites/story_strike.png');
    this.load.image('story_monsters', 'assets/sprites/story_monsters.png');
  }

  create() {
    this.scene.start('Start');
  }
}
