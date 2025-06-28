import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Button,
  Row,
  Col,
  ListGroup,
  Image,
  Card,
  Container,
  Badge,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import Loader from '../components/Loader';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { clearCartItems } from '../slices/cartSlice';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  // Helper function to get item price (considers variant price if exists)
  const getItemPrice = (item) => {
    return item.variant?.price || item.basePrice || item.price;
  };

  // Calculate discount amount
  const calculateDiscount = () => {
    return cart.cartItems.reduce((acc, item) => {
      const price = getItemPrice(item);
      return (
        acc + (item.discount > 0 ? item.qty * price * (item.discount / 100) : 0)
      );
    }, 0);
  };

  const discountAmount = cart.discount ?? calculateDiscount();

  // Calculate items price (before discount)
  const calculateItemsPrice = () => {
    return cart.cartItems.reduce(
      (acc, item) => acc + item.qty * getItemPrice(item),
      0
    );
  };

  const itemsPrice = cart.itemsPrice ?? calculateItemsPrice();

  // Calculate discounted items price
  const calculateDiscountedItemsPrice = () => {
    return cart.cartItems.reduce((acc, item) => {
      const price = getItemPrice(item);
      const discountedPrice =
        item.discount > 0 ? price * (1 - item.discount / 100) : price;
      return acc + item.qty * discountedPrice;
    }, 0);
  };

  const discountedItemsPrice = calculateDiscountedItemsPrice();

  // Calculate total price
  const calculateTotalPrice = () => {
    return (
      discountedItemsPrice + (cart.shippingPrice || 0) + (cart.taxPrice || 0)
    );
  };

  const totalPrice = calculateTotalPrice();

  const formatPrice = (price) => {
    const num = Number(price) || 0;
    return num.toFixed(2);
  };

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems.map((item) => ({
          ...item,
          price: getItemPrice(item), // Ensure we're using the correct price (variant or base)
          variant: item.variant
            ? {
                size: item.variant.size,
                color: item.variant.color,
              }
            : undefined,
        })),
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: itemsPrice,
        shippingPrice: cart.shippingPrice,
        discount: discountAmount,
        taxPrice: cart.taxPrice,
        totalPrice: totalPrice,
      }).unwrap();

      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'An error occurred');
    }
  };

  return (
    <Container className='py-4'>
      <CheckoutSteps step1 step2 step3 step4 />

      <Row className='g-4'>
        <Col lg={8}>
          <Card className='border-0 shadow-sm mb-4'>
            <Card.Body>
              <h3 className='mb-4 fw-bold' style={{ color: '#2c3e50' }}>
                Shipping Details
              </h3>
              <div className='mb-3 p-3 bg-light rounded-3'>
                <p className='mb-1'>
                  <strong>Address:</strong>
                </p>
                <p className='mb-0'>
                  {cart.shippingAddress.address}, {cart.shippingAddress.city},
                  {cart.shippingAddress.postalCode},{' '}
                  {cart.shippingAddress.country}
                </p>
              </div>

              <div className='mb-4 p-3 bg-light rounded-3'>
                <p className='mb-1'>
                  <strong>Payment Method:</strong>
                </p>
                <p className='mb-0 text-capitalize'>{cart.paymentMethod}</p>
              </div>

              <h3 className='mb-3 fw-bold' style={{ color: '#2c3e50' }}>
                Order Items
              </h3>
              {cart.cartItems.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {cart.cartItems.map((item, index) => {
                    const price = getItemPrice(item);
                    const discountedPrice =
                      item.discount > 0
                        ? price * (1 - item.discount / 100)
                        : price;

                    return (
                      <ListGroup.Item
                        key={index}
                        className='py-3 border-bottom'
                      >
                        <Row className='align-items-center'>
                          <Col xs={2} md={1}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              fluid
                              rounded
                              className='shadow-sm'
                            />
                          </Col>
                          <Col xs={6} md={7}>
                            <Link
                              to={`/product/${item.product}`}
                              className='text-decoration-none fw-medium'
                            >
                              {item.name}
                            </Link>
                            {item.variant && (
                              <div className='mt-1'>
                                <Badge bg='light' text='dark' className='me-1'>
                                  {item.variant.size.toUpperCase()}
                                </Badge>
                                <Badge
                                  bg='light'
                                  text='dark'
                                  style={{
                                    backgroundColor: item.variant.color,
                                  }}
                                >
                                  {item.variant.color}
                                </Badge>
                              </div>
                            )}
                            {item.discount > 0 && (
                              <Badge bg='danger' className='ms-2'>
                                {item.discount}% OFF
                              </Badge>
                            )}
                          </Col>
                          <Col xs={4} md={4} className='text-end'>
                            <span className='text-muted'>
                              {item.qty} ×
                              {item.discount > 0 ? (
                                <>
                                  <span className='text-decoration-line-through text-muted me-1'>
                                    ₹{formatPrice(price)}
                                  </span>
                                  ₹{formatPrice(discountedPrice)}
                                </>
                              ) : (
                                `₹${formatPrice(price)}`
                              )}
                              = ₹{formatPrice(item.qty * discountedPrice)}
                            </span>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className='border-0 shadow-sm' style={{ top: '20px' }}>
            <Card.Body>
              <h3 className='mb-3 fw-bold' style={{ color: '#2c3e50' }}>
                Order Summary
              </h3>

              <ListGroup variant='flush'>
                <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                  <span>Items</span>
                  <span>₹{formatPrice(itemsPrice)}</span>
                </ListGroup.Item>

                {discountAmount > 0 && (
                  <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                    <span>Discount</span>
                    <span className='text-success'>
                      -₹{formatPrice(discountAmount)}
                    </span>
                  </ListGroup.Item>
                )}

                <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                  <span>Shipping</span>
                  <span>+₹{formatPrice(cart.shippingPrice)}</span>
                </ListGroup.Item>
                <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                  <span>GST</span>
                  <span>+₹{formatPrice(cart.taxPrice)}</span>
                </ListGroup.Item>

                <ListGroup.Item className='d-flex justify-content-between py-3 px-0 border-top'>
                  <span className='fw-bold'>Total</span>
                  <span className='fw-bold' style={{ color: '#FF5252' }}>
                    ₹{formatPrice(totalPrice)}
                  </span>
                </ListGroup.Item>
              </ListGroup>

              {discountAmount > 0 && (
                <div className='text-center text-success small mt-2'>
                  You saved ₹{formatPrice(discountAmount)} on this order
                </div>
              )}

              {error && (
                <div className='my-3'>
                  <Message variant='danger'>
                    {error?.data?.message ||
                      error?.error ||
                      'An error occurred'}
                  </Message>
                </div>
              )}

              <Button
                variant='primary'
                size='lg'
                className='w-100 mt-3 py-2 fw-medium'
                disabled={cart.cartItems.length === 0 || isLoading}
                onClick={placeOrderHandler}
                style={{
                  borderRadius: '8px',
                  backgroundColor: '#FF5252',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(255, 82, 82, 0.3)',
                  transition: 'all 0.3s ease',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader size='sm' /> Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PlaceOrderScreen;
