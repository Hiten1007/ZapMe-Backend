import {Request } from 'express'

export interface AuthPayload {
  userId: number;
  email?: string;
  username?: string;
  password: string; // Password is always included
  
}

export interface AuthenticatedRequest extends Request {
    user?: AuthPayload;
  }
  export interface User {
    userInfo : {
     id: number;
     username: string;
     email: string;
     name: string;
     about: string;
     attributes: string[];
     imageUrl : string
    }
   }