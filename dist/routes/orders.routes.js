"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orders_controller_1 = require("../controllers/orders.controller");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const router = (0, express_1.Router)();
const ordersController = new orders_controller_1.OrdersController();
router.post('/', auth_middleware_1.default, ordersController.createOrder);
router.get('/', auth_middleware_1.default, ordersController.getAllOrders);
router.get('/:id', auth_middleware_1.default, ordersController.getOrderById);
router.put('/:id', auth_middleware_1.default, ordersController.updateOrder);
router.delete('/:id', auth_middleware_1.default, ordersController.deleteOrder);
exports.default = router;
