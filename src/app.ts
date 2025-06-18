import express from 'express';
import userRoutes from './Routes/UserRoutes';
import chatRoutes from './Routes/chatRoutes'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv';

if (!process.env.RAILWAY_ENV) {
  dotenv.config();
}

const app = express();

app.use(cookieParser())


const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? 'https://zap-me-frontend.vercel.app' : 'http://localhost:5173',
    credentials: true 
  };

app.use(cors(corsOptions))



app.use(express.json());


// Use the userRoutes for '/api/users' route
app.use('/api/users' ,userRoutes)

app.use('/api/content', chatRoutes)

export default app;