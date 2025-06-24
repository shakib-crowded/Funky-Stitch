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

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;
  const cartItemRefs = useRef([]);

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  // Apply hover effects manually
  useEffect(() => {
    const handleMouseEnter = (ref) => {
      ref.style.transform = 'translateY(-2px)';
      ref.style.transition = 'all 0.3s ease';
      ref.style.color = '#E64545';
    };

    const handleMouseLeave = (ref) => {
      ref.style.transform = 'translateY(0)';
      ref.style.color = '#FF5252';
    };

    cartItemRefs.current.forEach((ref, index) => {
      if (ref) {
        const enterHandler = () => handleMouseEnter(ref);
        const leaveHandler = () => handleMouseLeave(ref);

        ref.addEventListener('mouseenter', enterHandler);
        ref.addEventListener('mouseleave', leaveHandler);

        // Store the handlers so we can remove them later
        ref._enterHandler = enterHandler;
        ref._leaveHandler = leaveHandler;
      }
    });

    return () => {
      cartItemRefs.current.forEach((ref) => {
        if (ref) {
          ref.removeEventListener('mouseenter', ref._enterHandler);
          ref.removeEventListener('mouseleave', ref._leaveHandler);
        }
      });
    };
  }, [cartItems]);
  return (
    <Container className='py-5'>
      <Button
        variant='outline-secondary'
        onClick={() => navigate(-1)}
        className='mb-4'
      >
        <FaArrowLeft className='me-2' />
        Continue Shopping
      </Button>

      <h2 className='mb-4' style={{ color: '#FF5252' }}>
        <FaShoppingBag className='me-2' />
        Your Shopping Cart
      </h2>

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
                {cartItems.map((item, index) => (
                  <ListGroup.Item
                    key={item._id}
                    ref={(el) => (cartItemRefs.current[index] = el)}
                    className='py-3 px-4 mb-2 rounded shadow-sm'
                    style={{
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <Row className='align-items-center'>
                      <Col xs={3} md={2}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          fluid
                          rounded
                          className='shadow-sm'
                          style={{
                            transition: 'transform 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        />
                      </Col>
                      <Col xs={9} md={4} className='pe-md-0'>
                        <Link
                          to={`/product/&#8377;{item._id}`}
                          className='text-decoration-none text-dark fw-semibold'
                          style={{
                            transition: 'color 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#0d6efd';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#212529';
                          }}
                        >
                          {item.name}
                        </Link>
                        <div className='text-muted small'>{item.brand}</div>
                      </Col>

                      <Col md={2} className='text-center d-none d-md-block'>
                        {item.discount > 0 ? (
                          <div>
                            <span className='fw-semibold text-danger'>
                              ₹
                              {(item.price * (1 - item.discount / 100)).toFixed(
                                2
                              )}
                            </span>
                            <div className='text-muted small text-decoration-line-through'>
                              ₹{item.price.toFixed(2)}
                            </div>
                            <Badge bg='danger' className='ms-2'>
                              -{item.discount}%
                            </Badge>
                          </div>
                        ) : (
                          <span className='fw-semibold'>
                            ₹{item.price.toFixed(2)}
                          </span>
                        )}
                      </Col>

                      <Col xs={6} md={2}>
                        <Form.Select
                          value={item.qty}
                          onChange={(e) =>
                            addToCartHandler(item, Number(e.target.value))
                          }
                          className='shadow-sm'
                          style={{
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {[...Array(item.countInStock).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col xs={4} md={1} className='text-center'>
                        <span className='fw-semibold d-block d-md-none'>
                          &#8377;{(item.price * item.qty).toFixed(2)}
                        </span>
                      </Col>
                      <Col xs={2} md={1} className='text-end'>
                        <Button
                          variant='outline-danger'
                          size='sm'
                          onClick={() => removeFromCartHandler(item._id)}
                          className='p-1'
                          style={{
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          <Card
            className='border-0'
            ref={(el) => (cartItemRefs.current[cartItems.length] = el)}
            style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
              transition: 'all 0.3s ease',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                '0 6px 24px rgba(0, 0, 0, 0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                '0 4px 20px rgba(0, 0, 0, 0.12)';
            }}
          >
            <Card.Body style={{ padding: '1.5rem' }}>
              <h5 className='mb-3' style={{ fontWeight: '600', color: '#333' }}>
                Order Summary
              </h5>
              <ListGroup variant='flush'>
                <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                  <span style={{ color: '#555' }}>
                    Subtotal (
                    {cartItems.reduce((acc, item) => acc + item.qty, 0)} items)
                  </span>
                  <span className='fw-semibold' style={{ color: '#333' }}>
                    ₹
                    {cartItems
                      .reduce((acc, item) => acc + item.qty * item.price, 0)
                      .toFixed(2)}
                  </span>
                </ListGroup.Item>

                {/* Add Discount row if any items have discount */}
                {/* {cartItems.some((item) => item.discount > 0) && (
                  <div className='text-end text-success small mt-2'>
                    You save ₹
                    {cartItems
                      .reduce((acc, item) => {
                        return (
                          acc +
                          (item.discount > 0
                            ? item.qty * item.price * (item.discount / 100)
                            : 0)
                        );
                      }, 0)
                      .toFixed(2)}
                  </div>
                )} */}

                <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                  <span style={{ color: '#555' }}>Discount</span>

                  <span className='text-success'>
                    - &#8377;
                    {cartItems
                      .reduce((acc, item) => {
                        return (
                          acc +
                          (item.discount > 0
                            ? item.qty * item.price * (item.discount / 100)
                            : 0)
                        );
                      }, 0)
                      .toFixed(2)}
                  </span>
                </ListGroup.Item>
                <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                  <span style={{ color: '#555' }}>Shipping</span>
                  <span className='text-danger'>Calculated at checkout</span>
                </ListGroup.Item>
                <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                  <span style={{ color: '#555' }}>Tax</span>
                  <span className='text-danger'>Calculated at checkout</span>
                </ListGroup.Item>
                <ListGroup.Item className='d-flex justify-content-between py-3 px-0 border-top'>
                  <span className='fw-bold' style={{ color: '#333' }}>
                    Estimated Total
                  </span>
                  <span className='fw-bold' style={{ fontSize: '1.1rem' }}>
                    ₹
                    {cartItems
                      .reduce((acc, item) => {
                        const discountedPrice =
                          item.discount > 0
                            ? item.price * (1 - item.discount / 100)
                            : item.price;
                        return acc + item.qty * discountedPrice;
                      }, 0)
                      .toFixed(2)}
                  </span>
                </ListGroup.Item>
              </ListGroup>

              {/* You can also show total savings if you want */}
              {cartItems.some((item) => item.discount > 0) && (
                <div className='text-end text-success small mt-2'>
                  You save ₹
                  {cartItems
                    .reduce((acc, item) => {
                      return (
                        acc +
                        (item.discount > 0
                          ? item.qty * item.price * (item.discount / 100)
                          : 0)
                      );
                    }, 0)
                    .toFixed(2)}
                </div>
              )}

              <Button
                variant='primary'
                size='lg'
                className='w-100 mt-3 py-2'
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
                style={{
                  transition: 'all 0.3s ease',
                  backgroundColor: '#FF5252',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 8px rgba(255, 82, 82, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.backgroundColor = '#E64545';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(255, 82, 82, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = '#FF5252';
                  e.currentTarget.style.boxShadow =
                    '0 2px 8px rgba(255, 82, 82, 0.3)';
                }}
              >
                Proceed to Checkout
              </Button>
            </Card.Body>
          </Card>

          {cartItems.length > 0 && (
            <div className='mt-3 text-center'>
              <Link to='/' className='text-decoration-none'>
                <FaArrowLeft className='me-2' />
                Continue Shopping
              </Link>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CartScreen;
