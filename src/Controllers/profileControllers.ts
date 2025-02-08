import { PrismaClient } from '@prisma/client'
import {  Response} from 'express'
import { AuthenticatedRequest } from '../interfaces'
import { updateUserInfoSchema } from '../schemas/updateUserInfo'

const prisma = new PrismaClient()

export const showProfile = async (req : AuthenticatedRequest, res : Response) => {
    try{
        const user = req.user;

        const userInfo = await prisma.user.findFirst({
            where :{ id : user?.userId}
        })
        console.log("yes")
        res.status(200).json({
            userInfo
        })
        console.log("yes")
    }
    catch(error){
        res.status(500).json({
            messgae:"Internal server error"
        })
    }
   
}


export const updateAbout = async (req : AuthenticatedRequest, res : Response) => {
    try{
        const user = req.user; // Assuming `req.user` contains the authenticated user
        const { about } = req.body; // Get `about` from request body

        if (!about) {
             res.status(400).json({ message: "About section cannot be empty" });
        }
       

        const updatedUser = await prisma.user.update({
            where: { id: user?.userId },
            data: { about },
            select: { about: true }, // Select only `about`
        });

        res.status(200).json({updatedUser});
    } catch (error) {
        console.error("Error updating about:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const updateUserInfo = async (req : AuthenticatedRequest, res : Response) => {
    try{
        const user = req.user; // Assuming `req.user` contains the authenticated user
        const { username, name, attributes } = updateUserInfoSchema.parse(req.body)// Get `about` from request body

       

        const updatedUser = await prisma.user.update({
            where: { id: user?.userId },
            data: { username,
                name,
                attributes,
             },
            select: { name: true }, // Select only `about`
        });

        res.status(200).json({updatedUser});
    } catch (error) {
        console.error("Error updating about:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}