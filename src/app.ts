import express from 'express';
import userRoutes from './Routes/UserRoutes';
import { Request, Response} from 'express'
import cors from 'cors'


const app = express();

app.use(cors())


app.use(express.json());

// Middleware for the '/api' route, just sending a welcome message
app.use('/api', (req: Request, res: Response, next) => {
    // Perform some logic here, then call next() to proceed to the next middleware/route
    next(); 
 });

// Use the userRoutes for '/api/users' route
app.use('/api/users' ,userRoutes)

export default app;