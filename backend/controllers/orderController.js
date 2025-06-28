import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { calcPrices } from '../utils/calcPrices.js';
import { verifyPayPalPayment, checkIfNewTransaction } from '../utils/paypal.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Get products from DB including variants
  const itemsFromDB = await Product.find({
    _id: { $in: orderItems.map((x) => x.productId || x._id) },
  }).lean();

  // Map order items with verified prices and variants
  const dbOrderItems = orderItems.map((itemFromClient) => {
    const matchingProduct = itemsFromDB.find(
      (prod) =>
        prod._id.toString() === (itemFromClient.productId || itemFromClient._id)
    );

    if (!matchingProduct) {
      throw new Error(`Product ${itemFromClient.productId} not found`);
    }

    // For variant products, find the specific variant
    let variantPrice = matchingProduct.basePrice;
    let variantDetails = null;

    if (itemFromClient.variant) {
      const matchedVariant = matchingProduct.variants.find(
        (v) =>
          v.size === itemFromClient.variant.size &&
          v.color === itemFromClient.variant.color
      );

      if (!matchedVariant) {
        throw new Error(
          `Variant not available for product ${matchingProduct._id}`
        );
      }

      variantPrice = matchedVariant.price;
      variantDetails = {
        size: matchedVariant.size,
        color: matchedVariant.color,
        price: matchedVariant.price,
        // sku:
        //   matchedVariant.sku ||
        //   `${matchingProduct._id}-${matchedVariant.size}-${matchedVariant.color}`,
      };
    }

    return {
      ...itemFromClient,
      product: matchingProduct._id,
      name: matchingProduct.name,
      image: matchingProduct.image,
      price: variantPrice,
      basePrice: matchingProduct.basePrice,
      discount: itemFromClient.discount || matchingProduct.discount || 0,
      brand: matchingProduct.brand,
      category: matchingProduct.category,
      variant: variantDetails,
      _id: undefined,
    };
  });

  // Calculate prices with proper variant pricing
  const { itemsPrice, taxPrice, shippingPrice, totalPrice, discountAmount } =
    calcPrices(dbOrderItems);

  const order = new Order({
    orderItems: dbOrderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isDelivered = true;
  order.isPaid = true;
  order.deliveredAt = Date.now();
  order.status = 'Delivered';

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Get order by ID with variant details
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('orderItems.product', 'name images variants');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Verify order ownership or admin status
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(401);
    throw new Error('Not authorized');
  }
  // Structure the response to include only necessary user data
  const response = {
    ...order.toObject(),
    user: {
      _id: order.user._id,
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone, // Include phone in the response
    },
  };

  res.json(response);
});

// @desc    Update order to paid with variant support
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const { verified, value } = await verifyPayPalPayment(req.body.id);
  if (!verified) throw new Error('Payment not verified');

  const isNewTransaction = await checkIfNewTransaction(Order, req.body.id);
  if (!isNewTransaction) throw new Error('Transaction has been used before');

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Verify payment amount matches order total
  const paidCorrectAmount = order.totalPrice.toString() === value;
  if (!paidCorrectAmount) throw new Error('Incorrect amount paid');

  // Update stock for each item (including variants)
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    if (item.variant) {
      // Update variant stock
      const variantIndex = product.variants.findIndex(
        (v) => v.size === item.variant.size && v.color === item.variant.color
      );

      if (variantIndex >= 0) {
        product.variants[variantIndex].stock -= item.qty;
        product.totalStock -= item.qty;
      }
    } else {
      // Update regular product stock
      product.countInStock -= item.qty;
    }

    await product.save();
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'Processing';
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer.email_address,
    amount: value,
    currency: req.body.currency || 'USD',
  };

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Update order to shipped
// @route   PUT /api/orders/:id/ship
// @access  Private/Admin
const updateOrderToShipped = asyncHandler(async (req, res) => {
  const { trackingNumber, carrier } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = 'Shipped';
  order.shippedAt = Date.now();
  order.trackingNumber = trackingNumber;
  order.carrier = carrier;

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'user',
        select: 'name email',
      })
      .populate({
        path: 'orderItems.product',
        select: 'name image price variants',
        model: 'Product', // Explicitly specify the model
      })
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No orders found',
        orders: [],
      });
    }

    // Transform order items for better frontend consumption
    const transformedOrders = orders.map((order) => ({
      ...order,
      orderItems: order.orderItems.map((item) => ({
        ...item,
        product: item.product || null,
        variant: item.variant || null,
        totalPrice: (item.price * item.qty * (1 - item.discount / 100)).toFixed(
          2
        ),
      })),
    }));

    res.json({
      success: true,
      count: transformedOrders.length,
      orders: transformedOrders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
    });
  }
});
// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name')
    .populate('orderItems.product', 'name');
  res.json(orders);
});

// @desc    Track order by ID with variant details
// @route   GET /api/orders/track/:orderId
// @access  Private
const trackOrder = asyncHandler(async (req, res) => {
  // Validate orderId format
  if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
    res.status(400);
    throw new Error('Invalid order ID format');
  }

  const order = await Order.findById(req.params.orderId)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name image price variants');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Verify order ownership or admin status
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(401);
    throw new Error('Not authorized to view this order');
  }

  // Enhanced response with all required fields
  const response = {
    _id: order._id,
    user: {
      _id: order.user._id,
      name: order.user.name,
      email: order.user.email,
    },
    status: order.status,
    createdAt: order.createdAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
    orderItems: order.orderItems.map((item) => ({
      product: item.product?._id,
      name: item.name || item.product?.name,
      image: item.image || item.product?.images?.[0],
      price: item.price,
      qty: item.qty,
      variant: item.variant || undefined,
      _id: item._id,
    })),
    shippingAddress: order.shippingAddress,
    itemsPrice: order.itemsPrice,
    shippingPrice: order.shippingPrice,
    taxPrice: order.taxPrice,
    totalPrice: order.totalPrice,
    isPaid: order.isPaid,
    paidAt: order.paidAt,
    paymentMethod: order.paymentMethod,
  };

  res.json(response);
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order removed' });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export {
  addOrderItems,
  getMyOrders,
  updateOrderToDelivered, // Add this line
  getOrderById,
  updateOrderToPaid,
  updateOrderToShipped,
  trackOrder,
  getOrders,
  deleteOrder,
};
