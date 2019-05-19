import express from 'express';
import * as dotenv from "dotenv";
import * as os from 'os';
import { createServer } from 'http';
import * as path from 'path';
import * as  gameLoop from 'node-gameloop';

dotenv.config();
const host = os.hostname();
if (!process.env.PORT){
  throw new Error(`PORT not Found! Please set it in environment variables.`);
}
const port = process.env.PORT;
const TICK_TIME = 1000/30;
let unsimulatedTime = 0;
let currentTick = 0;

// const app = express();

// app.use(express.static('dist'));

// const server = createServer(app);

// app.get('/',(req : express.Request, res : express.Response) => {
//   res.sendFile(path.join(__dirname + '/../client/index.html'));
// });

// app.get('/favicon.ico',(req : express.Request, res : express.Response) => {
//   res.sendFile(path.join(__dirname + '/../assets/favicon.png'));
// });

// server.listen(port, () => {
//   console.log(`Server ready http://${host}:${port}`);
// });


const id = gameLoop.setGameLoop(function(delta) {
  unsimulatedTime += delta;
  while (unsimulatedTime > TICK_TIME){
    // Simulate physics step
    unsimulatedTime -= TICK_TIME;
    currentTick++;
  }
  if (currentTick % 1000 === 0){
    console.log(`Current server tick: ${currentTick}`);
  }
}, TICK_TIME);


const terminate = async () => {
  gameLoop.clearGameLoop(id);
  console.log("Server stopped.");
  process.exit(1);
};
// Signals on witch we will what to close connection to service.
process.on('SIGTERM', () => terminate().catch(err => console.log(err)));
process.on('SIGINT', () => terminate().catch(err => console.log(err)));
