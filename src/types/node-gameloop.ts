declare module "node-gameloop" {
  namespace gameloop {
    function clearGameLoop(loopId: number): void;
    function setGameLoop(
      update: (delta: number) => void,
      tickLengthMs: number
    ): number;
  }
  export = gameloop;
}
