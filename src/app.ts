import express from 'express';
import userRoutes from './Routes/UserRoutes';
import chatRoutes from './Routes/chatRoutes'
import { Request, Response} from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'



const app = express();

app.use(cookieParser())


const corsOptions = {
    origin: 'https://zap-me-frontend.vercel.app', // Replace with your frontend's origin
    credentials: true // llow credentials (cookies, authorization headers, etc.)
  };

app.use(cors(corsOptions))



app.use(express.json());

// Middleware for the '/api' route, just sending a welcome message
app.use('/api', (req: Request, res: Response, next) => {
    // Perform some logic here, then call next() to proceed to the next middleware/route
    next(); 
 });

// Use the userRoutes for '/api/users' route
app.use('/api/users' ,userRoutes)

app.use('/api/content', chatRoutes)

export default app;