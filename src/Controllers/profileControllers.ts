import { PrismaClient } from '@prisma/client'
import {  Response} from 'express'
import { AuthenticatedRequest } from '../interfaces'
import { updateUserInfoSchema } from '../schemas/updateUserInfo'
import axios from 'axios'

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

export const updatePhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if a file was uploaded (Multer populates req.file)
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    console.log("fileis")

    // Convert the file buffer to a base64-encoded string
    const base64Image = req.file.buffer.toString('base64');

    // Prepare form data to send to ImgBB
    const formData = new URLSearchParams();
    formData.append('key', process.env.IMGBB_API_KEY!);  // Ensure your API key is set in .env
    formData.append('image', base64Image);

    // Upload the image to ImgBB
    const imgbbResponse = await axios.post('https://api.imgbb.com/1/upload', formData);

    // Extract the public URL from ImgBB's response
    const imageUrl = imgbbResponse.data?.data?.url;
    if (!imageUrl) {
    res.status(500).json({ message: 'Failed to obtain image URL from ImgBB' });
    return;
    }

    // Update the user's profile image in the database
    const updatedUser = await prisma.user.update({
      where: { id: req.user?.userId },
      data: { imageUrl },
      select: { imageUrl: true }
    });

    res.status(200).json({ updatedUser });
  } catch (error) {
    console.error("Error updating profile photo:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};