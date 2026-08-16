import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    public register = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const userData = req.body;

            const newUser =
                await this.authService.register(userData);

            res.status(201).json(newUser);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Registration failed';

            res.status(400).json({
                message,
            });
        }
    };

    public login = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { email, password } = req.body;

            const token =
                await this.authService.login(
                    email,
                    password
                );

            res.status(200).json({
                token,
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Login failed';

            res.status(401).json({
                message,
            });
        }
    };
}