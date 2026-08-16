"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        res.status(401).json({
            message: 'No token provided'
        });
        return;
    }
    const parts = authorization.split(' ');
    if (parts.length !== 2 ||
        parts[0] !== 'Bearer') {
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
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({
            message: 'Failed to authenticate token'
        });
    }
};
exports.default = authMiddleware;
