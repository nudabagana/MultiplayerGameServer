import WebSocket from "ws";
import GameObject from "./GameObject";
import { playerSeed, playerSize, rocketDamage, bulletDamage } from "../config";
import { GameObjectTypes } from "../types/GameObjectTypes";
import Rocket from "./Rocket";
import { close } from "../simulation/networkDelaySimulation";

export default class Player extends GameObject {
  health: number;
  socket: WebSocket;

  constructor(socket: WebSocket, id: number, x: number, y: number, health: number) {
    super(id, x, y, playerSeed, GameObjectTypes.PLAYER, playerSize);
    this.health = health;
    this.socket = socket;
  }

  moveTo = (x: number, y: number) => {
    this.calculateMovement(x,y);
  };

  onCollision = (other: GameObject) => {
    if (other.type === GameObjectTypes.ROCKET && (other as Rocket).playerId !== this.id){
      this.takeDamage(rocketDamage);
      other.destroy();
    }else if (other.type === GameObjectTypes.BULLET){
      this.takeDamage(bulletDamage);
      // other.destroy();
    }
  }

  takeDamage = (damage: number ) => {
    this.health -= damage;
    if (this.health <= 0){
      this.die();
    }
  }

  die = () => {
    close(this.socket, true);
    this.destroy();
  }

}
