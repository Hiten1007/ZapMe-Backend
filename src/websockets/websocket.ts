import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient, Chat } from '@prisma/client';
import { AuthPayload } from '../interfaces'; // Ensure AuthPayload is defined (e.g., { userId: number, ... })

import { newMessage, register } from './zapsocket';
import { addMemberToChat, createGroupChat } from './zappletsocket';

const prisma = new PrismaClient();
console.log("wsHandler loaded");

export const handleWebSocketConnection = (ws: WebSocket, req: IncomingMessage) => {
  console.log("WebSocket upgrade request received.");

  // Manually parse cookies from req.headers.cookie (since upgrade requests bypass Express middleware)
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    console.error("No cookie header found.");
    ws.close();
    return;
  }

  // Very basic cookie parsing (assuming the cookie format "token=JWT")
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
  console.log(`Authenticated WebSocket for user ${senderId}`);

  // Listen for messages from the client
  let chat: Chat | null = null;

  ws.on('message', async (data) => {
    try {
      // Convert RawData to string if needed
      const messageStr = typeof data === 'string' ? data : data.toString();
      console.log(messageStr)
      const message = JSON.parse(messageStr);

      
      switch (message.type) {
        case "register":
          // "register" expects { receiverId, content } in message.data.
          // register() should return a Chat.
          const userId = parseInt(message.userId)
          chat = await register(userId, senderId);
          console.log(chat)
          ws.send(JSON.stringify(chat))
          break;
        case "onemessage":
          // "onemessage" expects that chat is already registered and includes a "content" property.
          // We pass chat, senderId, and message.content.
          console.log(chat)
          if (!chat) {
            console.error("No chat found to send a message.");
            ws.send(JSON.stringify({ error: "Chat not found" }));
            return;
          }
          
          const newmsg = await newMessage(chat, senderId, message.content);
          ws.send(JSON.stringify({ type: 'newMessage', message: newmsg }));
          break;
        case "createGroup":
            // Expect message.data to include an array of member IDs and optionally a groupName.
            // For example: { memberIds: [1, 2, 3], groupName: "Friends" }
            chat = await createGroupChat(message.data.memberIds, message.data.groupName);
            ws.send(JSON.stringify({ type: "groupCreated", chat }));
            break;  
        case "groupMessage":

        chat = await createGroupChat(message.data.memberIds, message.data.groupName);
        ws.send(JSON.stringify({ type: "groupCreated", chat }));
          break;
        case "addMember":
          if (!chat) {
            console.error("No chat found to send a message.");
            ws.send(JSON.stringify({ error: "Chat not found" }));
            return;
          }
          chat = await addMemberToChat(chat.id, message.newUserId)
          ws.send(JSON.stringify({ type: "memberAdded", chat }));
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