import dotenv from 'dotenv';

dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/orders.routes';
import { connectDatabase } from './config/database';
import authenticate from './middleware/auth.middleware';
import logger from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Frontend
app.use(express.static(path.join(__dirname, '../public')));

// Public authentication routes
app.use('/api/auth', authRoutes);

// Protected order routes
app.use('/api/orders', authenticate, orderRoutes);

// Database connection
connectDatabase()
    .then(() => {
        app.listen(PORT, () => {
            logger.info(
                `Server is running on http://localhost:${PORT}`
            );
        });
    })
    .catch((err: Error) => {
        logger.error(
            'Database connection failed:',
            err.message
        );
    });