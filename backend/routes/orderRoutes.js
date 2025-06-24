import express from 'express';
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderToShipped, // Add this
  trackOrder, // Add this
  getOrders,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/mine').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/ship').put(protect, admin, updateOrderToShipped); // Add this
router.route('/track/:orderId').get(protect, trackOrder); // Add this

export default router;
