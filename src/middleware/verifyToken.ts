import {  Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload, AuthenticatedRequest } from '../interfaces';


export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  
  const token = req.cookies.token;
  if (!token) {
     res.status(401).json({ message: 'Unauthorized: No token provided' });
     return;
  }


  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
     res.status(403).json({ message: 'Invalid token' });
     console.error(error)
     return;
  }
};