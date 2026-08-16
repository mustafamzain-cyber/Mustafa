"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryService = void 0;
class DeliveryService {
    constructor() {
        this.deliveries = [];
    }
    scheduleDelivery(order, user, deliveryTime) {
        const delivery = {
            orderId: order.id,
            userId: user.id,
            deliveryTime: deliveryTime,
            status: 'Scheduled'
        };
        this.deliveries.push(delivery);
    }
    trackDelivery(orderId) {
        return this.deliveries.find(delivery => delivery.orderId === orderId) || null;
    }
    completeDelivery(orderId) {
        const delivery = this.trackDelivery(orderId);
        if (delivery) {
            delivery.status = 'Completed';
        }
    }
    getDeliveriesByUser(userId) {
        return this.deliveries.filter(delivery => delivery.userId === userId);
    }
}
exports.DeliveryService = DeliveryService;
