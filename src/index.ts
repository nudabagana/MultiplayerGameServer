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

const app = express();

app.use(express.static('dist'));

const server = createServer(app);

app.get('/',(req : express.Request, res : express.Response) => {
  res.sendFile(path.join(__dirname + '/../client/index.html'));
});

app.get('/favicon.ico',(req : express.Request, res : express.Response) => {
  res.sendFile(path.join(__dirname + '/../assets/favicon.png'));
});

server.listen(port, () => {
  console.log(`Server ready http://${host}:${port}`);
});

// start the loop at 30 fps (1000/30ms per frame) and grab its id
let frameCount = 0;
const id = gameLoop.setGameLoop(function(delta) {
	// `delta` is the delta time from the last frame
	console.log('Hi there! (frame=%s, delta=%s)', frameCount++, delta);
}, 1000 / 30);

// stop the loop 2 seconds later
setTimeout(function() {
	console.log('2000ms passed, stopping the game loop');
	gameLoop.clearGameLoop(id);
}, 2000);