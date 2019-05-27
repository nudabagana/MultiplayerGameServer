import WebSocket from "ws";
import {
  bulletLifespan,
  playerSize,
  rocketLifespan,
  windowSize,
  savedStatesAmount,
} from "../config";
import { NetworkMsg, NetworkMsgTypes } from "../types/NetworkTypes";
import { getRandomInt } from "../utils";
import Bullet from "./Bullet";
import Player from "./Player";
import Rocket from "./Rocket";
import GameObject from "./GameObject";
import { GameObjectTypes, IGameStateStorage } from "../types/GameObjectTypes";

export default class GameManager {
  gameObjects: GameObject[];
  pastStates: IGameStateStorage;
  latestStateTick: number;

  constructor() {
    this.gameObjects = [];
    this.pastStates = {};
    this.latestStateTick = 0;
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

  getGameObject = (id: number, type: GameObjectTypes) => {
    return this.gameObjects.find(obj => obj.id === id && obj.type === type);
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

  SimulateStep = (delta: number, tick: number) => {
    this.saveState(tick);
    this.move(delta);
    this.checkCollisions();
    this.destroy();
  };

  saveState = (tick: number) => {
    this.pastStates[tick] = JSON.parse(JSON.stringify(this.gameObjects));
    this.latestStateTick = tick - savedStatesAmount;
    delete this.pastStates[tick - savedStatesAmount-1]; 
  }

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
    id: number,
    destX: number,
    destY: number
  ) => {
    const rocket = new Rocket(id, playerId, x, y, destX, destY);
    this.gameObjects.push(rocket);
    setTimeout(() => this.removeGameObject(rocket), rocketLifespan);
    return rocket;
  };

  addBullet = (
    playerId: number,
    x: number,
    y: number,
    id: number,
    destX: number,
    destY: number,
    playerTick?: number,
  ) => {
    const bullet = new Bullet(id, playerId, x, y, destX, destY);
    let gameObjects = this.gameObjects;
    if (playerTick){
      if (this.pastStates[playerTick]){
        gameObjects = this.pastStates[playerTick];
      } else if (playerTick < this.latestStateTick){
        gameObjects = this.pastStates[this.latestStateTick];
      }
    }

    gameObjects.forEach(obj => {
      if (obj.type === GameObjectTypes.PLAYER && obj.id !== playerId) {
        if (
          this.checkCollisionBullet(x, y, destX, destY, obj.x, obj.y, obj.size)
        ) {
          const collidedObj = this.getGameObject(obj.id, obj.type);
          if (collidedObj)
          {
            collidedObj.onCollision(bullet);
          }
        }
      }
    });
    this.gameObjects.push(bullet);
    setTimeout(() => this.removeGameObject(bullet), bulletLifespan);
    return bullet;
  };
}
