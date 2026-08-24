import { Order, User, Delivery } from '../models';
import { ICreateOrderRequest, IUpdateOrderRequest, OrderStatus } from '../types';
import { ValidationError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { validateCreateOrderRequest } from '../utils/validators';
import logger from '../utils/logger';

export class OrderService {
    /**
     * Create a new order
     */
    public async createOrder(
        customerId: string,
        data: ICreateOrderRequest,
    ): Promise<any> {
        try {
            // Validate input
            validateCreateOrderRequest(data);

            // Calculate total amount
            const totalAmount = data.items.reduce(
                (sum, item) => sum + item.totalPrice,
                0,
            );

            // Create order
            const order = await Order.create({
                customerId,
                items: data.items,
                totalAmount,
                paymentMethod: data.paymentMethod,
                paymentStatus: 'pending',
                status: OrderStatus.PENDING,
                notes: data.notes,
            });

            logger.info(`Order created: ${order.id}`);

            return order.toJSON();
        } catch (error) {
            logger.error(
                `Create order error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Get all orders for a user
     */
    public async getOrdersForUser(
        userId: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<any> {
        try {
            const offset = (page - 1) * limit;

            const { count, rows } = await Order.findAndCountAll({
                where: { customerId: userId },
                include: [
                    {
                        model: Delivery,
                        as: 'delivery',
                    },
                ],
                limit,
                offset,
                order: [['createdAt', 'DESC']],
            });

            return {
                data: rows,
                pagination: {
                    page,
                    limit,
                    total: count,
                    pages: Math.ceil(count / limit),
                },
            };
        } catch (error) {
            logger.error(
                `Get orders error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Get order by ID
     */
    public async getOrderById(
        orderId: string,
        userId?: string,
    ): Promise<any> {
        try {
            const order = await Order.findByPk(orderId, {
                include: [
                    {
                        model: Delivery,
                        as: 'delivery',
                    },
                ],
            });

            if (!order) {
                throw new NotFoundError('Order not found');
            }

            // Check authorization
            if (userId && order.customerId !== userId) {
                throw new UnauthorizedError('You do not have access to this order');
            }

            return order.toJSON();
        } catch (error) {
            logger.error(
                `Get order error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Update order
     */
    public async updateOrder(
        orderId: string,
        data: IUpdateOrderRequest,
        userId?: string,
    ): Promise<any> {
        try {
            const order = await Order.findByPk(orderId);

            if (!order) {
                throw new NotFoundError('Order not found');
            }

            // Check authorization
            if (userId && order.customerId !== userId) {
                throw new UnauthorizedError('You do not have access to this order');
            }

            // Update order
            if (data.status) order.status = data.status;
            if (data.notes) order.notes = data.notes;
            if (data.paymentStatus) order.paymentStatus = data.paymentStatus;

            await order.save();

            logger.info(`Order updated: ${order.id}`);

            return order.toJSON();
        } catch (error) {
            logger.error(
                `Update order error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Delete order
     */
    public async deleteOrder(orderId: string, userId?: string): Promise<boolean> {
        try {
            const order = await Order.findByPk(orderId);

            if (!order) {
                throw new NotFoundError('Order not found');
            }

            // Check authorization
            if (userId && order.customerId !== userId) {
                throw new UnauthorizedError('You do not have access to this order');
            }

            // Only allow deleting pending orders
            if (order.status !== OrderStatus.PENDING) {
                throw new ValidationError('Can only delete pending orders');
            }

            await order.destroy();

            logger.info(`Order deleted: ${orderId}`);

            return true;
        } catch (error) {
            logger.error(
                `Delete order error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Cancel order
     */
    public async cancelOrder(orderId: string, userId?: string): Promise<any> {
        try {
            const order = await Order.findByPk(orderId);

            if (!order) {
                throw new NotFoundError('Order not found');
            }

            // Check authorization
            if (userId && order.customerId !== userId) {
                throw new UnauthorizedError('You do not have access to this order');
            }

            // Check if order can be cancelled
            const canBeCancelled = [
                OrderStatus.PENDING,
                OrderStatus.CONFIRMED,
                OrderStatus.PROCESSING,
            ].includes(order.status);

            if (!canBeCancelled) {
                throw new ValidationError('Order cannot be cancelled in its current status');
            }

            order.status = OrderStatus.CANCELLED;
            await order.save();

            logger.info(`Order cancelled: ${orderId}`);

            return order.toJSON();
        } catch (error) {
            logger.error(
                `Cancel order error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Get order statistics
     */
    public async getOrderStats(userId: string): Promise<any> {
        try {
            const orders = await Order.findAll({
                where: { customerId: userId },
            });

            const totalOrders = orders.length;
            const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
            const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
            const completedOrders = orders.filter(
                (o) => o.status === OrderStatus.DELIVERED,
            ).length;
            const cancelledOrders = orders.filter(
                (o) => o.status === OrderStatus.CANCELLED,
            ).length;

            return {
                totalOrders,
                totalSpent,
                averageOrderValue,
                completedOrders,
                cancelledOrders,
            };
        } catch (error) {
            logger.error(
                `Get order stats error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }
}
