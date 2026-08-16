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
exports.connectDatabase = exports.database = void 0;
const sequelize_1 = require("sequelize");
const database = new sequelize_1.Sequelize(process.env.DB_NAME || 'DeliverySystemDB', process.env.DB_USER || 'sa', process.env.DB_PASSWORD || '', {
    host: process.env.DB_HOST || 'DESKTOP-ILQNSIE',
    dialect: 'mssql',
    port: Number(process.env.DB_PORT) || 1433,
    logging: false,
    dialectOptions: {
        options: {
            encrypt: false,
            trustServerCertificate: true,
        },
    },
});
exports.database = database;
const connectDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database.authenticate();
        console.log('Database connection has been established successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
});
exports.connectDatabase = connectDatabase;
