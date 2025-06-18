import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../interfaces';
import { wss } from '../server';
import { newMessage, register } from './zapsocket';
import prisma from '../prisma/config';

export const handleWebSocketConnection = (ws: WebSocket, req: IncomingMessage) => {

  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    console.error("No cookie header found.");
    ws.close();
    return;
  }

  const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookieStr) => {
    const [key, value] = cookieStr.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  const token = cookies.token;
  if (!token) {
    console.error("No token found in cookies.");
    ws.close();
    return;
  }

  let decoded: AuthPayload;
  try {
    decoded = jwt.verify(token, (process.env.JWT_SECRET || "your_secret_key") as string) as AuthPayload;
  } catch (err) {
    console.error("JWT verification failed:", err);
    ws.close();
    return;
  }

  const senderId = decoded.userId;
  (ws as any).userId = senderId;

  ws.on('message', async (data) => {
    try {
      const messageStr = typeof data === 'string' ? data : data.toString();
      const message = JSON.parse(messageStr);

      let chat = null;
      switch (message.type) {
        case "register":
          chat = await register(parseInt(message.userId), senderId);
          ws.send(JSON.stringify({ type: 'register', id: chat.id }));
          break;

          case "onemessage":
            chat = await prisma.chat.findFirst({
              where: {
                chatId: {
                  in: [
                    `${senderId}-${message.userId}`,
                    `${message.userId}-${senderId}`
                  ]
                },
              },
            });
          
            if (!chat) {
              console.error("Chat not found.");
              ws.send(JSON.stringify({ error: "Chat not found" }));
              return;
            }
          
            const newmsg = await newMessage(chat, senderId, message.content);
          
            wss.clients.forEach((client: WebSocket) => {
              if (client.readyState === WebSocket.OPEN) {
          
                if (String((client as any).userId) === String(senderId)) {
                  client.send(JSON.stringify({
                    type: 'onemessage',
                    senderId : 'sender',
                    message: newmsg
                  }));
                }
                if (String((client as any).userId) === String(message.userId)) {
                  client.send(JSON.stringify({
                    type: 'onemessage',
                    senderId : senderId,
                    message: newmsg
                  }));
                }
              }
            });
            break;

        default:
          console.log("Unknown message type");
      }
    } catch (err) {
      console.error("Error processing message:", err);
      ws.send(JSON.stringify({ error: "Failed to process message." }));
    }
  });

};