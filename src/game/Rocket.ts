import { windowSize, rocketSize } from "../config";
import { getRandomInt } from "../utils";
import "phaser";
import DrawableObject from "./DrawableObject";

export default class Rocket extends DrawableObject {

  draw = () => {
    this.g.fillStyle(this.color);
    this.g.lineStyle(2, 0x000000);
    this.g.fillCircle(this.x, this.y, rocketSize);
    this.g.strokeCircle(this.x, this.y, rocketSize);
  };
}
