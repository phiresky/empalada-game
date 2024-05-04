import { Container, Graphics, Point, Size, Sprite, Text } from "pixi.js";
import { Game } from "./Game";
import gsap from "gsap";

export class MoneyDisplay {
  container: Container;
  text: Text;
  titleText: Text;

  bonePileOuter: Container;
  bonePile: Container;
  bonePileSize: Size = { width: 200, height: 300 };
  boneMultiplier = 10;
  constructor(public game: Game, public money: number, public of: number) {
    this.container = new Container();
    game.addChild(this.container);
    this.titleText = new Text({
      text: "Jar-o-bones",
      style: {
        fontFamily: "Graveyard BRK",
        fontSize: 80,
        fill: "black",
      },
    });
    this.titleText.position.set(120, 250);
    this.text = new Text({
      text: "",
      style: {
        fontFamily: "Graveyard BRK",
        fontSize: 60,
        fill: "black",
      },
    });
    this.container.zIndex = 2;
    this.addMoney(0, new Point(0, 0));
    this.container.addChild(this.text);
    this.container.addChild(this.titleText);
    this.bonePileOuter = new Container();
    this.bonePileOuter.x =
      this.titleText.x + this.titleText.width / 2 - this.bonePileSize.width / 2;
    this.bonePileOuter.y = this.text.y + this.text.height;
    this.bonePileOuter.addChild(
      new Graphics()
        .roundRect(0, 0, this.bonePileSize.width, this.bonePileSize.height, 3)
        .stroke({ color: /*0x8b4513*/ 0x000000, width: 3 })
    );
    this.container.addChild(this.bonePileOuter);
    this.bonePile = new Container();
    this.bonePileOuter.addChild(this.bonePile);
    const mask = new Graphics()
      .rect(0, 0, this.bonePileSize.width, this.bonePileSize.height)
      .fill(0xffffff);
    this.bonePile.addChild(mask);
    // this.bonePile.mask = mask;
  }
  addMoney(n: number, sourcePosition: Point) {
    this.money += n;
    this.text.text = `${this.money} / ${this.of}`;
    this.text.position.set(
      this.titleText.x + this.titleText.width / 2 - this.text.width / 2,
      320
    );
    const boneSprite = new Sprite(this.game.app.assets.bone);
    boneSprite.scale.x = maybeInvert() * 0.2;
    boneSprite.scale.y = maybeInvert() * 0.2;
    const fillRatio = this.money / this.of;
    const minX = boneSprite.width / 2;
    const maxX = this.bonePileSize.width - boneSprite.width / 2;
    const minYTop = boneSprite.height / 2;
    const maxY = this.bonePileSize.height; /* - boneSprite.height / 2*/
    const height = maxY - minYTop;
    const minY = minYTop + (1 - fillRatio) * height;

    for (let i = 0; i < this.boneMultiplier * n; i++) {
      const boneSprite = new Sprite(this.game.app.assets.bone);
      boneSprite.pivot.x = boneSprite.width / 2;
      boneSprite.pivot.y = boneSprite.height / 2;
      boneSprite.scale.x = 0.2;
      boneSprite.scale.y = 0.2;
      boneSprite.position.x = 0;
      boneSprite.position.y = 0;
      const minRotation = 0; // boneSprite.scale.x < 0 ? (-40 * Math.PI) / 180 : 0;
      const maxRotation = (80 * Math.PI) / 180; // boneSprite.scale.x < 0 ? 0 : (40 * Math.PI) / 180;
      boneSprite.rotation =
        -Math.random() * (maxRotation - minRotation) + minRotation;

      const targetPos = new Point(
        Math.random() * (maxX - minX) + minX,
        Math.random() * (maxY - minY) + minY
      );
      boneSprite.position = sourcePosition.subtract(
        this.bonePileOuter.position
      );
      this.bonePile.addChild(boneSprite);
      gsap.to(boneSprite.position, {
        ...targetPos,
        delay: Math.random() * 0.5,
        duration: 1.5,
        repeat: 0,
      });
    }
  }
}

const maybeInvert = () => (Math.random() > 0.5 ? 1 : -1);
