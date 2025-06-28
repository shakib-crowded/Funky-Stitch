import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  ListGroup,
  Image,
  Form,
  Button,
  Card,
  Container,
  Badge,
} from 'react-bootstrap';
import { FaTrash, FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import { useEffect, useRef } from 'react';
import Message from '../components/Message';
import { addToCart, removeFromCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;
  const cartItemRefs = useRef([]);

  const updateCartHandler = (item, newQty, variant) => {
    if (newQty < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    if (variant && newQty > variant.stock) {
      toast.error(`Only ${variant.stock} items available in stock`);
      return;
    }

    dispatch(addToCart({ ...item, qty: newQty, variant }));
  };

  const removeFromCartHandler = (productId, variantKey) => {
    dispatch(removeFromCart({ productId, variantKey }));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  const getVariantKey = (item) => {
    if (item.variant) {
      return `${item.variant.size}-${item.variant.color}-${item._id}`;
    }
    return item._id;
  };

  const getItemPrice = (item) => {
    return item.variant?.price || item.basePrice || item.price;
  };

  const getDiscountedPrice = (item) => {
    const price = getItemPrice(item);
    return item.discount > 0 ? price * (1 - item.discount / 100) : price;
  };

  useEffect(() => {
    const items = cartItemRefs.current;
    const handleMouseEnter = (el) => {
      el.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
      el.style.transform = 'translateY(-2px)';
    };
    const handleMouseLeave = (el) => {
      el.style.boxShadow = '';
      el.style.transform = '';
    };

    items.forEach((item) => {
      if (item) {
        item.addEventListener('mouseenter', () => handleMouseEnter(item));
        item.addEventListener('mouseleave', () => handleMouseLeave(item));
      }
    });

    return () => {
      items.forEach((item) => {
        if (item) {
          item.removeEventListener('mouseenter', () => handleMouseEnter(item));
          item.removeEventListener('mouseleave', () => handleMouseLeave(item));
        }
      });
    };
  }, [cartItems]);

  return (
    <Container className='py-5'>
      <Row className='mb-4'>
        <Col>
          <Button
            variant='light'
            onClick={() => navigate(-1)}
            className='rounded-circle'
            style={{ width: '40px', height: '40px' }}
          >
            <FaArrowLeft />
          </Button>
          <h2 className='d-inline-block ms-3 mb-0'>Shopping Cart</h2>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {cartItems.length === 0 ? (
            <Card className='border-0 shadow-sm'>
              <Card.Body className='text-center py-5'>
                <Message>
                  Your cart is empty <Link to='/'>Browse products</Link>
                </Message>
              </Card.Body>
            </Card>
          ) : (
            <Card className='border-0'>
              <ListGroup variant='flush'>
                {cartItems.map((item, index) => {
                  const variantKey = getVariantKey(item);
                  const price = getItemPrice(item);
                  const discountedPrice = getDiscountedPrice(item);
                  const itemQty = item.qty || 1; // Ensure quantity is never 0

                  return (
                    <ListGroup.Item
                      key={variantKey || item._id}
                      ref={(el) => (cartItemRefs.current[index] = el)}
                      className='py-3 px-4 mb-2 rounded shadow-sm'
                      style={{ transition: 'all 0.3s ease' }}
                    >
                      <Row className='align-items-center'>
                        <Col xs={3} md={2}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                            className='shadow-sm'
                            style={{ transition: 'transform 0.3s ease' }}
                          />
                        </Col>
                        <Col xs={9} md={4} className='pe-md-0'>
                          <Link
                            to={`/product/${item._id}`}
                            className='text-decoration-none text-dark fw-semibold'
                          >
                            {item.name}
                          </Link>
                          <div className='text-muted small'>{item.brand}</div>
                          {item.variant && (
                            <div className='mt-1'>
                              <Badge bg='light' text='dark' className='me-1'>
                                {item.variant.size?.toUpperCase()}
                              </Badge>
                              <Badge
                                bg='light'
                                text='dark'
                                style={{ backgroundColor: item.variant.color }}
                              >
                                {item.variant.color}
                              </Badge>
                            </div>
                          )}
                        </Col>

                        <Col md={2} className='text-center d-none d-md-block'>
                          {item.discount > 0 ? (
                            <div>
                              <span className='fw-semibold text-danger'>
                                ₹{discountedPrice.toFixed(2)}
                              </span>
                              <div className='text-muted small text-decoration-line-through'>
                                ₹{price.toFixed(2)}
                              </div>
                              <Badge bg='danger' className='ms-2'>
                                -{item.discount}%
                              </Badge>
                            </div>
                          ) : (
                            <span className='fw-semibold'>
                              ₹{price.toFixed(2)}
                            </span>
                          )}
                        </Col>

                        <Col xs={6} md={2}>
                          <Form.Select
                            value={itemQty} // Use the validated quantity
                            onChange={(e) =>
                              updateCartHandler(
                                item,
                                Math.max(Number(e.target.value), 1), // Ensure minimum 1
                                item.variant
                              )
                            }
                            className='shadow-sm'
                            disabled={!item.variant || item.variant.stock <= 0}
                          >
                            {(() => {
                              const maxQty = item.variant
                                ? Math.min(Math.max(1, item.variant.stock), 10)
                                : 1;
                              return Array.from({ length: maxQty }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ));
                            })()}
                          </Form.Select>
                          {item.variant && (
                            <small
                              className={`d-block mt-1 ${
                                item.variant.stock <= 5
                                  ? 'text-danger'
                                  : 'text-muted'
                              }`}
                            >
                              {item.variant.stock} available{' '}
                              {item.variant.stock <= 5 && '(Low stock)'}
                            </small>
                          )}
                        </Col>

                        <Col xs={4} md={1} className='text-center'>
                          <span className='fw-semibold d-block d-md-none'>
                            ₹{(discountedPrice * itemQty).toFixed(2)}
                          </span>
                        </Col>

                        <Col xs={2} md={1} className='text-end'>
                          <Button
                            variant='outline-danger'
                            size='sm'
                            onClick={() =>
                              removeFromCartHandler(item._id, variantKey)
                            }
                            className='p-1'
                          >
                            <FaTrash />
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          <Card
            className='border-0'
            style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)' }}
          >
            <Card.Body>
              <h5 className='mb-3'>Order Summary</h5>
              <ListGroup variant='flush'>
                <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                  <span>
                    Subtotal (
                    {cartItems.reduce((acc, item) => acc + (item.qty || 1), 0)}{' '}
                    items)
                  </span>
                  <span className='fw-semibold'>
                    ₹
                    {cartItems
                      .reduce(
                        (acc, item) =>
                          acc + (item.qty || 1) * getItemPrice(item),
                        0
                      )
                      .toFixed(2)}
                  </span>
                </ListGroup.Item>

                <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                  <span>Discount</span>
                  <span className='text-success'>
                    - ₹
                    {cartItems
                      .reduce((acc, item) => {
                        return (
                          acc +
                          (item.discount > 0
                            ? (item.qty || 1) *
                              getItemPrice(item) *
                              (item.discount / 100)
                            : 0)
                        );
                      }, 0)
                      .toFixed(2)}
                  </span>
                </ListGroup.Item>

                <ListGroup.Item className='d-flex justify-content-between py-3 px-0 border-top'>
                  <span className='fw-bold'>Estimated Total</span>
                  <span className='fw-bold' style={{ fontSize: '1.1rem' }}>
                    ₹
                    {cartItems
                      .reduce(
                        (acc, item) =>
                          acc + (item.qty || 1) * getDiscountedPrice(item),
                        0
                      )
                      .toFixed(2)}
                  </span>
                </ListGroup.Item>
              </ListGroup>

              <Button
                variant='primary'
                size='lg'
                className='w-100 mt-3 py-2'
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed to Checkout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CartScreen;
