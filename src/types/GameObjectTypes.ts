import GameObject from "../game/GameObject";

export enum GameObjectTypes {
    PLAYER = 0,
    ROCKET = 1,
    BULLET = 2,
}

export interface IGameStateStorage {
    [t: number]: GameObject[];
}