import WebSocket from "ws";
import { defaultDelay } from "../config";

let delay_ms = defaultDelay;

export const setDelay = (delay: number) => {
    delay_ms = delay;
}

export const sendData = (socket: WebSocket, msg: string, delay: boolean) => {
  if (delay) {
    setTimeout(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(msg);
      }
    }, delay_ms);
  } else {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(msg);
    }
  }
};

export const close = (socket: WebSocket, delay: boolean) => {
  if (delay) {
    setTimeout(() => {
      socket.close();
    }, delay_ms);
  } else {
    socket.close();
  }
};

export const receiveData = (func: () => void, delay: boolean) => {
  if (delay) {
    setTimeout(func, delay_ms);
  } else {
    func();
  }
};
