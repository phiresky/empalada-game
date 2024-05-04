import { Application, Container, Graphics, Point, Rectangle } from "pixi.js";
import "pixi.js/math-extras";
import "./index.css";
import { doPolygonsIntersect } from "./util";
import { TitleScreen } from "./TitleScreen";
import { Game } from "./Game";
import { LoseScreen } from "./LoseScreen";
import { Assets, loadAssets } from "./assets";

export const WIDTH = 1920;
export const HEIGHT = 1080;

export class App {
  assets!: Assets;
  mainContainer!: Container;
  app!: Application;
  screen = { width: WIDTH, height: HEIGHT };
  currentScreen: Game | TitleScreen | LoseScreen | null = null;
  async init() {
    this.assets = await loadAssets();
    /*document.fonts.add(
      new FontFace("Graveyard BRK", "./GraveyardBrk-geLq.woff2")
    );*/
    console.log("fo", await document.fonts.load("10px Graveyard BRK"));
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

    app.renderer.on("resize", this.updateSizes.bind(this));

    /*window.addEventListener("mousedown", (e) => {
      doFullscreen();
    });
    window.addEventListener("keydown", (e) => {
      doFullscreen();
    });*/
    this.currentScreen = new TitleScreen(this);
  }
  startGame() {
    if (this.currentScreen) this.currentScreen.destroy();
    this.currentScreen = new Game(this);
  }
  gameOver(stats: { killed: number }) {
    if (this.currentScreen) this.currentScreen.destroy();
    this.currentScreen = new TitleScreen(this, {
      titleText: "You Lose",
      subtitleText: `You shoveled ${stats.killed} zombies`,
    });
  }

  goFullscreen() {
    document.body.requestFullscreen({ navigationUI: "hide" });
    try {
      if ("lock" in screen.orientation)
        (screen.orientation.lock as (x: string) => void)("landscape");
    } catch (e) {
      console.error(e);
    }
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

export function collision(zombie: Container, shovel: Container): boolean {
  const b = shovel.getLocalBounds();
  const shovelCornersLocal = [
    new Point(b.x, b.y),
    new Point(b.x + b.width, b.y),
    new Point(b.x + b.width, b.y + b.height),
    new Point(b.x, b.y + b.height),
  ];
  // const matrix = shovel.worldTransform.append(zombie.worldTransform.invert()); //shovel.worldTransform.append(zombie.worldTransform.invert());
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
