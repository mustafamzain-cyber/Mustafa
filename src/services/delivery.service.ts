import { Delivery, Order, User } from '../models';
import { ICreateDeliveryRequest, IUpdateDeliveryRequest, DeliveryStatus, OrderStatus } from '../types';
import { NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';

export class DeliveryService {
    /**
     * Create a new delivery
     */
    public async createDelivery(data: ICreateDeliveryRequest): Promise<any> {
        try {
            // Verify order exists
            const order = await Order.findByPk(data.orderId);
            if (!order) {
                throw new NotFoundError('Order not found');
            }

            // Verify driver exists (if provided)
            if (data.driverId) {
                const driver = await User.findByPk(data.driverId);
                if (!driver) {
                    throw new NotFoundError('Driver not found');
                }
            }

            // Create delivery
            const delivery = await Delivery.create({
                orderId: data.orderId,
                driverId: data.driverId,
                pickupLocation: data.pickupLocation,
                deliveryLocation: data.deliveryLocation,
                status: DeliveryStatus.ASSIGNED,
                estimatedTime: data.estimatedTime,
            });

            // Update order status
            order.status = OrderStatus.READY_FOR_DELIVERY;
            await order.save();

            logger.info(`Delivery created: ${delivery.id}`);

            return delivery.toJSON();
        } catch (error) {
            logger.error(
                `Create delivery error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Get delivery by ID
     */
    public async getDeliveryById(deliveryId: string): Promise<any> {
        try {
            const delivery = await Delivery.findByPk(deliveryId, {
                include: [
                    {
                        model: Order,
                        as: 'order',
                    },
                    {
                        model: User,
                        as: 'driver',
                        attributes: ['id', 'name', 'email', 'phone', 'rating'],
                    },
                ],
            });

            if (!delivery) {
                throw new NotFoundError('Delivery not found');
            }

            return delivery.toJSON();
        } catch (error) {
            logger.error(
                `Get delivery error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Get deliveries for a driver
     */
    public async getDeliveriesForDriver(
        driverId: string,
        status?: DeliveryStatus,
        page: number = 1,
        limit: number = 10,
    ): Promise<any> {
        try {
            const offset = (page - 1) * limit;
            const where: any = { driverId };

            if (status) {
                where.status = status;
            }

            const { count, rows } = await Delivery.findAndCountAll({
                where,
                include: [
                    {
                        model: Order,
                        as: 'order',
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
                `Get driver deliveries error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Update delivery status
     */
    public async updateDeliveryStatus(
        deliveryId: string,
        data: IUpdateDeliveryRequest,
        userId: string,
    ): Promise<any> {
        try {
            const delivery = await Delivery.findByPk(deliveryId);

            if (!delivery) {
                throw new NotFoundError('Delivery not found');
            }

            // Check authorization - only driver or admin can update
            if (delivery.driverId !== userId) {
                throw new UnauthorizedError('You are not authorized to update this delivery');
            }

            // Update delivery status
            if (data.status) {
                delivery.status = data.status;

                // Update order status based on delivery status
                const order = await Order.findByPk(delivery.orderId);
                if (order) {
                    if (data.status === DeliveryStatus.IN_TRANSIT) {
                        order.status = OrderStatus.OUT_FOR_DELIVERY;
                        delivery.startTime = new Date();
                    } else if (data.status === DeliveryStatus.DELIVERED) {
                        order.status = OrderStatus.DELIVERED;
                        delivery.completionTime = new Date();
                    } else if (data.status === DeliveryStatus.FAILED) {
                        order.status = OrderStatus.FAILED;
                    }
                    await order.save();
                }
            }

            // Update current location
            if (data.currentLocation) {
                delivery.currentLocation = data.currentLocation;
            }

            // Update rating and feedback
            if (data.rating) {
                delivery.rating = data.rating;
            }
            if (data.feedback) {
                delivery.feedback = data.feedback;
            }

            await delivery.save();

            logger.info(`Delivery updated: ${delivery.id}`);

            return delivery.toJSON();
        } catch (error) {
            logger.error(
                `Update delivery error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Assign delivery to driver
     */
    public async assignDeliveryToDriver(
        deliveryId: string,
        driverId: string,
    ): Promise<any> {
        try {
            const delivery = await Delivery.findByPk(deliveryId);
            if (!delivery) {
                throw new NotFoundError('Delivery not found');
            }

            const driver = await User.findByPk(driverId);
            if (!driver) {
                throw new NotFoundError('Driver not found');
            }

            delivery.driverId = driverId;
            await delivery.save();

            logger.info(`Delivery assigned to driver: ${delivery.id}`);

            return delivery.toJSON();
        } catch (error) {
            logger.error(
                `Assign delivery error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Get delivery statistics
     */
    public async getDeliveryStats(driverId: string): Promise<any> {
        try {
            const deliveries = await Delivery.findAll({
                where: { driverId },
            });

            const totalDeliveries = deliveries.length;
            const completedDeliveries = deliveries.filter(
                (d) => d.status === DeliveryStatus.DELIVERED,
            ).length;
            const failedDeliveries = deliveries.filter(
                (d) => d.status === DeliveryStatus.FAILED,
            ).length;
            const activeDeliveries = deliveries.filter(
                (d) => d.status === DeliveryStatus.IN_TRANSIT,
            ).length;

            const ratings = deliveries
                .filter((d) => d.rating)
                .map((d) => d.rating || 0);
            const averageRating =
                ratings.length > 0
                    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
                    : 0;

            return {
                totalDeliveries,
                completedDeliveries,
                failedDeliveries,
                activeDeliveries,
                averageRating: Number(averageRating.toFixed(2)),
            };
        } catch (error) {
            logger.error(
                `Get delivery stats error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }
}
