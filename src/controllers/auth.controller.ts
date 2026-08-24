import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/error.middleware';
import logger from '../utils/logger';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    /**
     * Register a new user
     */
    public register = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const result = await this.authService.register(req.body);

                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    data: result,
                    statusCode: 201,
                });
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Login user
     */
    public login = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { email, password } = req.body;
                const token = await this.authService.login(email, password);

                res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    data: { token },
                    statusCode: 200,
                });
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Get current user profile
     */
    public getProfile = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const user = await this.authService.getUserById(
                    (req as any).user.id,
                );

                res.status(200).json({
                    success: true,
                    message: 'Profile retrieved successfully',
                    data: user,
                    statusCode: 200,
                });
            } catch (error) {
                next(error);
            }
        },
    );
}
