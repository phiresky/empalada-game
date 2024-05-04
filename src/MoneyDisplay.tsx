import { Container, Text } from "pixi.js";
import { Game } from "./Game";

export class MoneyDisplay {
  container: Container;
  text: Text;
  constructor(public game: Game, public money: number) {
    this.container = new Container();
    game.addChild(this.container);
    this.text = new Text({
      text: "Money " + money,
      style: {
        fontFamily: "Graveyard BRK",
        fontSize: 80,
        fill: "black",
      },
    });
    this.text.position.set(150, 300);
    this.container.addChild(this.text);
  }
  updateMoney(money: number) {
    this.money = money;
    this.text.text = "Money " + money;
  }
}
