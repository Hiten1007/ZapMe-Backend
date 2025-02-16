import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { AuthenticatedRequest } from '../interfaces'

const prisma = new PrismaClient()

export const displayZaps = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        const chats = await prisma.chat.findMany({
            where: {
                users: {
                    some: { userId: user?.userId }
                },
                isGroup: false
            },
            orderBy: {
                latestMessageAt: 'desc'  // Order chats by latest message timestamp
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'desc'  // Ensure messages are sorted inside chats
                    },
                    take: 1  // Fetch only the latest message for sorting accuracy
                },
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,  // Get user's ID
                                username: true,  // Get username
                                imageUrl: true , // Get profile image
                                name:true
                            }
                        }
                    }
                }
            }
        });
        
        // Filter out the current user from the users array and return only the other user
        const formattedChats = chats.map(chat => ({
            ...chat,
            otherUser: chat.users
                .map(u => u.user)  // Extract user object
                .find(u => u.id !== user?.userId)  // Get the other user
        }));
        console.log("yes")
        res.status(201).json(formattedChats)
    }
    catch(error) {
        console.error(error)
    }
}

export const displayZapplets = async( req : Request, res : Response) => {
    try{

    }
    catch(error){


    }
}

export const displayarch = async( req: Request, res : Response) => {

    try{

    }
    catch(error){


    }
}

export const displaysearch = async( req : AuthenticatedRequest, res : Response) => {
    try{
        const user = req.user
        const query = req.query.q as string;
        if(!query){
            res.status(400).json({
                message: "Query is required"
            })
        }

        const users = await prisma.user.findMany({
            where: {
                username : {
                    contains : query,
                    mode : 'insensitive'
                },
            },
            take : 5,
            select: {
                id: true,
                username: true,
                imageUrl : true,
                name : true
            }
        })
        const filtered = [...users].filter(u=> u.id !== user?.userId)
        res.status(200).json(filtered)
    }
    catch(error){
        console.error('Error fetching users :  ', error)
        res.status(500).json({ message : "Internal server error"})
    }
}

export const displayImg = async( req : AuthenticatedRequest, res : Response) => {
    try{
        const user = req.user;
        if(!user){
            res.status(400).json({
                message: "Query is required"
            })
        }

        const imgUrl = await prisma.user.findFirst({
            where: { id : user?.userId},
            select: {
             imageUrl : true
            }
        })

        res.status(200).json(imgUrl)
    }
    catch(error){
        console.error('Error fetching users :  ', error)
        res.status(500).json({ message : "Internal server error"})
    }
}

export const getMessages = async (req: Request, res: Response) => {
  try {
    const chatId = parseInt(req.params.chatId);


    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

