import GameObject from "./GameObject";
import { playerSeed, playerSize } from "../config";
import { GameObjectTypes } from "../types/GameObjectTypes";

export default class Player extends GameObject {
  health: number;

  constructor(id: number, x: number, y: number, health: number) {
    super(id, x, y, playerSeed, GameObjectTypes.PLAYER, playerSize);
    this.health = health;
  }

  moveTo = (x: number, y: number) => {
    this.calculateMovement(x,y);
  };
  rocketTo = (x: number, y: number) => {
    console.log(`Player Shooting rocket to ${x}:${y}`);
  };
  bulletTo = (x: number, y: number) => {
    console.log(`Player Shooting bulelt to ${x}:${y}`);
  };
}
