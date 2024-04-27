import { Container, Graphics, Point, Sprite, Ticker } from "pixi.js";
import { Zombie } from "./Zombie";
import { WIDTH, HEIGHT, App, collision } from "./App";
import { LivesDisplay } from "./LivesDisplay";

export class Game {
  container: Container;
  ticker: Ticker;
  mainShovel!: Container | null;
  mainShovelPosition = new Point(WIDTH / 2, HEIGHT);
  shovelHitbox = 200;
  livesDisplay: LivesDisplay;
  lives = 1;
  stats = {
    killed: 0,
  };
  constructor(public app: App) {
    this.container = new Container();
    app.mainContainer.addChild(this.container);
    this.livesDisplay = new LivesDisplay(this, this.lives);
    const frame = new Sprite(app.textures.frame);
    frame.zIndex = 10;
    this.addChild(frame);
    this.drawShovelFrame();

    this.mainShovel = this.newShovel();
    new Zombie(this);

    let direction = "left" as "left" | "right";
    this.ticker = new Ticker();
    this.ticker.start();
    let timePassed = 0;
    // Listen for animate update
    this.ticker.add((time) => {
      timePassed += time.elapsedMS;
      if (timePassed > 2000) {
        new Zombie(this);
        timePassed = 0;
      }
      if (!this.mainShovel) return;
      // Continuously rotate the container!
      // * use delta to create frame-independent transform *
      if (this.mainShovel.rotation >= Math.PI * 1.5) {
        direction = "left";
      }
      if (this.mainShovel.rotation <= Math.PI / 2) {
        direction = "right";
      }
      this.mainShovel.rotation +=
        (direction === "left" ? -1 : +1) * 0.03 * time.deltaTime;
    });
    window.addEventListener("mousedown", (e) => {
      this.shootShovel();
    });
    window.addEventListener("keydown", (e) => {
      console.log("keydown", e.key);
      if (e.key === " ") {
        this.shootShovel();
      }
    });
  }
  loseLife() {
    console.log("lose life");
    this.lives--;
    this.livesDisplay.updateLives(this.lives);
    if (this.lives === 0) {
      this.app.gameOver(this.stats);
    }
  }
  /** draw a circle around the shovel area */
  drawShovelFrame() {
    const graphics = new Graphics();
    graphics
      .circle(
        this.mainShovelPosition.x,
        this.mainShovelPosition.y,
        this.shovelHitbox
      )
      .stroke(0x000000);
    this.addChild(graphics);
  }
  destroy() {
    this.container.destroy();
    this.ticker.destroy();
  }
  addChild(child: Container) {
    this.container.addChild(child);
  }
  shootShovel() {
    if (!this.mainShovel) return;
    const rotation = this.mainShovel.rotation;
    const shovel = this.mainShovel;
    this.mainShovel = null;
    setTimeout(() => {
      this.mainShovel = this.newShovel();
      this.mainShovel.rotation = rotation;
    }, 500);
    const child = shovel.children[0];
    const ticker = new Ticker().add((time) => {
      child.y += 10 * time.deltaTime;
      if (child.y > WIDTH) {
        ticker.destroy();
        shovel.destroy();
      }
      for (const zombie of Zombie.zombies) {
        if (collision(zombie.container, child)) {
          ticker.started && ticker.destroy();
          shovel.destroy();
          zombie.destroy();
        }
      }
    });
    ticker.start();
  }
  private newShovel(rotation = Math.PI) {
    const shovelContainer = new Container();
    this.addChild(shovelContainer);

    const throwShovel = new Sprite(this.app.textures.shovel);
    throwShovel.scale.x = 0.3;
    throwShovel.scale.y = 0.3;
    shovelContainer.addChild(throwShovel);

    // Move the container to the center
    shovelContainer.x = WIDTH / 2;
    shovelContainer.y = HEIGHT;
    shovelContainer.pivot.x = shovelContainer.width / 2; // (container.scale.x * container.width) / 2;
    shovelContainer.pivot.y = 0; //container.height / 2;
    shovelContainer.rotation = rotation;
    return shovelContainer;
  }
}
