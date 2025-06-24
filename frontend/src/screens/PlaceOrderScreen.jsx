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

  // Calculate discount if not already in cart state
  const calculateDiscount = () => {
    return cart.cartItems.reduce((acc, item) => {
      return (
        acc +
        (item.discount > 0 ? item.qty * item.price * (item.discount / 100) : 0)
      );
    }, 0);
  };

  const discountAmount = cart.discount ?? calculateDiscount();

  // Calculate discounted items price
  const calculateDiscountedItemsPrice = () => {
    return cart.cartItems.reduce((acc, item) => {
      const discountedPrice =
        item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
      return acc + item.qty * discountedPrice;
    }, 0);
  };

  const discountedItemsPrice = cart.itemsPrice - discountAmount;

  // Ensure prices are numbers and format them
  const formatPrice = (price) => {
    const num = Number(price) || 0;
    return num.toFixed(2);
  };

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        discount: discountAmount,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice - discountAmount, // Apply discount to total
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
                  {cart.cartItems.map((item, index) => (
                    <ListGroup.Item key={index} className='py-3 border-bottom'>
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
                                  ₹{formatPrice(item.price)}
                                </span>
                                ₹
                                {formatPrice(
                                  item.price * (1 - item.discount / 100)
                                )}
                              </>
                            ) : (
                              `₹${formatPrice(item.price)}`
                            )}
                            = ₹
                            {formatPrice(
                              item.qty *
                                (item.discount > 0
                                  ? item.price * (1 - item.discount / 100)
                                  : item.price)
                            )}
                          </span>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card
            className='border-0 shadow-sm sticky-top'
            style={{ top: '20px' }}
          >
            <Card.Body>
              <h3 className='mb-3 fw-bold' style={{ color: '#2c3e50' }}>
                Order Summary
              </h3>

              <ListGroup variant='flush'>
                <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                  <span>Items</span>
                  <span>₹{formatPrice(cart.itemsPrice)}</span>
                </ListGroup.Item>

                {/* Add Discount row if there's any discount */}
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
                    ₹{formatPrice(cart.totalPrice - discountAmount)}
                  </span>
                </ListGroup.Item>
              </ListGroup>

              {/* Show savings if there's discount */}
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
