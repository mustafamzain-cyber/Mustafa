import { Review, Order, User } from '../models';
import { IReview } from '../types';
import { NotFoundError, ValidationError, UnauthorizedError } from '../utils/errors';
import logger from '../utils/logger';

export class ReviewService {
    /**
     * Create a new review
     */
    public async createReview(
        customerId: string,
        orderId: string,
        rating: number,
        comment?: string,
        images?: string[],
        driverId?: string,
    ): Promise<any> {
        try {
            // Validate rating
            if (rating < 1 || rating > 5) {
                throw new ValidationError('Rating must be between 1 and 5');
            }

            // Verify order exists and belongs to customer
            const order = await Order.findByPk(orderId);
            if (!order) {
                throw new NotFoundError('Order not found');
            }

            if (order.customerId !== customerId) {
                throw new UnauthorizedError('You can only review your own orders');
            }

            // Check if review already exists
            const existingReview = await Review.findOne({
                where: {
                    orderId,
                    customerId,
                },
            });

            if (existingReview) {
                throw new ValidationError('You have already reviewed this order');
            }

            // Create review
            const review = await Review.create({
                orderId,
                customerId,
                driverId,
                rating,
                comment,
                images: images || [],
            });

            // Update driver rating if applicable
            if (driverId) {
                await this.updateDriverRating(driverId);
            }

            logger.info(`Review created: ${review.id}`);

            return review.toJSON();
        } catch (error) {
            logger.error(
                `Create review error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Get reviews for an order
     */
    public async getReviewsByOrder(orderId: string): Promise<any> {
        try {
            const reviews = await Review.findAll({
                where: { orderId },
                include: [
                    {
                        model: User,
                        as: 'customer',
                        attributes: ['id', 'name', 'avatar'],
                    },
                    {
                        model: User,
                        as: 'driver',
                        attributes: ['id', 'name', 'avatar', 'rating'],
                    },
                ],
                order: [['createdAt', 'DESC']],
            });

            return reviews;
        } catch (error) {
            logger.error(
                `Get order reviews error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Get reviews for a driver
     */
    public async getReviewsByDriver(
        driverId: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<any> {
        try {
            const offset = (page - 1) * limit;

            const { count, rows } = await Review.findAndCountAll({
                where: { driverId },
                include: [
                    {
                        model: User,
                        as: 'customer',
                        attributes: ['id', 'name', 'avatar'],
                    },
                ],
                limit,
                offset,
                order: [['createdAt', 'DESC']],
            });

            const averageRating =
                rows.length > 0
                    ? rows.reduce((sum, r) => sum + r.rating, 0) / rows.length
                    : 0;

            return {
                driverId,
                averageRating: Number(averageRating.toFixed(2)),
                totalReviews: count,
                reviews: rows,
                pagination: {
                    page,
                    limit,
                    total: count,
                    pages: Math.ceil(count / limit),
                },
            };
        } catch (error) {
            logger.error(
                `Get driver reviews error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    /**
     * Update driver rating
     */
    private async updateDriverRating(driverId: string): Promise<void> {
        try {
            const reviews = await Review.findAll({
                where: { driverId },
            });

            if (reviews.length === 0) return;

            const averageRating =
                reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

            const driver = await User.findByPk(driverId);
            if (driver) {
                driver.rating = Number(averageRating.toFixed(2));
                await driver.save();
            }
        } catch (error) {
            logger.error(
                `Update driver rating error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    /**
     * Delete review
     */
    public async deleteReview(
        reviewId: string,
        userId: string,
    ): Promise<boolean> {
        try {
            const review = await Review.findByPk(reviewId);

            if (!review) {
                throw new NotFoundError('Review not found');
            }

            // Check authorization
            if (review.customerId !== userId) {
                throw new UnauthorizedError('You can only delete your own reviews');
            }

            const driverId = review.driverId;
            await review.destroy();

            // Update driver rating
            if (driverId) {
                await this.updateDriverRating(driverId);
            }

            logger.info(`Review deleted: ${reviewId}`);

            return true;
        } catch (error) {
            logger.error(
                `Delete review error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }
}
