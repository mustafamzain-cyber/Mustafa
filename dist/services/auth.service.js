"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
class AuthService {
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, customerId } = userData;
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
            const [existingUsers] = yield database_1.database.query(`
            SELECT UserID
            FROM dbo.Users
            WHERE Email = :Email
            `, {
                replacements: {
                    Email: email
                }
            });
            if (existingUsers.length > 0) {
                throw new Error('Email already registered');
            }
            // Hash password
            const passwordHash = yield bcryptjs_1.default.hash(password, 10);
            // Create user
            const [result] = yield database_1.database.query(`
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
            `, {
                replacements: {
                    CustomerID: customerId || null,
                    FullName: name,
                    Email: email,
                    PasswordHash: passwordHash
                }
            });
            return result[0];
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }
            const [users] = yield database_1.database.query(`
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
            `, {
                replacements: {
                    Email: email
                }
            });
            if (users.length === 0) {
                throw new Error('Invalid email or password');
            }
            const user = users[0];
            if (!user.IsActive) {
                throw new Error('User account is inactive');
            }
            const passwordValid = yield bcryptjs_1.default.compare(password, user.PasswordHash);
            if (!passwordValid) {
                throw new Error('Invalid email or password');
            }
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not configured');
            }
            return jsonwebtoken_1.default.sign({
                id: String(user.UserID),
                customerId: user.CustomerID,
                email: user.Email,
                role: user.Role
            }, secret, {
                expiresIn: '24h'
            });
        });
    }
}
exports.AuthService = AuthService;
