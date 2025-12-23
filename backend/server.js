import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cookieParser from 'cookie-parser';


const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://obonguniversityevents1.onrender.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

//Routing

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);


//Connect to MongoDB and start server
mongoose
.connect(MONGO_URI)
.then(()=> {
    console.log('MongoDB connected');

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
