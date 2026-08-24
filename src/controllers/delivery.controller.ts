import { Request, Response, NextFunction } from 'express';
import { DeliveryService } from '../services/delivery.service';
import { asyncHandler } from '../middleware/error.middleware';
import { DeliveryStatus } from '../types';
import logger from '../utils/logger';

export class DeliveryController {
    private deliveryService: DeliveryService;

    constructor() {
        this.deliveryService = new DeliveryService();
    }

    /**
     * Create a new delivery
     */
    public createDelivery = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const delivery = await this.deliveryService.createDelivery(
                    req.body,
                );

                res.status(201).json({
                    success: true,
                    message: 'Delivery created successfully',
                    data: delivery,
                    statusCode: 201,
                });
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Get delivery by ID
     */
    public getDelivery = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const delivery = await this.deliveryService.getDeliveryById(
                    req.params.id,
                );

                res.status(200).json({
                    success: true,
                    message: 'Delivery retrieved successfully',
                    data: delivery,
                    statusCode: 200,
                });
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Get deliveries for driver
     */
    public getDriverDeliveries = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const page = Number(req.query.page) || 1;
                const limit = Number(req.query.limit) || 10;
                const status = req.query.status as DeliveryStatus | undefined;

                const result =
                    await this.deliveryService.getDeliveriesForDriver(
                        (req as any).user.id,
                        status,
                        page,
                        limit,
                    );

                res.status(200).json({
                    success: true,
                    message: 'Driver deliveries retrieved successfully',
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
     * Update delivery status
     */
    public updateDelivery = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const delivery =
                    await this.deliveryService.updateDeliveryStatus(
                        req.params.id,
                        req.body,
                        (req as any).user.id,
                    );

                res.status(200).json({
                    success: true,
                    message: 'Delivery updated successfully',
                    data: delivery,
                    statusCode: 200,
                });
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Assign delivery to driver
     */
    public assignDelivery = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { driverId } = req.body;
                const delivery =
                    await this.deliveryService.assignDeliveryToDriver(
                        req.params.id,
                        driverId,
                    );

                res.status(200).json({
                    success: true,
                    message: 'Delivery assigned successfully',
                    data: delivery,
                    statusCode: 200,
                });
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Get delivery statistics
     */
    public getDeliveryStats = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const stats = await this.deliveryService.getDeliveryStats(
                    (req as any).user.id,
                );

                res.status(200).json({
                    success: true,
                    message: 'Delivery statistics retrieved successfully',
                    data: stats,
                    statusCode: 200,
                });
            } catch (error) {
                next(error);
            }
        },
    );
}
