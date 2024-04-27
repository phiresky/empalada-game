import { Container, Graphics, Text } from "pixi.js";
import { ButtonContainer } from "@pixi/ui";
import { App, WIDTH, HEIGHT } from "./App";

export class TitleScreen {
  container: Container;
  currentY: number = HEIGHT / 2;
  constructor(
    private app: App,
    {
      titleText = "Empalada",
      subtitleText = "Graveyard Shift",
    }: { titleText?: string; subtitleText?: string } = {}
  ) {
    this.container = new Container();
    app.mainContainer.addChild(this.container);

    const title = new Text({
      text: titleText,
      style: {
        align: "center",
        fontFamily: "Graveyard BRK",
        fontSize: 180,
        fill: 9610385,
      },
    });
    title.pivot.x = title.width / 2;
    title.pivot.y = title.height / 2;
    title.position.x = WIDTH / 2;
    title.position.y = HEIGHT / 4;
    this.container.addChild(title);
    const subtitle = new Text({
      text: subtitleText,
      style: {
        align: "center",
        fontFamily: "Graveyard BRK",
        fontSize: 80,
        fill: 9610385,
      },
    });
    subtitle.pivot.x = subtitle.width / 2;
    subtitle.pivot.y = subtitle.height / 2;
    subtitle.position.x = WIDTH / 2;
    subtitle.position.y =
      title.position.y + title.height / 2 + subtitle.height / 2;
    this.container.addChild(subtitle);

    this.addButton("Start Game", () => this.app.startGame());
    this.addButton("Fullscreen", () => this.app.goFullscreen());
  }
  destroy() {
    this.container.destroy();
  }
  addButton(text: string, callback: () => void) {
    const button = new ButtonContainer(
      new Graphics().roundRect(-200, -80, 400, 160, 15).fill(2436397)
    );
    const btnText = new Text({
      text,
      style: {
        align: "center",
        fontFamily: "Graveyard BRK",
        fontSize: 100,
        fill: 12437176,
      },
    });
    btnText.pivot.x = btnText.width / 2;
    btnText.pivot.y = btnText.height / 2;
    button.addChild(btnText);
    // button.pivot.x = button.width / 2;
    // button.pivot.y = button.height / 2;
    button.x = WIDTH / 2;
    button.y = this.currentY;
    this.currentY += button.height * 1.2;
    this.container.addChild(button);
    button.onPress.connect(callback);
  }
}
