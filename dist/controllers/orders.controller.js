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
exports.OrdersController = void 0;
const order_service_1 = require("../services/order.service");
class OrdersController {
    constructor() {
        this.createOrder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const order = yield this.orderService.createOrder(req.body);
                res.status(201).json(order);
            }
            catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : 'Unknown error';
                res.status(500).json({
                    message: 'Error creating order',
                    error: message
                });
            }
        });
        this.getAllOrders = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const orders = yield this.orderService.getOrdersForUser(user);
                res.status(200).json(orders);
            }
            catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : 'Unknown error';
                res.status(500).json({
                    message: 'Error retrieving orders',
                    error: message
                });
            }
        });
        this.getOrderById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const orderId = Number(req.params.id);
                if (Number.isNaN(orderId)) {
                    res.status(400).json({
                        message: 'Invalid order ID'
                    });
                    return;
                }
                const user = req.user;
                const order = yield this.orderService.getOrderByIdForUser(orderId, user);
                if (!order) {
                    res.status(404).json({
                        message: 'Order not found'
                    });
                    return;
                }
                res.status(200).json(order);
            }
            catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : 'Unknown error';
                res.status(500).json({
                    message: 'Error retrieving order',
                    error: message
                });
            }
        });
        this.updateOrder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const orderId = Number(req.params.id);
                if (Number.isNaN(orderId)) {
                    res.status(400).json({
                        message: 'Invalid order ID'
                    });
                    return;
                }
                const user = req.user;
                const order = yield this.orderService.updateOrderForUser(orderId, req.body, user);
                if (!order) {
                    res.status(404).json({
                        message: 'Order not found or access denied'
                    });
                    return;
                }
                res.status(200).json(order);
            }
            catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : 'Unknown error';
                res.status(500).json({
                    message: 'Error updating order',
                    error: message
                });
            }
        });
        this.deleteOrder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const orderId = Number(req.params.id);
                if (Number.isNaN(orderId)) {
                    res.status(400).json({
                        message: 'Invalid order ID'
                    });
                    return;
                }
                const user = req.user;
                const deleted = yield this.orderService.deleteOrderForUser(orderId, user);
                if (!deleted) {
                    res.status(404).json({
                        message: 'Order not found or access denied'
                    });
                    return;
                }
                res.status(204).send();
            }
            catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : 'Unknown error';
                res.status(500).json({
                    message: 'Error deleting order',
                    error: message
                });
            }
        });
        this.orderService = new order_service_1.OrderService();
    }
}
exports.OrdersController = OrdersController;
