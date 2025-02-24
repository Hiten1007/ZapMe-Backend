import dotenv from 'dotenv';
import app from './app'; // Import the configured app
import http from 'http';
import { WebSocketServer } from 'ws';
import { handleWebSocketConnection } from './websockets/websocket';
import { Request } from 'express';

// Load environment variables
if (!process.env.RAILWAY_ENV) {
  dotenv.config();
}

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Create WebSocket server
export const wss = new WebSocketServer({ noServer: true }); // Use `noServer: true`

// Handle WebSocket connection
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  handleWebSocketConnection(ws, req as Request);
});

// Handle HTTP server upgrade event
server.on('upgrade', (request, socket, head) => {
  const origin = request.headers.origin;
  console.log('WebSocket upgrade request from origin:', origin);

  // Allow connections only from the specified frontend origin
  if (origin === 'https://zap-me-frontend.vercel.app') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    console.log('WebSocket connection rejected: invalid origin', origin);
    socket.destroy(); // Reject the connection
  }
});

// Start the server
const startServer = async () => {
  try {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server running on wss://zapme-backend-production.up.railway.app`);
    });
  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1);
  }
};

startServer();