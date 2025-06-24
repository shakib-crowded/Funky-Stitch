import { useState } from 'react';
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
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [isHovered, setIsHovered] = useState(false);
  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate('/cart');
  };

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

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

  return (
    <div className='product-screen'>
      {/* <Link className='btn btn-outline-secondary mb-4' to='/'>
        <i className='fas fa-arrow-left me-2'></i>
      </Link> */}

      {isLoading ? (
        <div className='text-center py-5'>
          <Loader />
        </div>
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta title={product.name} description={product.description} />

          {/* Product Overview Section */}
          <div className='product-overview bg-white rounded-4 shadow-sm p-4 mb-4'>
            <Row className='g-4'>
              {/* Product Images */}
              <Col lg={6}>
                <div className='product-gallery'>
                  <div className='main-image mb-3'>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fluid
                      className='rounded-3 w-100'
                      style={{ maxHeight: '500px', objectFit: 'contain' }}
                    />
                  </div>
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
                    {product.countInStock > 0 && (
                      <span className='ms-3 text-success'>
                        <i className='fas fa-check-circle me-1'></i> In Stock
                      </span>
                    )}
                  </div>

                  <div className='price-container'>
                    {product.discount > 0 ? (
                      <>
                        {product.discount > 0 && (
                          <span className='badge discount'>
                            -{product.discount}% Discount
                          </span>
                        )}
                        <span className='current-price'>
                          &#8377;
                          {(
                            product.price *
                            (1 - product.discount / 100)
                          ).toFixed(2)}
                        </span>
                        <span className='original-price'>
                          &#8377;{product.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className='current-price'>
                        &#8377;{product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className='mb-4'>
                    <div className='d-flex align-items-center mb-2'>
                      <h5 className='mb-0 me-3'>Quantity:</h5>
                      <Form.Control
                        as='select'
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        className='w-auto'
                        style={{ maxWidth: '80px' }}
                      >
                        {[...Array(product.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Form.Control>
                    </div>
                  </div>

                  <Button
                    onClick={addToCartHandler}
                    size='lg'
                    disabled={product.countInStock === 0}
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
                    Add to Cart
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
                  className={`nav-link ${
                    activeTab === 'specs' ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab('specs')}
                >
                  Specifications
                </button>
              </li>
              <li className='nav-item'>
                <button
                  className={`nav-link ${
                    activeTab === 'reviews' ? 'active' : ''
                  }`}
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
                    {product.features.map((feature, index) => (
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
                      {product.specifications.map((spec, index) => (
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
                        <Message>
                          No reviews yet. Be the first to review!
                        </Message>
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
                                  <Rating
                                    value={review.rating}
                                    className='ms-2'
                                  />
                                </div>
                                <span className='text-muted'>
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString()}
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
                              disabled={
                                loadingProductReview || !rating || !comment
                              }
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
                              const percentage =
                                (count / product.numReviews) * 100;

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
                                  <span className='ms-2 text-muted'>
                                    {count}
                                  </span>
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
        </>
      )}

      <style jsx>{`
        .product-screen {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .hover-effect {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          font-weight: 500;
          padding: 12px 20px;
        }
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          border-bottom: 3px solid #ff5252;
          background: transparent;
        }
        .rating-stars i {
          transition: color 0.2s;
        }
      `}</style>
    </div>
  );
};

export default ProductScreen;
