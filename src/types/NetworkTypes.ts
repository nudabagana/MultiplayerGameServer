import { GameObjectTypes } from "./GameObjectTypes";

export enum ACTIONS {
  MOVE = 0,
  BULLET = 1,
  ROCKET = 2,
}

export enum NetworkMsgTypes {
  STATE = 0,
  ACTION = 1,
  CREATE = 2,
  DELETE = 3,
  SET_TICK = 4,
}

export interface NetworkMsg {
  tick: number;
  type: NetworkMsgTypes;
  gameObjects?: ServerGameObject[];
  action?: GameAction;
  gameObject?: Player | Rocket | Bullet;
}

export enum CLIENTS {
  PLAYER = "0",
  SPECTATOR = "1",
}

interface ServerGameObject {
  type: GameObjectTypes;
  id: number;
  x: number;
  y: number;
}

interface Player extends ServerGameObject {
  health: number;
}

interface Rocket extends ServerGameObject {
  playerId: number;
}

interface Bullet extends ServerGameObject {
  playerId: number;
}

export interface GameAction {
  id?:number;
  playerId?: number;
  action: ACTIONS;
  x: number;
  y: number;
}
