import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export const errorHandler = (
    error: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    logger.error(error.message);

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            statusCode: error.statusCode,
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        statusCode: 500,
    });
};

export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
