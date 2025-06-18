import app from './app'; 
import http from 'http';
import { WebSocketServer } from 'ws';
import { handleWebSocketConnection } from './websockets/websocket';
import { IncomingMessage } from 'http';


const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

export const wss = new WebSocketServer({ noServer:true }); 


wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  handleWebSocketConnection(ws, req as IncomingMessage);
});

server.on('upgrade', (request, socket, head) => {

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });

  
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