import { Container, Point, Sprite, Ticker } from "pixi.js";
import { WIDTH, HEIGHT } from "./App";
import { Game } from "./Game";

export class Zombie {
  static zombies: Zombie[] = [];
  container: Container;
  ticker: Ticker;
  type: "zombie" | "doggo" = Math.random() > 0.5 ? "zombie" : "doggo";
  speed = this.type === "zombie" ? 1 : 2;
  nextSound: number = 0;
  soundInterval = [3000, 10000];
  sound: HTMLAudioElement | null = null;
  constructor(private game: Game) {
    this.container = new Container();
    this.updateNextSound();
    Zombie.zombies.push(this);
    game.addChild(this.container);
    const zombie = new Sprite(game.app.textures[this.type]);
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
        if (this.type === "doggo") {
          zombie.position = zombie.position.add(
            new Point(
              Math.cos(performance.now() / 60) * 1,
              Math.sin(performance.now() / 100) * 2
            )
          );
        } else if (this.type === "zombie") {
          zombie.position = zombie.position.add(
            new Point(
              Math.cos(performance.now() / 24) * 2,
              Math.sin(performance.now() / 10) * 2
            )
          );
        }
      }
      // move zombie towards main shovel container
      const direction = game.mainShovelPosition.subtract(
        this.container.position
      );
      this.container.position = this.container.position.add(
        direction.normalize().multiplyScalar(this.speed * time.deltaTime)
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
    const textures = this.game.app.textures;
    if (this.type === "doggo") {
      const sound =
        Math.random() > 0.33
          ? textures.woof1
          : Math.random() > 0.33
          ? textures.woof2
          : textures.woof3;
      this.sound = sound;
      sound.volume = 0.3;
      sound.play();
    } else if (this.type === "zombie") {
      const sound =
        Math.random() > 0.33
          ? textures.grunt1
          : Math.random() > 0.33
          ? textures.grunt2
          : textures.grunt3;
      this.sound = sound;
      sound.volume = 0.3;
      sound.play();
    }
  }
  updateNextSound() {
    this.nextSound =
      performance.now() +
      Math.random() * (this.soundInterval[1] - this.soundInterval[0]) +
      this.soundInterval[0];
  }
  destroy() {
    this.container.destroy();
    this.ticker.destroy();
    Zombie.zombies.splice(Zombie.zombies.indexOf(this), 1);
    this.game.stats.killed += 1;
  }
}
