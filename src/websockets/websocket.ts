import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient, Chat } from '@prisma/client';
import { AuthPayload } from '../interfaces';
import { wss } from '../server';
import { newMessage, register } from './zapsocket';
import { addMemberToChat, createGroupChat } from './zappletsocket';

const prisma = new PrismaClient();
console.log("wsHandler loaded");

export const handleWebSocketConnection = (ws: WebSocket, req: IncomingMessage) => {
  console.log("WebSocket upgrade request received.");

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
  console.log("Token:", token);

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
  console.log(`Authenticated WebSocket for user ${senderId}`);

  ws.on('message', async (data) => {
    try {
      const messageStr = typeof data === 'string' ? data : data.toString();
      console.log(messageStr);
      const message = JSON.parse(messageStr);

      let chat: Chat | null = null;
      wss.clients.forEach((client: WebSocket) => {
        console.log("Connected client:", (client as any).userId);
      });
      switch (message.type) {
        case "register":
          chat = await register(parseInt(message.userId), senderId);
          console.log(chat);
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
                isGroup: false
              },
            });
          
            if (!chat) {
              console.error("Chat not found.");
              ws.send(JSON.stringify({ error: "Chat not found" }));
              return;
            }
          
            const newmsg = await newMessage(chat, senderId, message.content);
            console.log('New message created:', newmsg);
          
            console.log("Sender ID:", senderId);
            console.log("Recipient ID (from message.userId):", message.userId);
          
            // Broadcast the message to both the sender and the recipient
            wss.clients.forEach((client: WebSocket) => {
              if (client.readyState === WebSocket.OPEN) {
                // Log each client's userId
                console.log("Client userId:", (client as any).userId);
          
                // Send to the sender
                if (String((client as any).userId) === String(senderId)) {
                  console.log("Sending message to sender:", senderId);
                  client.send(JSON.stringify({
                    type: 'onemessage',
                    message: newmsg
                  }));
                }
                // Send to the recipient
                if (String((client as any).userId) === String(message.userId)) {
                  console.log("Sending message to recipient:", message.userId);
                  client.send(JSON.stringify({
                    type: 'onemessage',
                    message: newmsg
                  }));
                }
              }
            });
            break;

        case "createGroup":
          chat = await createGroupChat(message.data.memberIds, message.data.groupName);
          ws.send(JSON.stringify({ type: "groupCreated", chat }));
          break;

        case "groupMessage":
          chat = await prisma.chat.findUnique({
            where: { chatId: message.chatId },
          });

          if (!chat) {
            console.error("Group chat not found.");
            ws.send(JSON.stringify({ error: "Group chat not found" }));
            return;
          }

          const groupMsg = await newMessage(chat, senderId, message.content);
          ws.send(JSON.stringify({ type: 'groupMessage', message: groupMsg }));
          break;

        case "addMember":
          chat = await prisma.chat.findUnique({
            where: { chatId: message.chatId },
          });

          if (!chat) {
            console.error("Chat not found.");
            ws.send(JSON.stringify({ error: "Chat not found" }));
            return;
          }

          chat = await addMemberToChat(chat.id, message.newUserId);
          ws.send(JSON.stringify({ type: "memberAdded", chat }));
          break;

        default:
          console.log("Unknown message type");
      }
    } catch (err) {
      console.error("Error processing message:", err);
      ws.send(JSON.stringify({ error: "Failed to process message." }));
    }
  });

  ws.on('close', () => {
    console.log(`WebSocket connection closed for user ${senderId}`);
  });
};