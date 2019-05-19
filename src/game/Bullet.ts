import { bulletSize, bulletSpeed } from "../config";
import { GameObjectTypes } from "../types/GameObjectTypes";
import GameObject from "./GameObject";

export default class Bullet extends GameObject {
  playerId: number;

  constructor(
    id: number,
    playerId: number,
    x: number,
    y: number,
    destX: number,
    destY: number
  ) {
    super(id, x, y, bulletSpeed, GameObjectTypes.BULLET, bulletSize);
    this.destinationX = destX;
    this.destinationY = destY;
    this.playerId = playerId;
    this.RecalculateXYPercentages();
  }
  move = (delta: number) => {
    this.x += delta * this.xPerT;
    this.y += delta * this.yPerT;
  };
}
