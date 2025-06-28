import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        variant: {
          size: { type: String },
          color: { type: String },
          price: { type: Number },
          // sku: { type: String },
        },
        basePrice: { type: Number }, // Original price before variant pricing
        brand: { type: String },
        category: { type: String },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['COD', 'Credit Card', 'PayPal', 'Bank Transfer'], // Specific payment methods
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
      amount: { type: Number }, // Payment amount captured
      currency: { type: String }, // Payment currency
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    discountAmount: {
      // Total discount applied
      type: Number,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Processing',
        'Shipped',
        'Delivered',
        'Cancelled',
        'Returned',
      ],
      default: 'Pending',
    },
    shippedAt: {
      type: Date,
    },
    trackingNumber: {
      type: String,
    },
    carrier: {
      type: String,
      enum: ['FedEx', 'UPS', 'USPS', 'DHL', 'Local Delivery'],
    },
    notes: {
      // Additional order notes
      type: String,
    },
    couponCode: {
      // Applied coupon/discount code
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Enable virtuals when converting to JSON
    toObject: { virtuals: true }, // Enable virtuals when converting to object
  }
);

// Virtual for order summary
orderSchema.virtual('orderSummary').get(function () {
  return {
    itemsCount: this.orderItems.reduce((acc, item) => acc + item.qty, 0),
    subtotal: this.itemsPrice,
    discount: this.discountAmount,
    shipping: this.shippingPrice,
    tax: this.taxPrice,
    total: this.totalPrice,
  };
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
