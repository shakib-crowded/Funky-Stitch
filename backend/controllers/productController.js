import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
// productController.js
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT || 8;
  const page = Number(req.query.pageNumber) || 1;

  let query = {};
  const keyword = req.query.keyword;

  if (keyword) {
    const searchTerms = keyword.split(' ');
    const orConditions = [];
    const andConditions = [];

    searchTerms.forEach((term) => {
      if (term.includes(':')) {
        // Handle advanced queries like "category:summer"
        const [field, value] = term.split(':');
        andConditions.push({ [field]: { $regex: value, $options: 'i' } });
      } else {
        // Regular search across multiple fields
        orConditions.push(
          { name: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } },
          { category: { $regex: term, $options: 'i' } },
          { brand: { $regex: term, $options: 'i' } },
          { tags: { $regex: term, $options: 'i' } }
        );
      }
    });

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }
  }

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  // NOTE: checking for valid ObjectId to prevent CastError moved to separate
  // middleware. See README for more info.

  const product = await Product.findById(req.params.id);
  if (product) {
    return res.json(product);
  } else {
    // NOTE: this will run if a valid ObjectId but no product was found
    // i.e. product may be null
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    basePrice: 0,
    discount: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    images: [],
    brand: 'Sample brand',
    category: 'Sample category',
    description: 'Sample description',
    features: ['Sample feature 1', 'Sample feature 2'],
    specifications: [
      { label: 'Material', value: 'Sample Material' },
      { label: 'Weight', value: '0 kg' },
    ],
    variants: [],
    availableSizes: ['s', 'm', 'l', 'xl'],
    availableColors: ['black', 'white', 'blue', 'red'],
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    basePrice,
    discount,
    description,
    image,
    images,
    brand,
    category,
    features,
    specifications,
    variants,
    availableSizes,
    availableColors,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.basePrice = basePrice;
    product.discount = discount;
    product.description = description;
    product.image = image;
    product.images = (images || []).map((img) => ({
      url: img.url,
      color: img.color || null,
      isVariantMain: img.isVariantMain || false,
    }));
    product.brand = brand;
    product.category = category;
    product.features = (features || []).filter((f) => f.trim() !== '');
    product.specifications = (specifications || []).filter(
      (spec) => spec.label.trim() !== '' && spec.value.trim() !== ''
    );
    product.variants = variants || [];
    product.availableSizes = availableSizes || [];
    product.availableColors = availableColors || [];

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Add variant images to product
// @route   POST /api/products/:id/variant-images
// @access  Private/Admin
const addVariantImages = asyncHandler(async (req, res) => {
  const { color, images } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Add new images with color info
  const newImages = images.map((img) => ({
    url: img,
    color: color,
    isVariantMain: false,
  }));

  // Set first image as main for this color if none exists
  const hasMainForColor = product.images.some(
    (img) => img.color === color && img.isVariantMain
  );
  if (!hasMainForColor && newImages.length > 0) {
    newImages[0].isVariantMain = true;
  }

  product.images = [...product.images, ...newImages];
  await product.save();

  res.status(200).json(product);
});

// @desc    Set main image for a color variant
// @route   PUT /api/products/:id/variant-main-image
// @access  Private/Admin
const setVariantMainImage = asyncHandler(async (req, res) => {
  const { color, imageUrl } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Reset all isVariantMain for this color
  product.images = product.images.map((img) => ({
    ...img,
    isVariantMain: img.color === color ? false : img.isVariantMain,
  }));

  // Set the new main image
  const imageIndex = product.images.findIndex(
    (img) => img.url === imageUrl && img.color === color
  );

  if (imageIndex >= 0) {
    product.images[imageIndex].isVariantMain = true;
    await product.save();
    res.status(200).json(product);
  } else {
    res.status(400);
    throw new Error('Image not found for this color variant');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);

  res.json(products);
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  addVariantImages,
  setVariantMainImage,
};
