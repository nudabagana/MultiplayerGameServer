import "phaser";
import  GameScene  from "./Scene";
import { windowSize } from "../config"

export const createGame = () => {
  const scene = new GameScene;
  const config = {
    title: "Multiplayer Game",
    width: windowSize.width,
    height: windowSize.height,
    parent: "game",
    backgroundColor: "#c5d1e5",
    scene: [ scene ],
  };

  const game = new Phaser.Game(config);

}
