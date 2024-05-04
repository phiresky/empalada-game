import { Container, Point, Sprite, Texture, Ticker } from "pixi.js";
import { WIDTH, HEIGHT } from "./App";
import { Game } from "./Game";
import { Assets } from "./assets";

type EnemyConfig = {
  name: string;
  texture: (a: Assets) => Texture;
  moveSpeed: number;
  lootValue: number;
  health: number;
  vibration: (time: number) => Point;
  gruntSounds: (a: Assets) => HTMLAudioElement[];
  deathSounds: (a: Assets) => HTMLAudioElement[];
  deathTexture: (a: Assets) => Texture[];
};
const deathSounds = (a: Assets) => [a.death1, a.death2];
const enemies: EnemyConfig[] = [
  {
    name: "Zombie",
    texture: (a: Assets) => a.zombie,
    moveSpeed: 1,
    lootValue: 1,
    health: 1,
    vibration: (time) =>
      new Point(Math.cos(time / 24) * 2, Math.sin(time / 10) * 2),
    gruntSounds: (a) => [a.grunt1, a.grunt2, a.grunt3],
    deathSounds,
    deathTexture: (a) => [a.zombie],
  },
  {
    name: "Doggo",
    texture: (a: Assets) => a.doggo,
    moveSpeed: 2,
    lootValue: 2,
    health: 1,
    vibration: (time) =>
      new Point(Math.cos(time / 60) * 1, Math.sin(time / 100) * 2),
    gruntSounds: (a) => [a.woof1, a.woof2, a.woof3],
    deathSounds,
    deathTexture: (a) => [a.doggo],
  },
  {
    name: "Tortuga",
    texture: (a: Assets) => a.tortuga,
    moveSpeed: 0.5,
    lootValue: 2,
    health: 3,
    vibration: (time) =>
      new Point(Math.cos(time / 24) * 2, Math.sin(time / 10) * 2),
    gruntSounds: (a) => [a.tortuga1, a.tortuga2, a.tortuga3],
    deathSounds,
    deathTexture: (a) => [a.tortuga],
  },
];
export class Zombie {
  static zombies: Zombie[] = [];
  container: Container;
  ticker: Ticker;
  config: EnemyConfig;
  nextSound: number = 0;
  soundInterval = [3000, 10000];
  sound: HTMLAudioElement | null = null;
  health: number;
  constructor(private game: Game) {
    this.container = new Container();
    this.config = enemies[Math.floor(Math.random() * enemies.length)];
    this.health = this.config.health;
    this.updateNextSound();
    Zombie.zombies.push(this);
    game.addChild(this.container);
    const zombie = new Sprite(this.config.texture(game.app.assets));
    zombie.scale.x = 0.5;
    zombie.scale.y = 0.5;
    zombie.pivot.x = zombie.width / zombie.scale.x / 2;
    zombie.pivot.y = zombie.height / zombie.scale.y / 2;
    let position: Point;
    const positionLinear = Math.random() * (WIDTH + HEIGHT * 2);
    if (positionLinear < HEIGHT) {
      position = new Point(-zombie.width / 2, positionLinear);
    } else if (positionLinear < HEIGHT + WIDTH) {
      position = new Point(positionLinear - HEIGHT, -zombie.height / 2);
    } else {
      position = new Point(
        WIDTH + zombie.width / 2,
        positionLinear - HEIGHT - WIDTH
      );
    }
    this.container.position = position;
    if (position.x < WIDTH / 2) {
      // flip sprite
      zombie.scale.x *= -1;
    }
    this.container.addChild(zombie);
    this.ticker = new Ticker().add((time) => {
      if (this.nextSound < performance.now()) {
        this.playSound();
      }
      if (this.sound && !this.sound.ended) {
        zombie.position = zombie.position.add(
          this.config.vibration(performance.now())
        );
      }
      // move zombie towards main shovel container
      const direction = game.mainShovelPosition.subtract(
        this.container.position
      );
      this.container.position = this.container.position.add(
        direction
          .normalize()
          .multiplyScalar(this.config.moveSpeed * time.deltaTime)
      );
      // check shovel hitbox
      const zombieSize = (zombie.width + zombie.height) / 2 / 2;
      if (
        this.container.position
          .subtract(this.game.mainShovelPosition)
          .magnitude() <
        this.game.shovelHitbox + zombieSize
      ) {
        this.destroy();
        this.game.loseLife();
      }
    });
    this.ticker.start();
  }
  playSound() {
    this.updateNextSound();
    const textures = this.game.app.assets;
    const sounds = this.config.gruntSounds(textures);
    const sound = sounds[Math.floor(Math.random() * sounds.length)];
    if (sound) {
      sound.volume = 0.3;
      sound.play();
    }
    this.sound = sound;
  }
  updateNextSound() {
    this.nextSound =
      performance.now() +
      Math.random() * (this.soundInterval[1] - this.soundInterval[0]) +
      this.soundInterval[0];
  }
  hit(hp: number) {
    this.health -= hp;
    this.playDeathSound();
    if (this.health <= 0) this.destroy();
  }
  playDeathSound() {
    const sounds = this.config.deathSounds(this.game.app.assets);
    sounds[Math.floor(Math.random() * sounds.length)].play();
  }
  destroy() {
    const position = this.container.position;
    {
      const deathTextures = this.config.deathTexture(this.game.app.assets);
      const deathTexture =
        deathTextures[Math.floor(Math.random() * deathTextures.length)];
      if (deathTexture) {
        const deathSprite = new Sprite(deathTexture);
        deathSprite.pivot.x = deathSprite.width / 2;
        deathSprite.pivot.y = deathSprite.height / 4;
        deathSprite.scale.y = -0.25;
        deathSprite.scale.x = 0.5;
        deathSprite.x = this.container.x;
        deathSprite.y = this.container.y;
        this.game.destroyedEnemies.addChild(deathSprite);
      }
    }
    this.container.destroy();
    this.ticker.destroy();
    Zombie.zombies.splice(Zombie.zombies.indexOf(this), 1);
    this.game.stats.killed += 1;

    this.game.increaseMoney(this.config.lootValue, position);
  }
}
