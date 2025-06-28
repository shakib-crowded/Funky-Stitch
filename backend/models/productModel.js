import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    enum: ['s', 'm', 'l', 'xl'],
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  price: {
    type: Number,
    default: 0,
  },
});

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    images: [
      {
        url: { type: String, required: true },
        color: { type: String }, // Track which color variant this image belongs to
        isVariantMain: { type: Boolean, default: false }, // Mark if this is the main image for a variant
      },
    ],
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    features: [
      {
        type: String,
      },
    ],
    specifications: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    basePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    variants: [variantSchema],
    availableColors: [
      {
        type: String,
      },
    ],
    availableSizes: [
      {
        type: String,
        enum: ['s', 'm', 'l', 'xl'],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// productSchema.virtual('totalStock').get(function () {
//   return this.variants.reduce((sum, variant) => sum + variant.stock, 0);
// });

const Product = mongoose.model('Product', productSchema);

export default Product;
