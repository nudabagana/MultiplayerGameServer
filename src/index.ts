import * as dotenv from "dotenv";
import { createServer } from "http";
import * as gameLoop from "node-gameloop";
import * as os from "os";
import WebSocket from "ws";
import GameManager from "./game/GameManager";
import {
  ACTIONS,
  GameAction,
  CLIENTS,
  NetworkMsg,
  NetworkMsgTypes,
} from "./types/NetworkTypes";
import {sendData, receiveData} from "./simulation/networkDelaySimulation"

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
  sendData(socket,JSON.stringify({data: { type: NetworkMsgTypes.SET_TICK, tick: currentTick }, trueState: false}),true);
  gameManager.getPlayers().forEach( player => {
    sendData(socket,JSON.stringify({data: { type: NetworkMsgTypes.CREATE, tick: currentTick, gameObject: player  }, trueState: false}),true);
  })

  if (socket.protocol === CLIENTS.PLAYER) {
    console.log("New Player Connected!");
    const player = gameManager.addNewPlayer(socket);
    socket.onclose = () => {
      console.log("Player disconnected");
      if (player) {
        broadcastMessage({type: NetworkMsgTypes.DELETE, tick: currentTick, gameObject: player });
        gameManager.removeGameObject(player);
      }
    };
    if (player) {
      // create player
      broadcastMessage({type: NetworkMsgTypes.CREATE, tick: currentTick, gameObject: player });


      socket.onmessage = message => {
        const msg: GameAction = JSON.parse(message.data.toString());
        receiveData(() => {
          msg.playerId = player.id;
          if (msg.action === ACTIONS.MOVE) {
            player.moveTo(msg.x, msg.y);
          } else if (msg.action === ACTIONS.ROCKET) {
            const rocket = gameManager.addRocket(player.id, player.x, player.y, msg.x, msg.y);
            msg.id = rocket.id;
          } else if (msg.action === ACTIONS.BULLET) {
            const bullet = gameManager.addBullet(player.id, player.x, player.y, msg.x, msg.y);
            msg.id = bullet.id;
          }
          broadcastMessage({type: NetworkMsgTypes.ACTION, tick: currentTick, action: msg });
        }, true);
      };
    }
  } else {
    console.log("New Spactator Connected!");
    socket.onclose = () => console.log("Spectator disconnected");
  }
});

const broadcastMessage = (data: NetworkMsg) => {
  ws.clients.forEach(function each(client) {
    if (client.protocol === CLIENTS.PLAYER){
      sendData(client, JSON.stringify({data, trueState: false}),true);
    } else {
      sendData(client, JSON.stringify({data, trueState: false}),false);
    }
  });
};

const broadcastMessageNoDelay = (data: NetworkMsg) => {
  ws.clients.forEach(function each(client) {
    if (client.protocol === CLIENTS.PLAYER){
      sendData(client, JSON.stringify({data, trueState: true}),false);
    } else {
      sendData(client, JSON.stringify({data, trueState: false}),false);
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
  const state = gameManager.getCurrentState(currentTick)
  broadcastMessageNoDelay(state);
  if (currentTick % 10 === 0) {
    broadcastMessage(state);
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
