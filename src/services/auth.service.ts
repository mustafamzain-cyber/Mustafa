import jwt from 'jsonwebtoken';
import { User } from '../models';
import { IAuthPayload, IRegisterRequest, ILoginRequest, UserRole } from '../types';
import { ValidationError, ConflictError, UnauthorizedError } from '../utils/errors';
import { validateRegisterRequest, validateLoginRequest } from '../utils/validators';
import logger from '../utils/logger';

export class AuthService {
    private jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    private jwtExpiration = process.env.JWT_EXPIRATION || '24h';

    /**
     * Register a new user
     */
    public async register(data: IRegisterRequest): Promise<Partial<any>> {
        try {
            // Validate input
            validateRegisterRequest(data);

            // Check if user already exists
            const existingUser = await User.findOne({
                where: {
                    email: data.email,
                },
            });

            if (existingUser) {
                throw new ConflictError('Email already registered');
            }

            // Create new user
            const newUser = await User.create({
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone,
                role: data.role || UserRole.CUSTOMER,
                address: data.address,
                city: data.city,
            });

            logger.info(`User registered: ${newUser.id}`);

            // Return user without password
            const { password, ...userWithoutPassword } = newUser.toJSON();
            return userWithoutPassword;
        } catch (error) {
            logger.error(`Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Login user
     */
    public async login(email: string, password: string): Promise<string> {
        try {
            // Validate input
            validateLoginRequest({ email, password });

            // Find user by email
            const user = await User.findOne({
                where: { email },
            });

            if (!user) {
                throw new UnauthorizedError('Invalid email or password');
            }

            // Compare passwords
            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                throw new UnauthorizedError('Invalid email or password');
            }

            // Generate JWT token
            const token = this.generateToken(user.id, user.email, user.role);

            logger.info(`User logged in: ${user.id}`);

            return token;
        } catch (error) {
            logger.error(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Verify JWT token
     */
    public verifyToken(token: string): IAuthPayload {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as IAuthPayload;
            return decoded;
        } catch (error) {
            throw new UnauthorizedError('Invalid or expired token');
        }
    }

    /**
     * Generate JWT token
     */
    private generateToken(userId: string, email: string, role: UserRole): string {
        const payload: IAuthPayload = {
            id: userId,
            email,
            role,
        };

        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiration,
        });
    }

    /**
     * Get user by ID
     */
    public async getUserById(userId: string): Promise<Partial<any>> {
        try {
            const user = await User.findByPk(userId);

            if (!user) {
                throw new Error('User not found');
            }

            return user.toJSON();
        } catch (error) {
            logger.error(`Get user error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
}
