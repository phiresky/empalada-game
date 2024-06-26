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
      buttons = (s: TitleScreen) => {
        s.addButton("Start Game", () => this.app.startGame());
        s.addButton("Fullscreen", () => this.app.goFullscreen());
      },
    }: {
      titleText?: string;
      subtitleText?: string;
      buttons?: (s: TitleScreen) => void;
    } = {}
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
    buttons(this);
  }
  destroy() {
    this.container.destroy();
  }
  addButton(text: string, callback: () => void) {
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
    const width = btnText.width + 50;
    const button = new ButtonContainer(
      new Graphics().roundRect(-width / 2, -80, width, 160, 15).fill(2436397)
    );
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
