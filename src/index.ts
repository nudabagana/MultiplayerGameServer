import * as dotenv from "dotenv";
import * as os from "os";
import { createServer } from "http";
import * as gameLoop from "node-gameloop";
import WebSocket from "ws";
import Player from "./game/Player";
import Rocket from "./game/Rocket";
import Bullet from "./game/Bullet";
import {
  CLIENTS,
  ClientMessage,
  ACTIONS,
  NetworkMsg,
} from "./types/NetworkTypes";
import GameManager from "./game/GameManager";

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

const gameManager = new GameManager();

ws.on("connection", socket => {
  if (socket.protocol === CLIENTS.PLAYER) {
    console.log("New Player Connected!");
    const player = gameManager.addNewPlayer(socket);
    socket.onclose = () => {
      console.log("Player disconnected");
      if (player) {
        gameManager.removePlayer(player.id);
      }
    };
    if (player) {
      socket.onmessage = message => {
        const msg: ClientMessage = JSON.parse(message.data.toString());
        if (msg.action === ACTIONS.MOVE) {
          player.moveTo(msg.x, msg.y);
        } else if (msg.action === ACTIONS.ROCKET) {
          gameManager.addRocket(player.id, player.x, player.y, msg.x, msg.y);
        } else if (msg.action === ACTIONS.BULLET) {
          gameManager.addBullet(player.id, player.x, player.y, msg.x, msg.y);
        }
      };
    }
  } else {
    console.log("New Spactator Connected!");
    socket.onclose = () => console.log("Spectator disconnected");
  }

  socket.send("welcome to the game!");
});

const broadcastGameState = (gameState: NetworkMsg) => {
  ws.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(gameState));
    }
  });
};

server.listen(port, () => {
  console.log(`Server ready ws://${host}:${port}`);
});

const id = gameLoop.setGameLoop(function(delta) {
  unsimulatedTime += delta;

  while (unsimulatedTime > TICK_TIME_SECONDS) {
    gameManager.SimulateStep(TICK_TIME);
    unsimulatedTime -= TICK_TIME_SECONDS;
    currentTick++;
  }
  broadcastGameState(gameManager.getCurrentState());

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
