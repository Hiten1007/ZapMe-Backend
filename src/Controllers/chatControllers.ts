import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { AuthenticatedRequest } from '../interfaces'

const prisma = new PrismaClient()

export const displayZaps = async (req: Request, res: Response) => {
    try {
        console.log("yes")
        res.status(201).json({message:"yes"})
    }
    catch(error) {

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

export const displaysearch = async( req : Request, res : Response) => {
    try{
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

        res.status(200).json(users)
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