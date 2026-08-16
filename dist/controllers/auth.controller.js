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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    constructor() {
        this.register = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = req.body;
                const newUser = yield this.authService.register(userData);
                res.status(201).json(newUser);
            }
            catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : 'Registration failed';
                res.status(400).json({
                    message,
                });
            }
        });
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const token = yield this.authService.login(email, password);
                res.status(200).json({
                    token,
                });
            }
            catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : 'Login failed';
                res.status(401).json({
                    message,
                });
            }
        });
        this.authService = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
