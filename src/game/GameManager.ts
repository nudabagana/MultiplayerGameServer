import WebSocket from "ws";
import {
  bulletLifespan,
  playerSize,
  rocketLifespan,
  windowSize,
} from "../config";
import { NetworkMsg, NetworkMsgTypes } from "../types/NetworkTypes";
import { getRandomInt } from "../utils";
import Bullet from "./Bullet";
import Player from "./Player";
import Rocket from "./Rocket";
import GameObject from "./GameObject";
import { GameObjectTypes } from "../types/GameObjectTypes";

export default class GameManager {
  gameObjects: GameObject[];
  nextRocketId: number;
  nextBulletId: number;

  constructor() {
    this.gameObjects = [];
    this.nextRocketId = 0;
    this.nextBulletId = 0;
  }

  addNewPlayer = (socket: WebSocket) => {
    const players = this.getPlayers();
    if (players.length < 2) {
      const playerId = players[0] ? (players[0].id === 1 ? 2 : 1) : 1;
      const player = new Player(
        socket,
        playerId,
        playerSize + getRandomInt(windowSize.width - playerSize * 2),
        playerSize + getRandomInt(windowSize.height - playerSize * 2),
        100
      );
      this.gameObjects.push(player);
      return player;
    } else {
      return null;
    }
  };

  getPlayers = () => {
    const players: Player[] = [];
    this.gameObjects.forEach(obj => {
      if (obj.type === GameObjectTypes.PLAYER) {
        players.push(obj as Player);
      }
    });
    return players;
  };

  getCurrentState = (tick: number): NetworkMsg => {
    return {
      tick,
      gameObjects: this.gameObjects.map(obj => {
        if (obj.type === GameObjectTypes.PLAYER) {
          return {
            type: obj.type,
            id: obj.id,
            x: obj.x,
            y: obj.y,
            health: (obj as Player).health,
          };
        } else {
          return {
            type: obj.type,
            id: obj.id,
            x: obj.x,
            y: obj.y,
            playerId: (obj as Rocket).playerId,
          };
        }
      }),
      type: NetworkMsgTypes.STATE
    };
  };

  SimulateStep = (delta: number) => {
    this.move(delta);
    this.checkCollisions();
    this.destroy();
  };

  move = (delta: number) => {
    this.gameObjects.forEach(obj => obj.move(delta));
  };

  checkCollisions = () => {
    this.gameObjects.forEach(object => {
      if (object.type !== GameObjectTypes.BULLET) {
        this.gameObjects.forEach(other => {
          if (
            other.type !== GameObjectTypes.BULLET &&
            this.checkCollision(object, other)
          ) {
            object.onCollision(other);
          }
        });
      }
    });
  };

  checkCollision = (object: GameObject, other: GameObject) => {
    if (object.type !== other.type || object.id !== other.id) {
      let distancePOW =
        Math.pow(object.x - other.x, 2) + Math.pow(object.y - other.y, 2);
      let bothradiusPOW = Math.pow(object.size + other.size, 2);
      if (distancePOW < bothradiusPOW) {
        return true;
      }
    }
    return false;
  };

  checkCollisionBullet = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    circleX: number,
    circleY: number,
    radius: number
  ) => {
    const slope = (y2 - y1) / (x2 - x1);
    const B = 1;
    const A = -1 * slope;
    const C = slope * x1 - y1;
    const distance =
      Math.abs(A * circleX + B * circleY + C) / Math.sqrt(A * A + B * B);
    if (radius >= distance) {
      return true;
    }
    return false;
  };

  destroy = () => {
    this.gameObjects.forEach(obj => {
      if (obj.shouldBeDestroyed) {
        this.removeGameObject(obj);
      }
    });
  };

  removeGameObject = (obj: GameObject) => {
    this.gameObjects = this.gameObjects.filter(
      o => o.id !== obj.id || o.type !== obj.type
    );
  };

  addRocket = (
    playerId: number,
    x: number,
    y: number,
    destX: number,
    destY: number
  ) => {
    const rocket = new Rocket(this.nextRocketId, playerId, x, y, destX, destY);
    this.gameObjects.push(rocket);
    setTimeout(() => this.removeGameObject(rocket), rocketLifespan);
    this.nextRocketId++;
    return rocket;
  };

  addBullet = (
    playerId: number,
    x: number,
    y: number,
    destX: number,
    destY: number
  ) => {
    const bullet = new Bullet(this.nextBulletId, playerId, x, y, destX, destY);
    this.gameObjects.forEach(obj => {
      if (obj.type === GameObjectTypes.PLAYER && obj.id !== playerId) {
        if (
          this.checkCollisionBullet(x, y, destX, destY, obj.x, obj.y, obj.size)
        ) {
          obj.onCollision(bullet);
        }
      }
    });
    this.gameObjects.push(bullet);
    setTimeout(() => this.removeGameObject(bullet), bulletLifespan);
    this.nextBulletId++;
    return bullet;
  };
}
