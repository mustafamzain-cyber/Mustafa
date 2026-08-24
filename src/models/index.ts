import User from './User';
import Order from './Order';
import Delivery from './Delivery';
import Review from './Review';

// Initialize all models
const initializeModels = async () => {
    try {
        // Sync all models
        await User.sync({ alter: true });
        await Order.sync({ alter: true });
        await Delivery.sync({ alter: true });
        await Review.sync({ alter: true });

        console.log('✅ All models synchronized successfully');
    } catch (error) {
        console.error('❌ Error synchronizing models:', error);
        throw error;
    }
};

export { User, Order, Delivery, Review, initializeModels };
