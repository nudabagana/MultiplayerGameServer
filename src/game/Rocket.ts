import GameObject from "./GameObject";
import { rocketSpeed, rocketSize } from "../config";
import { GameObjectTypes } from "../types/GameObjectTypes";

export default class Rocket extends GameObject {
  playerId: number;

  constructor(
    id: number,
    playerId: number,
    x: number,
    y: number,
    destX: number,
    destY: number
  ) {
    super(id, x, y, rocketSpeed, GameObjectTypes.ROCKET, rocketSize);
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
