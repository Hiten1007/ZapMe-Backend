import { Chat, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();



export const register = async (data: any, senderId: number): Promise<Chat> => {
    console.log(data)
  const receiverId = data;

  if (senderId === receiverId) {
   
    throw new Error("Cannot chat with self");
  }

  // Find an existing one-to-one chat that includes the sender.
  // Note: This query might need refinement to ensure it includes both users.
  let chat = await prisma.chat.findFirst({
    where: {
      isGroup: false,
      users: {
        some: { userId: senderId }
      }
    },
    include: {
      users: true,
      messages: { orderBy: { createdAt: 'asc' } }
    }
  });

  // If chat exists but doesn't include the receiver, add them.
  if (chat && !chat.users.some(u => u.userId === receiverId)) {
    await prisma.chatUser.create({
      data: { chatId: chat.id, userId: receiverId }
    });
  }

  // If no chat exists, create one with both users.
  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        chatId: `${senderId}-${receiverId}`,
        isGroup: false,
        users: {
          create: [
            { userId: senderId },
            { userId: receiverId }
          ]
        }
      },
      include: {
        users: true,
        messages: true
      }
    });
  }

  return chat;
};

export const newMessage = async (chat: Chat, senderId: number, content: string) => {
  try{const newMsg = await prisma.message.create({
    data: {
      content,
      userId: senderId,
      chatId: chat.id
    }
  });
  return newMsg;
}
catch(error){
  console.error(error);
}
};
