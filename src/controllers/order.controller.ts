import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { asyncHandler } from '../middleware/error.middleware';
import logger from '../utils/logger';

export class OrderController {
    private orderService: OrderService;

    constructor() {
        this.orderService = new OrderService();
    }

    /**
     * Create a new order
     */
    public createOrder = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const order = await this.orderService.createOrder(
                    (req as any).user.id,
                    req.body,
                );

                res.status(201).json({
                    success: true,
                    message: 'Order created successfully',
                    data: order,
                    statusCode: 201,
                });
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Get all orders for current user
     */
    public getOrders = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const page = Number(req.query.page) || 1;
                const limit = Number(req.query.limit) || 10;

                const result = await this.orderService.getOrdersForUser(
                    (req as any).user.id,
                    page,
                    limit,
                );

                res.status(200).json({
                    success: true,
                    message: 'Orders retrieved successfully',
                    data: result.data,
                    pagination: result.pagination,
                    statusCode: 200,
                });
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Get order by ID
     */
    public getOrderById = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const order = await this.orderService.getOrderById(
                    req.params.id,
                    (req as any).user.id,
                );

                res.status(200).json({
                    success: true,
                    message: 'Order retrieved successfully',
                    data: order,
                    statusCode: 200,
                });
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Update order
     */
    public updateOrder = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const order = await this.orderService.updateOrder(
                    req.params.id,
                    req.body,
                    (req as any).user.id,
                );

                res.status(200).json({
                    success: true,
                    message: 'Order updated successfully',
                    data: order,
                    statusCode: 200,
                });
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Delete order
     */
    public deleteOrder = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await this.orderService.deleteOrder(
                    req.params.id,
                    (req as any).user.id,
                );

                res.status(204).send();
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Cancel order
     */
    public cancelOrder = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const order = await this.orderService.cancelOrder(
                    req.params.id,
                    (req as any).user.id,
                );

                res.status(200).json({
                    success: true,
                    message: 'Order cancelled successfully',
                    data: order,
                    statusCode: 200,
                });
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Get order statistics
     */
    public getOrderStats = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const stats = await this.orderService.getOrderStats(
                    (req as any).user.id,
                );

                res.status(200).json({
                    success: true,
                    message: 'Order statistics retrieved successfully',
                    data: stats,
                    statusCode: 200,
                });
            } catch (error) {
                next(error);
            }
        },
    );
}
