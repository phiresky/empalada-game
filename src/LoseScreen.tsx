import { Container } from "pixi.js";
import { App } from "./App";
import { Text } from "pixi.js";
export class LoseScreen {
  container: Container;
  constructor(app: App) {
    this.container = new Container();
    app.mainContainer.addChild(this.container);

    const title = new Text({
      text: "You Lose",
      style: {
        align: "center",
        fontFamily: "Graveyard BRK",
        fontSize: 180,
        fill: 9610385,
      },
    });
    title.pivot.x = title.width / 2;
    title.pivot.y = title.height / 2;
    title.position.x = app.screen.width / 2;
    title.position.y = app.screen.height / 2;
    this.container.addChild(title);
  }

  destroy() {
    this.container.destroy();
  }
}
