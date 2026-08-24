import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { asyncHandler } from '../middleware/error.middleware';
import logger from '../utils/logger';

export class ReviewController {
    private reviewService: ReviewService;

    constructor() {
        this.reviewService = new ReviewService();
    }

    /**
     * Create a new review
     */
    public createReview = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { orderId, rating, comment, images, driverId } = req.body;

                const review = await this.reviewService.createReview(
                    (req as any).user.id,
                    orderId,
                    rating,
                    comment,
                    images,
                    driverId,
                );

                res.status(201).json({
                    success: true,
                    message: 'Review created successfully',
                    data: review,
                    statusCode: 201,
                });
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Get reviews for an order
     */
    public getOrderReviews = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const reviews = await this.reviewService.getReviewsByOrder(
                    req.params.orderId,
                );

                res.status(200).json({
                    success: true,
                    message: 'Order reviews retrieved successfully',
                    data: reviews,
                    statusCode: 200,
                });
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Get reviews for a driver
     */
    public getDriverReviews = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const page = Number(req.query.page) || 1;
                const limit = Number(req.query.limit) || 10;

                const result = await this.reviewService.getReviewsByDriver(
                    req.params.driverId,
                    page,
                    limit,
                );

                res.status(200).json({
                    success: true,
                    message: 'Driver reviews retrieved successfully',
                    data: result.reviews,
                    averageRating: result.averageRating,
                    totalReviews: result.totalReviews,
                    pagination: result.pagination,
                    statusCode: 200,
                });
            } catch (error) {
                next(error);
            }
        },
    );

    /**
     * Delete review
     */
    public deleteReview = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await this.reviewService.deleteReview(
                    req.params.id,
                    (req as any).user.id,
                );

                res.status(204).send();
            } catch (error) {
                next(error);
            }
        },
    );
}
