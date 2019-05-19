import { windowSize, playerSize } from "../config";
import { getRandomInt } from "../utils";
import "phaser";

export default class DrawableObject {
  x: number;
  y: number;
  id: number;
  g: Phaser.GameObjects.Graphics;
  color: number;

  constructor(
    id: number,
    x: number,
    y: number,
    graphics: Phaser.GameObjects.Graphics,
    color: number
  ) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.g = graphics;
    this.color = color;
  }

  draw = () => {
    console.log("draw called on an object without draw implementation!");
  };
}
