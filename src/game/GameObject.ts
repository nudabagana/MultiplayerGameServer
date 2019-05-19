import {GameObjectTypes } from '../types/GameObjectTypes'
export default class GameObject {
  x: number;
  y: number;
  destinationX: number;
  destinationY: number;
  xPerT: number;
  yPerT: number;
  id: number;
  movementSpeed: number;
  type: GameObjectTypes;
  size: number;
  shouldBeDestroyed:boolean;

  constructor(id: number, x: number, y: number, speed: number, type:GameObjectTypes, size: number) {
    this.x = x;
    this.y = y;
    this.destinationX = x;
    this.destinationY = y;
    this.xPerT = 0;
    this.yPerT = 0;
    this.id = id;
    this.movementSpeed = speed;
    this.type = type;
    this.size = size;
    this.shouldBeDestroyed = false;
  }

  calculateMovement = (x: number, y: number) => {
    this.destinationX = x;
    this.destinationY = y;
    this.RecalculateXYPercentages();
  };

  RecalculateXYPercentages = () => {
    let xDistance = Math.abs(this.x - this.destinationX);
    let yDistance = Math.abs(this.y - this.destinationY);

    let fullDistance = Math.sqrt(
      Math.pow(xDistance, 2) + Math.pow(yDistance, 2)
    );
    const xMovePercentage = xDistance / fullDistance;
    const yMovePercentage = yDistance / fullDistance;
    if (this.x < this.destinationX) {
      this.xPerT = this.movementSpeed * xMovePercentage;
    } else {
      this.xPerT = -1 * this.movementSpeed * xMovePercentage;
    }
    if (this.y < this.destinationY) {
      this.yPerT = this.movementSpeed * yMovePercentage;
    } else {
      this.yPerT = -1 * this.movementSpeed * yMovePercentage;
    }
  };

  move = (delta: number) => {
    if (Math.abs(this.x - this.destinationX) > Math.abs(delta * this.xPerT)) {
      this.x += delta * this.xPerT;
    }
    if (Math.abs(this.y - this.destinationY) > Math.abs(delta * this.yPerT)) {
      this.y += delta * this.yPerT;
    }
  };

  destroy = () => {
    this.shouldBeDestroyed = true;
  }

  onCollision = (other: GameObject) => {
    console.log(`Object(${this.id}) collided with other(${other.id})`);
  }
}
