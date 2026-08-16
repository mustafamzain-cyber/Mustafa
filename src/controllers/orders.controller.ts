import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

export class OrdersController {

    private orderService: OrderService;

    constructor() {
        this.orderService = new OrderService();
    }

    public createOrder = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const order = await this.orderService.createOrder(req.body);

            res.status(201).json(order);

        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Unknown error';

            res.status(500).json({
                message: 'Error creating order',
                error: message
            });
        }
    };

    public getAllOrders = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {

            const user = req.user as any;

            const orders =
                await this.orderService.getOrdersForUser(user);

            res.status(200).json(orders);

        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Unknown error';

            res.status(500).json({
                message: 'Error retrieving orders',
                error: message
            });
        }
    };

    public getOrderById = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {

            const orderId = Number(req.params.id);

            if (Number.isNaN(orderId)) {
                res.status(400).json({
                    message: 'Invalid order ID'
                });
                return;
            }

            const user = req.user as any;

            const order =
                await this.orderService.getOrderByIdForUser(
                    orderId,
                    user
                );

            if (!order) {
                res.status(404).json({
                    message: 'Order not found'
                });
                return;
            }

            res.status(200).json(order);

        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Unknown error';

            res.status(500).json({
                message: 'Error retrieving order',
                error: message
            });
        }
    };

    public updateOrder = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {

            const orderId = Number(req.params.id);

            if (Number.isNaN(orderId)) {
                res.status(400).json({
                    message: 'Invalid order ID'
                });
                return;
            }

            const user = req.user as any;

            const order =
                await this.orderService.updateOrderForUser(
                    orderId,
                    req.body,
                    user
                );

            if (!order) {
                res.status(404).json({
                    message: 'Order not found or access denied'
                });
                return;
            }

            res.status(200).json(order);

        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Unknown error';

            res.status(500).json({
                message: 'Error updating order',
                error: message
            });
        }
    };

    public deleteOrder = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {

            const orderId = Number(req.params.id);

            if (Number.isNaN(orderId)) {
                res.status(400).json({
                    message: 'Invalid order ID'
                });
                return;
            }

            const user = req.user as any;

            const deleted =
                await this.orderService.deleteOrderForUser(
                    orderId,
                    user
                );

            if (!deleted) {
                res.status(404).json({
                    message: 'Order not found or access denied'
                });
                return;
            }

            res.status(204).send();

        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Unknown error';

            res.status(500).json({
                message: 'Error deleting order',
                error: message
            });
        }
    };
}