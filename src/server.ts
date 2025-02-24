import dotenv from 'dotenv';
import app from './app'; 
import http from 'http';
import { WebSocketServer } from 'ws';
import { handleWebSocketConnection } from './websockets/websocket';
import { Request } from 'express';

if (!process.env.RAILWAY_ENV) {
  dotenv.config();
}

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

export const wss = new WebSocketServer({ noServer: true }); 

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  handleWebSocketConnection(ws, req as Request);
});

server.on('upgrade', (request, socket, head) => {
  const origin = request.headers.origin;

  if (origin === 'https://zap-me-frontend.vercel.app') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy(); 
  }
});

const startServer = async () => {
  try {
    server.listen(PORT, () => {
    });
  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1);
  }
};

startServer();