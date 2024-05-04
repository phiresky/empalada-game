import { Assets, Texture } from "pixi.js";

export type Assets = {
  shovel: Texture;
  zombie: Texture;
  frame: Texture;
  doggo: Texture;
  tortuga: Texture;
  heart: Texture;
  bone: Texture;
  woof1: HTMLAudioElement;
  woof2: HTMLAudioElement;
  woof3: HTMLAudioElement;
  grunt1: HTMLAudioElement;
  grunt2: HTMLAudioElement;
  grunt3: HTMLAudioElement;
  tortuga1: HTMLAudioElement;
  tortuga2: HTMLAudioElement;
  tortuga3: HTMLAudioElement;
  death1: HTMLAudioElement;
  death2: HTMLAudioElement;
};
export async function loadAssets(): Promise<Assets> {
  const obj = {
    shovel: Assets.load<Texture>("./shovel.png"),
    zombie: Assets.load<Texture>("./zombie.png"),
    frame: Assets.load<Texture>("./frame.png"),
    doggo: Assets.load<Texture>("./doggo.png"),
    tortuga: Assets.load<Texture>("./tortuga.png"),
    heart: Assets.load<Texture>("./heart.png"),
    bone: Assets.load<Texture>("./bone.png"),
    woof1: new Audio("./woof1.mp3"),
    woof2: new Audio("./woof2.mp3"),
    woof3: new Audio("./woof3.mp3"),
    grunt1: new Audio("./grunt1.mp3"),
    grunt2: new Audio("./grunt2.mp3"),
    grunt3: new Audio("./grunt3.mp3"),
    tortuga1: new Audio("./tortuga-01.mp3"),
    tortuga2: new Audio("./tortuga-02.mp3"),
    tortuga3: new Audio("./tortuga-03.mp3"),
    death1: new Audio("./death1.mp3"),
    death2: new Audio("./death2.mp3"),
  };
  const keys = Object.keys(obj);
  return Object.fromEntries(
    (await Promise.all(Object.values(obj))).map((v, i) => [keys[i], v] as const)
  ) as Assets;
}
