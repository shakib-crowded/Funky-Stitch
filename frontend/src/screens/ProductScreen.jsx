import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  Form,
  Badge,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from '../slices/productsApiSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { addToCart } from '../slices/cartSlice';

const ProductScreen = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [isHovered, setIsHovered] = useState(false);
  const [mainImage, setMainImage] = useState('');

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);
  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  // Set default variant when product loads
  useEffect(() => {
    if (product) {
      setMainImage(product.image);
      if (product.variants?.length > 0) {
        setSelectedVariant(product.variants[0]);
        setSelectedSize(product.variants[0].size);
        setSelectedColor(product.variants[0].color);
      }
    }
  }, [product]);

  // Update selected variant when size or color changes
  useEffect(() => {
    if (product?.variants && selectedSize && selectedColor) {
      const variant = product.variants.find(
        (v) =>
          v.size === selectedSize &&
          v.color.toLowerCase() === selectedColor.toLowerCase()
      );

      setSelectedVariant(variant || null);

      // Update the main image when color changes
      const colorImage = getImageForColor(selectedColor);
      setMainImage(colorImage);
    }
  }, [selectedSize, selectedColor, product]);
  const addToCartHandler = () => {
    if (product.variants?.length > 0 && !selectedVariant) {
      toast.error('Please select size and color');
      return;
    }

    // Ensure quantity is at least 1
    const quantity = Math.max(qty, 1);

    const cartItem = {
      ...product, // Include all product fields
      qty: quantity,
      variant: selectedVariant
        ? {
            size: selectedVariant.size,
            color: selectedVariant.color,
            price: selectedVariant.price,
            // sku: selectedVariant.sku,
            stock: selectedVariant.stock,
          }
        : null,
    };

    console.log('Dispatching cart item:', cartItem); // Debug log
    dispatch(addToCart(cartItem));
    navigate('/cart');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success('Review submitted successfully');
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const getMaxQuantity = () => {
    if (!product?.variants?.length) return 1; // Default to 1 if no variants
    if (!selectedVariant) return 0; // No variant selected
    return Math.max(1, Math.min(selectedVariant.stock, 10)); // Ensure at least 1 and max 10
  };

  // Get display price based on selected variant or base price
  const getDisplayPrice = () => {
    const price = selectedVariant?.price || product?.basePrice || 0;
    if (product?.discount > 0) {
      return (price * (1 - product.discount / 100)).toFixed(2);
    }
    return price.toFixed(2);
  };

  // Get original price for discount display
  const getOriginalPrice = () => {
    const price = selectedVariant?.price || product?.basePrice || 0;
    return price.toFixed(2);
  };

  const getImageForColor = (color) => {
    const colorImage = product.images.find(
      (img) => img.color.toLowerCase() === color.toLowerCase()
    );
    return colorImage ? colorImage.url : product.image;
  };

  // Check if product is in stock
  const isInStock = product?.variants?.length
    ? selectedVariant?.stock > 0
    : false; // No variants means not purchasable

  if (isLoading) {
    return (
      <div className='text-center py-5'>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <Message variant='danger'>{error?.data?.message || error.error}</Message>
    );
  }

  return (
    <div className='product-screen'>
      <Meta title={product.name} description={product.description} />

      {/* Product Overview Section */}
      <div className='product-overview bg-white rounded-4 shadow-sm p-4 mb-4'>
        <Row className='g-4'>
          {/* Product Images */}
          <Col lg={6}>
            <div className='product-gallery'>
              <div className='main-image mb-3'>
                <Image
                  src={mainImage || product.image}
                  alt={`${product.name} - ${selectedColor || 'default'}`}
                  fluid
                  className='rounded-3 w-100'
                  style={{ maxHeight: '500px', objectFit: 'contain' }}
                />
              </div>
              {product.images?.length > 0 && (
                <div className='thumbnail-container d-flex gap-2'>
                  {/* Show default product image as first thumbnail */}
                  <Image
                    src={product.image}
                    alt={product.name}
                    className='rounded-2'
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: !selectedColor
                        ? '2px solid #FF5252'
                        : '1px solid #ddd',
                    }}
                    onClick={() => {
                      setMainImage(product.image);
                      setSelectedColor(''); // Reset color selection
                    }}
                  />

                  {/* Show color variant images */}
                  {product.availableColors.map((color) => {
                    const colorImage = getImageForColor(color);
                    return (
                      <Image
                        key={color}
                        src={colorImage}
                        alt={`${product.name} - ${color}`}
                        className='rounded-2'
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border:
                            selectedColor?.toLowerCase() === color.toLowerCase()
                              ? '2px solid #FF5252'
                              : '1px solid #ddd',
                        }}
                        onClick={() => {
                          setSelectedColor(color);
                          setMainImage(colorImage);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </Col>

          {/* Product Info */}
          <Col lg={6}>
            <div className='product-info'>
              <Badge bg='light' text='dark' className='mb-3 fw-normal'>
                {product.category}
              </Badge>
              <h1 className='mb-2 fw-bold' style={{ color: '#FF5252' }}>
                {product.name}
              </h1>
              <p style={{ color: '000' }}>{product.description}</p>

              <div className='d-flex align-items-center mb-3'>
                <Rating value={product.rating} />
                <span className='ms-2 text-muted'>
                  {product.numReviews} reviews
                </span>
                {isInStock ? (
                  <span className='ms-3 text-success'>
                    <i className='fas fa-check-circle me-1'></i> In Stock
                  </span>
                ) : (
                  <span className='ms-3 text-danger'>
                    <i className='fas fa-times-circle me-1'></i> Out of Stock
                  </span>
                )}
              </div>
              {/* Modern Size Selection */}
              {product.availableSizes?.length > 0 && (
                <div className='mb-4'>
                  <h5 className='text-sm font-medium text-gray-700 mb-2'>
                    Select Size
                  </h5>
                  <div className='flex flex-wrap gap-2'>
                    {product.availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-md border transition-all
            ${
              selectedSize === size
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
            }`}
                      >
                        {size.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Modern Color Selection - Improved Visibility */}
              {/* Extra Large Color Selection */}
              {product.availableColors?.length > 0 && (
                <div className='mb-8'>
                  <h5 className='text-lg font-semibold text-gray-900 mb-4'>
                    Select Color
                  </h5>
                  <div className='flex flex-wrap gap-5'>
                    {product.availableColors.map((color) => {
                      const colorImage = getImageForColor(color);
                      return (
                        <button
                          key={color}
                          onClick={() => {
                            setSelectedColor(color);
                            setMainImage(colorImage);
                          }}
                          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all
              ${
                selectedColor?.toLowerCase() === color.toLowerCase()
                  ? 'ring-3 ring-offset-2 ring-[#FF5252] scale-110 shadow-md'
                  : 'hover:ring-3 hover:ring-gray-200'
              }`}
                          style={{
                            backgroundColor: color.toLowerCase(),
                          }}
                          aria-label={color}
                          title={color}
                        >
                          {selectedColor?.toLowerCase() ===
                            color.toLowerCase() && (
                            <svg
                              className='w-8 h-8 text-white'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='3'
                                d='M5 13l4 4L19 7'
                              />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className='mt-4 text-lg font-semibold text-gray-900'>
                    {selectedColor && (
                      <span className='inline-flex items-center'>
                        <span
                          className='w-6 h-6 rounded-full mr-2 inline-block'
                          style={{
                            backgroundColor: selectedColor.toLowerCase(),
                          }}
                        ></span>
                        Selected: {selectedColor}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className='price-container mb-3'>
                {product.discount > 0 ? (
                  <>
                    <span className='badge discount me-2'>
                      -{product.discount}%
                    </span>
                    <span className='current-price fs-3 fw-bold'>
                      ₹{getDisplayPrice()}
                    </span>
                    <span className='original-price text-decoration-line-through text-muted ms-2'>
                      ₹{getOriginalPrice()}
                    </span>
                  </>
                ) : (
                  <span className='current-price fs-3 fw-bold'>
                    ₹{getDisplayPrice()}
                  </span>
                )}
              </div>

              {isInStock && (
                <div className='mb-4'>
                  <div className='d-flex align-items-center mb-2'>
                    <h5 className='mb-0 me-3'>Quantity:</h5>
                    <Form.Control
                      as='select'
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className='w-auto'
                      style={{ maxWidth: '80px' }}
                      disabled={!selectedVariant}
                    >
                      {Array.from(
                        { length: getMaxQuantity() },
                        (_, i) => i + 1
                      ).map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </Form.Control>
                    <small className='ms-2 text-muted'>
                      {selectedVariant?.stock || 0} available
                    </small>
                  </div>
                </div>
              )}

              <Button
                onClick={addToCartHandler}
                size='lg'
                disabled={
                  !isInStock ||
                  (product.variants?.length > 0 && !selectedVariant)
                }
                className='w-100 py-3 mb-3'
                style={{
                  backgroundColor: isHovered ? '#e64545' : '#FF5252',
                  color: 'white',
                  border: 'none',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <i className='fas fa-shopping-cart me-2'></i>
                {isInStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Product Details Tabs */}
      <div className='product-details mb-5'>
        <ul className='nav nav-tabs mb-4'>
          <li className='nav-item'>
            <button
              className={`nav-link ${
                activeTab === 'description' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
          </li>
          <li className='nav-item'>
            <button
              className={`nav-link ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Specifications
            </button>
          </li>
          <li className='nav-item'>
            <button
              className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviews.length})
            </button>
          </li>
        </ul>

        <div className='tab-content p-3 bg-white rounded-3 shadow-sm'>
          {activeTab === 'description' && (
            <div className='product-description'>
              <h4 className='mb-3'>Product Details</h4>
              <p className='text-muted'>{product.description}</p>
              <ul className='list-unstyled'>
                {product.features?.map((feature, index) => (
                  <li key={index}>
                    <i className='fas fa-check text-success me-2'></i>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className='product-specs'>
              <h4 className='mb-3'>Technical Specifications</h4>
              <table className='table'>
                <tbody>
                  {product.specifications?.map((spec, index) => (
                    <tr key={index}>
                      <th width='30%'>{spec.label}</th>
                      <td>{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className='product-reviews'>
              <Row>
                <Col md={8}>
                  <h4 className='mb-4'>Customer Reviews</h4>

                  {product.reviews.length === 0 ? (
                    <Message>No reviews yet. Be the first to review!</Message>
                  ) : (
                    <div className='review-list'>
                      {product.reviews.map((review) => (
                        <div
                          key={review._id}
                          className='review-item mb-4 pb-4 border-bottom'
                        >
                          <div className='d-flex justify-content-between mb-2'>
                            <div>
                              <strong>{review.name}</strong>
                              <Rating value={review.rating} className='ms-2' />
                            </div>
                            <span className='text-muted'>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className='mb-0'>{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className='add-review mt-5'>
                    <h4 className='mb-4'>Write a Review</h4>
                    {loadingProductReview && <Loader />}
                    {userInfo ? (
                      <Form onSubmit={submitHandler}>
                        <Form.Group className='mb-4'>
                          <Form.Label>Your Rating</Form.Label>
                          <div className='rating-stars'>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i
                                key={star}
                                className={`fas fa-star${
                                  star <= rating
                                    ? ' text-warning'
                                    : ' text-muted'
                                }`}
                                style={{
                                  fontSize: '2rem',
                                  cursor: 'pointer',
                                }}
                                onClick={() => setRating(star)}
                              ></i>
                            ))}
                          </div>
                        </Form.Group>

                        <Form.Group className='mb-4'>
                          <Form.Label>Your Review</Form.Label>
                          <Form.Control
                            as='textarea'
                            rows={5}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder='Share your thoughts about this product...'
                          />
                        </Form.Group>

                        <Button
                          type='submit'
                          variant='primary'
                          size='lg'
                          disabled={loadingProductReview || !rating || !comment}
                        >
                          Submit Review
                        </Button>
                      </Form>
                    ) : (
                      <Message>
                        Please <Link to='/login'>sign in</Link> to write a
                        review
                      </Message>
                    )}
                  </div>
                </Col>

                <Col md={4}>
                  <Card className='border-0 shadow-sm'>
                    <Card.Body className='text-center'>
                      <h2 className='display-4 fw-bold text-primary mb-0'>
                        {product.rating.toFixed(1)}
                      </h2>
                      <Rating value={product.rating} className='mb-3' />
                      <p className='text-muted'>
                        Based on {product.numReviews} reviews
                      </p>

                      <div className='rating-distribution mt-4'>
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = product.reviews.filter(
                            (r) => Math.floor(r.rating) === star
                          ).length;
                          const percentage = (count / product.numReviews) * 100;

                          return (
                            <div
                              key={star}
                              className='d-flex align-items-center mb-2'
                            >
                              <span className='me-2'>{star} star</span>
                              <div
                                className='progress flex-grow-1'
                                style={{ height: '8px' }}
                              >
                                <div
                                  className='progress-bar bg-warning'
                                  role='progressbar'
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className='ms-2 text-muted'>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductScreen;
