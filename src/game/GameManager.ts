import WebSocket from "ws";
import {
  bulletLifespan,
  playerSize,
  rocketLifespan,
  windowSize,
} from "../config";
import { NetworkMsg } from "../types/NetworkTypes";
import { getRandomInt } from "../utils";
import Bullet from "./Bullet";
import Player from "./Player";
import Rocket from "./Rocket";
import GameObject from "./GameObject";

export default class GameManager {
  players: Player[];
  rockets: Rocket[];
  bullets: Bullet[];
  nextRocketId: number;
  nextBulletId: number;

  constructor() {
    this.players = [];
    this.rockets = [];
    this.bullets = [];
    this.nextRocketId = 0;
    this.nextBulletId = 0;
  }

  addNewPlayer = (socket: WebSocket) => {
    if (this.players.length < 2) {
      const playerId = this.players[0] ? this.players[0].id === 1 ? 2 : 1 : 1;
      const player = new Player(
        socket,
        playerId,
        playerSize + getRandomInt(windowSize.width - playerSize * 2),
        playerSize + getRandomInt(windowSize.height - playerSize * 2),
        100
      );
      this.players.push(player);
      return player;
    } else {
      return null;
    }
  };

  getCurrentState = (): NetworkMsg => {
    return {
      players: this.players.map(player => ({
        id: player.id,
        x: player.x,
        y: player.y,
        health: player.health,
      })),
      rockets: this.rockets.map(rocket => ({
        id: rocket.id,
        x: rocket.x,
        y: rocket.y,
        playerId: rocket.playerId,
      })),
      bullets: this.bullets.map(bullet => ({
        id: bullet.id,
        x: bullet.x,
        y: bullet.y,
        playerId: bullet.playerId,
      })),
    };
  };

  SimulateStep = (delta: number) => {
    this.move(delta);
    this.checkCollisions();
    this.destroy();
  };

  move = (delta: number) => {
    this.players.forEach(player => player.move(delta));
    this.rockets.forEach(rocket => rocket.move(delta));
    this.bullets.forEach(bullet => bullet.move(delta));
  };

  checkCollisions = () => {
    this.players.forEach(object => {
      this.players.forEach(other => {
        if (this.checkCollision(object, other)) {
          object.onCollision(other);
        }
      });
      this.rockets.forEach(other => {
        if (this.checkCollision(object, other)) {
          object.onCollision(other);
        }
      });
    });

    this.rockets.forEach(object => {
      this.players.forEach(other => {
        if (this.checkCollision(object, other)) {
          object.onCollision(other);
        }
      });
      this.rockets.forEach(other => {
        if (this.checkCollision(object, other)) {
          object.onCollision(other);
        }
      });
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
    this.players.forEach(player => {
      if (player.shouldBeDestroyed) {
        this.removePlayer(player.id);
      }
    });
    this.rockets.forEach(rocket => {
      if (rocket.shouldBeDestroyed) {
        this.removeRocket(rocket.id);
      }
    });
    this.bullets.forEach(bullet => {
      if (bullet.shouldBeDestroyed) {
        this.removeBullet(bullet.id);
      }
    });
  };

  removePlayer = (id: number) => {
    this.players = this.players.filter(player => player.id !== id);
  };

  addRocket = (
    playerId: number,
    x: number,
    y: number,
    destX: number,
    destY: number
  ) => {
    const rocket = new Rocket(this.nextRocketId, playerId, x, y, destX, destY);
    this.rockets.push(rocket);
    setTimeout(() => this.removeRocket(rocket.id), rocketLifespan);
    this.nextRocketId++;
  };

  removeRocket = (id: number) => {
    this.rockets = this.rockets.filter(rocket => rocket.id !== id);
  };

  addBullet = (
    playerId: number,
    x: number,
    y: number,
    destX: number,
    destY: number
  ) => {
    const bullet = new Bullet(this.nextBulletId, playerId, x, y, destX, destY);
    this.players.forEach(player => {
      if (player.id !== playerId) {
        if (
          this.checkCollisionBullet(
            x,
            y,
            destX,
            destY,
            player.x,
            player.y,
            player.size
          )
        ) {
          player.onCollision(bullet);
        }
      }
    });
    this.bullets.push(bullet);
    setTimeout(() => this.removeBullet(bullet.id), bulletLifespan);
    this.nextBulletId++;
  };

  removeBullet = (id: number) => {
    this.bullets = this.bullets.filter(bullet => bullet.id !== id);
  };
}
