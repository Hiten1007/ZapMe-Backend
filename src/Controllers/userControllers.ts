import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';
import { userSignupSchema } from "../schemas/userSignUp";
import { userLogInSchema } from "../schemas/userLogIn"
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

export const logIn = async (req: Request, res: Response) => {
  try {
    // Validate the incoming data
    const validatedData = userLogInSchema.parse(req.body);

    // Query the user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username },
        ],
      },
    });

    // If no user is found, return an error
    if (!user) {
       res.status(404).json({ message: "User not found" });
       throw new Error("no user found");
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password" });
      
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie('token', token, {
      httpOnly: true, // Prevent JavaScript access to the cookie
      secure: process.env.NODE_ENV !== 'production', // Use secure cookies in production
      sameSite: 'lax', // Protect against CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // Token expiration (24 hours in ms)
 
    });

    // Respond with success
     res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Zod validation error
       res.status(400).json({ errors: error.errors });
    }

    if (error instanceof Error && error.message === "no user found") {
      // Custom application error
      res.status(404).json({ message: error.message });
    }

    // Catch-all for other errors
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};