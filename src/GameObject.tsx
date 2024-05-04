import { Container, Ticker } from "pixi.js";
import { Game } from "./Game";

export abstract class GameObject {
  container: Container;
  constructor(protected game: Game) {
    this.onUpdate = this.onUpdate.bind(this);
    this.game.inGameTicker.add(this.onUpdate);
    this.container = new Container();
    this.game.addChild(this.container);
  }

  onUpdate(_time: Ticker) {}

  abstract onDestroy(): void;
  destroy() {
    this.game.inGameTicker.remove(this.onUpdate);
    this.onDestroy();
    this.container.destroy();
  }
}
