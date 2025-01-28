import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload, AuthenticatedRequest } from '../interfaces';

const JWT_SECRET = process.env.JWT_SECRET as string; // Ensure JWT_SECRET is not undefined




export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.jwtToken; // Read the token from cookies

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next(); // Proceed to the next middleware or route
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};