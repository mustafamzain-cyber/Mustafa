import { Order } from '../models/order.model';
import { User } from '../models/user.model';

export class DeliveryService {
    private deliveries: any[] = [];

    constructor() {}

    scheduleDelivery(order: Order, user: User, deliveryTime: Date): void {
        const delivery = {
            orderId: order.id,
            userId: user.id,
            deliveryTime: deliveryTime,
            status: 'Scheduled'
        };
        this.deliveries.push(delivery);
    }

    trackDelivery(orderId: string): any | null {
        return this.deliveries.find(delivery => delivery.orderId === orderId) || null;
    }

    completeDelivery(orderId: string): void {
        const delivery = this.trackDelivery(orderId);
        if (delivery) {
            delivery.status = 'Completed';
        }
    }

    getDeliveriesByUser(userId: string): any[] {
        return this.deliveries.filter(delivery => delivery.userId === userId);
    }
}