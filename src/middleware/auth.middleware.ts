import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthUser extends JwtPayload {
    id: string;
    customerId?: number;
    email: string;
    role: 'admin' | 'customer' | 'restaurant' | 'driver';
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {

    const authorization = req.headers.authorization;

    if (!authorization) {
        res.status(401).json({
            message: 'No token provided'
        });
        return;
    }

    const parts = authorization.split(' ');

    if (
        parts.length !== 2 ||
        parts[0] !== 'Bearer'
    ) {
        res.status(401).json({
            message: 'Invalid authorization header'
        });
        return;
    }

    const token = parts[1];

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        res.status(500).json({
            message: 'JWT_SECRET is not configured'
        });
        return;
    }

    try {

        const decoded = jwt.verify(
            token,
            secret
        ) as AuthUser;

        req.user = decoded;

        next();

    } catch (error) {

        res.status(403).json({
            message: 'Failed to authenticate token'
        });
    }
};

export default authMiddleware;