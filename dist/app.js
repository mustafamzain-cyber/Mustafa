"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const orders_routes_1 = __importDefault(require("./routes/orders.routes"));
const database_1 = require("./config/database");
const auth_middleware_1 = __importDefault(require("./middleware/auth.middleware"));
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(body_parser_1.default.json());
// Frontend
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Public authentication routes
app.use('/api/auth', auth_routes_1.default);
// Protected order routes
app.use('/api/orders', auth_middleware_1.default, orders_routes_1.default);
// Database connection
(0, database_1.connectDatabase)()
    .then(() => {
    app.listen(PORT, () => {
        logger_1.default.info(`Server is running on http://localhost:${PORT}`);
    });
})
    .catch((err) => {
    logger_1.default.error('Database connection failed:', err.message);
});
