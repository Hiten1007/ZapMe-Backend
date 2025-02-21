import dotenv from 'dotenv';
import app from './app'; // Import the configured app
import http from 'http'
import { WebSocketServer } from 'ws'
import { handleWebSocketConnection } from './websockets/websocket';
import { Request } from 'express'
dotenv.config(); // Load environment variables

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

export const wss = new WebSocketServer({ server });



// Handle WebSocket upgrade and connection
wss.on('connection', (ws, req) => {
  handleWebSocketConnection(ws, req as Request);
});


// Start the server

const startServer = async () => {
  try {

    // Start the Express server
    server.listen(PORT);
  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1);
  }
};

startServer();