import express from "express";
import * as dotenv from "dotenv";
import * as os from "os";
import { createServer } from "http";
import * as path from "path";
import * as gameLoop from "node-gameloop";
import WebSocket from "ws";
import { Socket } from "net";

dotenv.config();
const host = os.hostname();
if (!process.env.PORT) {
  throw new Error(`PORT not Found! Please set it in environment variables.`);
}
const port = process.env.PORT;
const TICK_TIME = 1000 / 30;
const TICK_TIME_SECONDS = 1 / 30;
let unsimulatedTime = 0;
let currentTick = 0;

const server = createServer();

const ws = new WebSocket.Server({ server });

ws.on("connection", socket => {
  console.log("NEW USER CONNECTED!");

  socket.onmessage = message => console.log("received: %s", message);

  socket.onclose = () => console.log("User disconnected");

  socket.send("welcome to the game!");
});

server.listen(port, () => {
  console.log(`Server ready http://${host}:${port}`);
});

const id = gameLoop.setGameLoop(function(delta) {
  unsimulatedTime += delta;

  while (unsimulatedTime > TICK_TIME_SECONDS) {
    // Simulate physics step
    unsimulatedTime -= TICK_TIME_SECONDS;
    currentTick++;
  }
  if (currentTick % 1000 === 0) {
    console.log(`Current server tick: ${currentTick}`);
  }
}, TICK_TIME);

const terminate = async () => {
  gameLoop.clearGameLoop(id);
  console.log("Server stopped.");
  process.exit(1);
};
// Signals on witch we will what to close connection to service.
process.on("SIGTERM", () => terminate().catch(err => console.log(err)));
process.on("SIGINT", () => terminate().catch(err => console.log(err)));
