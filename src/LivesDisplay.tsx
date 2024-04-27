import { Container, Sprite } from "pixi.js";
import { Game } from "./Game";
import { Layout } from "@pixi/layout";

export class LivesDisplay {
  layout: Layout | null = null;
  constructor(private game: Game, lives: number) {
    new Container().initLayout;
    this.updateLives(lives);
  }
  updateLives(lives: number) {
    if (this.layout) this.layout.destroy();
    const content = Array.from({ length: lives }).map(
      () => new Sprite(this.game.app.textures.heart)
    );
    this.layout = new Layout({ content, styles: { maxWidth: "100%" } });
    this.layout.resize(240, 100);
    this.layout.x = 150;
    this.layout.y = 150;
    this.game.addChild(this.layout);
  }
}
