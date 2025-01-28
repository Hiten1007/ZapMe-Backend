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