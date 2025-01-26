import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';
import { userSignupSchema } from "../schemas/userSignUp";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const signUp = async (req: Request, res: Response,) => {
  try {



    const validatedData = userSignupSchema.parse(req.body);

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Create new user in the database
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        name: validatedData.name,
        password: hashedPassword,
      },
    });
    console.log("added")

    // Generate JWT token for the newly created user
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },  // Use newUser here
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Respond with success and the token
    res.status(201).json({
      message: 'User created successfully!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        name: newUser.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

