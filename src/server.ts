import dotenv from 'dotenv';
import app from './app'; // Import the configured app
import http from 'http'
import { WebSocketServer } from 'ws'
import { handleWebSocketConnection } from './websockets/websocket';
import { AuthenticatedRequest, AuthPayload } from './interfaces'; 
import { Request } from 'express'
dotenv.config(); // Load environment variables

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);



const wss = new WebSocketServer({ server });



// Handle WebSocket upgrade and connection
wss.on('connection', (ws, req) => {
  handleWebSocketConnection(ws, req as Request);
});


// Start the server

const startServer = async () => {
  try {
    console.log('Connected to the database');  // This will need to be connected to the database before running

    // Start the Express server
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1);
  }
};

startServer();