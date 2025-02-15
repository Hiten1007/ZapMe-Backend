import { Chat, Message, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { v4 as uuidv4 } from 'uuid';

export const createGroupChat = async (memberIds: number[], groupName?: string): Promise<Chat> => {
  // Generate a unique chatId using UUID
  const chatIdStr = uuidv4();
  
    const groupChat = await prisma.chat.create({
      data: {
        chatId: chatIdStr,
        isGroup: true,
        groupName: groupName, // Set the custom group name here (or null if not provided)
        users: {
          create: memberIds.map((userId) => ({ userId }))
        }
      },
      include: {
        users: true,
        messages: true
      }
    });
    return groupChat;
  };

  export const addMemberToChat = async (chatId: number, newUserId: number): Promise<Chat> => {
    // Check if the user is already in the chat via the join table
    const existing = await prisma.chatUser.findUnique({
      where: {
        userId_chatId: { userId: newUserId, chatId }
      }
    });
  
    // If the user is not already a member, add them to the chat
    if (!existing) {
      await prisma.chatUser.create({
        data: { chatId, userId: newUserId }
      });
    }
  
    // Query the updated chat with its users.
    // We include the related User data for each ChatUser.
    const updatedChat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        users: {
          include: {
            user: true // Include the User object from the ChatUser relation
          }
        }
      }
    });
  
    if (!updatedChat) {
      throw new Error("Chat not found");
    }
  
    return updatedChat;
  };


export const sendGroupMessage = async (
    chatId: number,
    senderId: number,
    content: string
  ) : Promise<Message> => {
    // Verify sender is a member of the group
    const membership = await prisma.chatUser.findUnique({
      where: { userId_chatId: { userId: senderId, chatId } }
    });
    
    if (!membership) {
      throw new Error("Sender is not a member of this group chat.");
    }
    
    // Save message
    const newMessage = await prisma.message.create({
      data: {
        content,
        userId: senderId,
        chatId
      }
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { latestMessageAt: new Date() }
    });
    
    return newMessage;
};