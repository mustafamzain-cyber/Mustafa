import { Router } from 'express';
import { OrdersController } from '../controllers/orders.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();
const ordersController = new OrdersController();

router.post('/', authMiddleware, ordersController.createOrder);

router.get('/', authMiddleware, ordersController.getAllOrders);

router.get('/:id', authMiddleware, ordersController.getOrderById);

router.put('/:id', authMiddleware, ordersController.updateOrder);

router.delete('/:id', authMiddleware, ordersController.deleteOrder);

export default router;