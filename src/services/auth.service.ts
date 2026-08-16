import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { database } from '../config/database';

export class AuthService {

    public async register(userData: {
        name?: string;
        email?: string;
        password?: string;
        customerId?: number;
    }): Promise<any> {

        const {
            name,
            email,
            password,
            customerId
        } = userData;

        if (!name) {
            throw new Error('Name is required');
        }

        if (!email) {
            throw new Error('Email is required');
        }

        if (!password) {
            throw new Error('Password is required');
        }

        // Check if email already exists
        const [existingUsers]: any = await database.query(
            `
            SELECT UserID
            FROM dbo.Users
            WHERE Email = :Email
            `,
            {
                replacements: {
                    Email: email
                }
            }
        );

        if (existingUsers.length > 0) {
            throw new Error('Email already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const [result]: any = await database.query(
            `
            INSERT INTO dbo.Users
            (
                CustomerID,
                FullName,
                Email,
                PasswordHash,
                Role,
                IsActive
            )
            OUTPUT
                INSERTED.UserID,
                INSERTED.CustomerID,
                INSERTED.FullName,
                INSERTED.Email,
                INSERTED.Role,
                INSERTED.IsActive,
                INSERTED.CreatedAt,
                INSERTED.UpdatedAt
            VALUES
            (
                :CustomerID,
                :FullName,
                :Email,
                :PasswordHash,
                'customer',
                1
            )
            `,
            {
                replacements: {
                    CustomerID: customerId || null,
                    FullName: name,
                    Email: email,
                    PasswordHash: passwordHash
                }
            }
        );

        return result[0];
    }


    public async login(
        email: string,
        password: string
    ): Promise<string> {

        if (!email || !password) {
            throw new Error(
                'Email and password are required'
            );
        }

        const [users]: any = await database.query(
            `
            SELECT
                UserID,
                CustomerID,
                FullName,
                Email,
                PasswordHash,
                Role,
                IsActive
            FROM dbo.Users
            WHERE Email = :Email
            `,
            {
                replacements: {
                    Email: email
                }
            }
        );

        if (users.length === 0) {
            throw new Error(
                'Invalid email or password'
            );
        }

        const user = users[0];

        if (!user.IsActive) {
            throw new Error(
                'User account is inactive'
            );
        }

        const passwordValid = await bcrypt.compare(
            password,
            user.PasswordHash
        );

        if (!passwordValid) {
            throw new Error(
                'Invalid email or password'
            );
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error(
                'JWT_SECRET is not configured'
            );
        }

        return jwt.sign(
            {
                id: String(user.UserID),
                customerId: user.CustomerID,
                email: user.Email,
                role: user.Role
            },
            secret,
            {
                expiresIn: '24h'
            }
        );
    }
}