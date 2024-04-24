import {
  Application,
  Assets,
  Container,
  Graphics,
  Point,
  Rectangle,
  Sprite,
  Texture,
  Ticker,
} from "pixi.js";
import "pixi.js/math-extras";
import "./index.css";
import { doPolygonsIntersect } from "./util";

const WIDTH = 1920;
const HEIGHT = 1080;

async function loadTextures() {
  return {
    shovel: await Assets.load<Texture>("./shovel.png"),
    zombie: await Assets.load<Texture>("./zombie.png"),
    frame: await Assets.load<Texture>("./frame.png"),
    doggo: await Assets.load<Texture>("./doggo.png"),
  };
}
export class Game {
  textures!: Awaited<ReturnType<typeof loadTextures>>;
  mainContainer!: Container;
  app!: Application;
  mainShovel!: Container | null;
  mainShovelPosition = new Point(WIDTH / 2, HEIGHT);
  async init() {
    this.textures = await loadTextures();
    // Create a new application
    const app = new Application();
    this.app = app;
    Object.assign(globalThis, { __PIXI_APP__: app });

    // Initialize the application
    await app.init({
      background: "#000000",
      resizeTo: window,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    this.mainContainer = new Container({});
    this.mainContainer.mask = new Graphics()
      .rect(0, 0, WIDTH, HEIGHT)
      .fill(0xffffff);
    this.mainContainer.addChild(this.mainContainer.mask);
    const graphics = new Graphics({ width: WIDTH, height: HEIGHT });
    graphics.rect(0, 0, WIDTH, HEIGHT);
    graphics.fill(0xffffff);
    this.mainContainer.addChild(graphics);
    this.updateSizes();
    // Create and add a container to the stage

    app.stage.addChild(this.mainContainer);
    const frame = new Sprite(this.textures.frame);
    frame.zIndex = 999999;
    this.mainContainer.addChild(frame);

    this.mainShovel = this.newShovel();
    new Zombie(this);
    setInterval(() => new Zombie(this), 2000);

    let direction = "left" as "left" | "right";

    // Listen for animate update
    app.ticker.add((time) => {
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
    app.renderer.on("resize", this.updateSizes.bind(this));
    let isFirst = true;
    function doFullscreen() {
      if (isFirst) {
        document.body.requestFullscreen({ navigationUI: "hide" });
        try {
          if ("lock" in screen.orientation)
            (screen.orientation.lock as (x: string) => void)("landscape");
        } catch (e) {
          console.error(e);
        }
        isFirst = false;
      }
    }
    window.addEventListener("mousedown", (e) => {
      doFullscreen();
      this.shootShovel();
    });
    window.addEventListener("keydown", (e) => {
      doFullscreen();
      console.log("keydown", e.key);
      if (e.key === " ") {
        this.shootShovel();
      }
    });
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
    this.mainContainer.addChild(shovelContainer);

    const throwShovel = new Sprite(this.textures.shovel);
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

  private updateSizes() {
    const actualWidth = () => {
      const { width, height } = this.app.screen;
      const isWidthConstrained = width < (height * 16) / 9;
      return isWidthConstrained ? width : (height * 16) / 9;
    };

    const actualHeight = () => {
      const { width, height } = this.app.screen;
      const isHeightConstrained = (width * 9) / 16 > height;
      return isHeightConstrained ? height : (width * 9) / 16;
    };
    this.mainContainer.scale.x = actualWidth() / WIDTH;
    this.mainContainer.scale.y = actualHeight() / HEIGHT;
    this.mainContainer.x = this.app.screen.width / 2 - actualWidth() / 2;
    this.mainContainer.y = this.app.screen.height / 2 - actualHeight() / 2;
  }
}
class Zombie {
  static zombies: Zombie[] = [];
  container: Container;
  ticker: Ticker;
  type: "zombie" | "doggo" = Math.random() > 0.5 ? "zombie" : "doggo";
  constructor(game: Game) {
    this.container = new Container();
    Zombie.zombies.push(this);
    game.mainContainer.addChild(this.container);
    const zombie = new Sprite(game.textures[this.type]);
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
      // move zombie towards main shovel container
      const direction = game.mainShovelPosition.subtract(
        this.container.position
      );
      this.container.position = this.container.position.add(
        direction.normalize().multiplyScalar(1 * time.deltaTime)
      );
    });
    this.ticker.start();
  }
  destroy() {
    this.container.destroy();
    this.ticker.destroy();
    Zombie.zombies.splice(Zombie.zombies.indexOf(this), 1);
  }
}
function collision(zombie: Container, shovel: Container): boolean {
  const b = shovel.getLocalBounds();
  const shovelCornersLocal = [
    new Point(b.x, b.y),
    new Point(b.x + b.width, b.y),
    new Point(b.x + b.width, b.y + b.height),
    new Point(b.x, b.y + b.height),
  ];
  const matrix = shovel.worldTransform.append(zombie.worldTransform.invert()); //shovel.worldTransform.append(zombie.worldTransform.invert());
  // return zombie.getLocalBounds().rectangle.intersects(b.rectangle, matrix);
  const zombieHitBox = new Rectangle(
    -zombie.width / 4,
    -zombie.height / 4,
    zombie.width / 2,
    zombie.height / 2
  );
  // corners
  const corners = [
    new Point(zombieHitBox.x, zombieHitBox.y),
    new Point(zombieHitBox.x + zombieHitBox.width, zombieHitBox.y),
    new Point(
      zombieHitBox.x + zombieHitBox.width,
      zombieHitBox.y + zombieHitBox.height
    ),
    new Point(zombieHitBox.x, zombieHitBox.y + zombieHitBox.height),
  ];
  const cornersGlobal = corners.map((p) => zombie.toGlobal(p));
  return doPolygonsIntersect(
    cornersGlobal,
    shovelCornersLocal.map((p) => shovel.toGlobal(p))
  );

  /* const boundPointsGlobal = boundPointsLocal.map((p) =>
    zombie.toLocal(p, shovel)
  );
  /* const p = new Graphics();
  p.poly(boundPointsGlobal);
  p.stroke(0x00ff66);
  zombie.addChild(p);
  const hitbox = zombie.getLocalBounds();
  zombie.globalTransform

  // hitbox.x;
  if (boundPointsGlobal.some((p) => hitbox.containsPoint(p.x, p.y)))
    return true;
  return false;*/
}
