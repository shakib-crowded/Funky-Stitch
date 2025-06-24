import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Row,
  Col,
  ListGroup,
  Image,
  Card,
  Button,
  Container,
  Badge,
} from 'react-bootstrap';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
} from '../slices/ordersApiSlice';

const OrderScreen = () => {
  const { id: orderId } = useParams();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const {
    data: paypal,
    isLoading: loadingPayPal,
    error: errorPayPal,
  } = useGetPaypalClientIdQuery();

  useEffect(() => {
    if (!errorPayPal && !loadingPayPal && paypal?.clientId) {
      const loadPaypalScript = async () => {
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': paypal.clientId,
            currency: 'USD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      if (order && !order.isPaid) {
        if (!window.paypal) {
          loadPaypalScript();
        }
      }
    }
  }, [errorPayPal, loadingPayPal, order, paypal, paypalDispatch]);

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        await payOrder({ orderId, details });
        refetch();
        toast.success('Payment successful!');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    });
  }

  function onError(err) {
    toast.error(err.message);
  }

  function createOrder(data, actions) {
    // Calculate the discounted total price
    const discountedTotal =
      order.discount > 0
        ? order.totalPrice - order.itemsPrice * (order.discount / 100)
        : order.totalPrice;

    return actions.order
      .create({
        purchase_units: [
          {
            amount: {
              value: discountedTotal.toFixed(2),
            },
          },
        ],
      })
      .then((orderID) => orderID);
  }

  const deliverHandler = async () => {
    try {
      await deliverOrder(orderId);
      refetch();
      toast.success('Order marked as delivered');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate total savings from discounts
  const calculateTotalSavings = () => {
    if (!order || !order.orderItems) return 0;

    return order.orderItems.reduce((acc, item) => {
      return (
        acc +
        (item.discount > 0 ? item.qty * item.price * (item.discount / 100) : 0)
      );
    }, 0);
  };

  // Calculate discounted items price
  const calculateDiscountedItemsPrice = () => {
    if (!order || !order.orderItems) return 0;

    return order.orderItems.reduce((acc, item) => {
      return (
        acc +
        item.qty *
          (item.discount > 0
            ? item.price * (1 - item.discount / 100)
            : item.price)
      );
    }, 0);
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error.data.message}</Message>;

  const totalSavings = calculateTotalSavings();
  const discountedItemsPrice = calculateDiscountedItemsPrice();

  return (
    <Container className='py-4'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h1 className='fw-bold' style={{ color: '#2c3e50' }}>
          Order #{order._id}
        </h1>
        <div>
          <Badge
            bg={order.isPaid ? 'success' : 'warning'}
            className='fs-6 me-2'
          >
            {order.isPaid ? 'Paid' : 'Pending Payment'}
          </Badge>
          {order.discount > 0 && (
            <Badge bg='danger' className='fs-6'>
              {order.discount}% OFF
            </Badge>
          )}
        </div>
      </div>

      <Row className='g-4'>
        <Col lg={8}>
          <Card className='border-0 shadow-sm mb-4'>
            <Card.Body>
              <div className='mb-4'>
                <h3 className='fw-bold mb-3' style={{ color: '#2c3e50' }}>
                  Shipping Information
                </h3>
                <div className='p-3 bg-light rounded-3'>
                  <p className='mb-1'>
                    <strong>Customer:</strong> {order.user.name}
                  </p>
                  <p className='mb-1'>
                    <strong>Email:</strong>{' '}
                    <a
                      href={`mailto:${order.user.email}`}
                      className='text-decoration-none'
                    >
                      {order.user.email}
                    </a>
                  </p>
                  <p className='mb-0'>
                    <strong>Address:</strong> {order.shippingAddress.address},{' '}
                    {order.shippingAddress.city},{' '}
                    {order.shippingAddress.postalCode},{' '}
                    {order.shippingAddress.country}
                  </p>
                </div>
                <div className='mt-3'>
                  {order.isDelivered ? (
                    <Message variant='success'>
                      Delivered on {formatDate(order.deliveredAt)}
                    </Message>
                  ) : (
                    <Message variant='secondary'>Awaiting delivery</Message>
                  )}
                </div>
              </div>

              <div className='mb-4'>
                <h3 className='fw-bold mb-3' style={{ color: '#2c3e50' }}>
                  Payment Method
                </h3>
                <div className='p-3 bg-light rounded-3'>
                  <p className='mb-0 text-capitalize'>
                    <strong>Method:</strong> {order.paymentMethod}
                  </p>
                </div>
                <div className='mt-3'>
                  {order.isPaid ? (
                    <Message variant='success'>
                      Paid on {formatDate(order.paidAt)}
                    </Message>
                  ) : (
                    <Message variant='secondary'>Awaiting payment</Message>
                  )}
                </div>
              </div>

              <div>
                <h3 className='fw-bold mb-3' style={{ color: '#2c3e50' }}>
                  Order Items
                </h3>
                {order.orderItems.length === 0 ? (
                  <Message>No items in this order</Message>
                ) : (
                  <ListGroup variant='flush'>
                    {order.orderItems.map((item, index) => (
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
                            {item.discount > 0 && (
                              <Badge bg='danger' className='ms-2'>
                                -{item.discount}%
                              </Badge>
                            )}
                          </Col>
                          <Col xs={4} md={4} className='text-end'>
                            <div className='d-flex flex-column'>
                              <span className='text-muted'>
                                {item.qty} ×
                                {item.discount > 0 ? (
                                  <>
                                    <span className='text-decoration-line-through text-muted me-1'>
                                      ₹{item.price.toFixed(2)}
                                    </span>
                                    ₹
                                    {(
                                      item.price *
                                      (1 - item.discount / 100)
                                    ).toFixed(2)}
                                  </>
                                ) : (
                                  ` ₹${item.price.toFixed(2)}`
                                )}
                              </span>
                              <span className='fw-semibold'>
                                = ₹
                                {(
                                  item.qty *
                                  (item.discount > 0
                                    ? item.price * (1 - item.discount / 100)
                                    : item.price)
                                ).toFixed(2)}
                              </span>
                              {item.discount > 0 && (
                                <span className='text-success small'>
                                  Saved ₹
                                  {(
                                    item.qty *
                                    item.price *
                                    (item.discount / 100)
                                  ).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card
            className='border-0 shadow-sm sticky-top'
            style={{ top: '20px' }}
          >
            <Card.Body>
              <h3 className='fw-bold mb-3' style={{ color: '#2c3e50' }}>
                Order Summary
              </h3>

              <ListGroup variant='flush' className='mb-4'>
                <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                  <span>
                    Items (
                    {order.orderItems.reduce((acc, item) => acc + item.qty, 0)})
                  </span>
                  <span>₹{order.itemsPrice.toFixed(2)}</span>
                </ListGroup.Item>

                {/* Discount section */}
                {totalSavings > 0 && (
                  <>
                    <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                      <span>Discount</span>
                      <span className='text-success'>
                        -₹{totalSavings.toFixed(2)}
                      </span>
                    </ListGroup.Item>
                    <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                      <span>Discounted Subtotal</span>
                      <span>₹{discountedItemsPrice.toFixed(2)}</span>
                    </ListGroup.Item>
                  </>
                )}

                <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                  <span>Shipping</span>
                  <span>₹{order.shippingPrice.toFixed(2)}</span>
                </ListGroup.Item>
                <ListGroup.Item className='d-flex justify-content-between py-2 px-0 border-0'>
                  <span>Tax</span>
                  <span>₹{order.taxPrice.toFixed(2)}</span>
                </ListGroup.Item>
                <ListGroup.Item className='d-flex justify-content-between py-3 px-0 border-top'>
                  <span className='fw-bold'>Total</span>
                  <span className='fw-bold' style={{ color: '#FF5252' }}>
                    ₹
                    {order.discount > 0
                      ? (order.totalPrice - totalSavings).toFixed(2)
                      : order.totalPrice.toFixed(2)}
                  </span>
                </ListGroup.Item>
              </ListGroup>

              {/* Show savings if there's discount */}
              {totalSavings > 0 && (
                <div className='text-center text-success small mb-3'>
                  You saved ₹{totalSavings.toFixed(2)} on this order
                </div>
              )}

              {!order.isPaid && (
                <div className='mb-4'>
                  {loadingPay && <Loader />}
                  {isPending ? (
                    <Loader />
                  ) : (
                    <div className='border rounded-3 p-3'>
                      <PayPalButtons
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onError={onError}
                        style={{ layout: 'vertical' }}
                      />
                    </div>
                  )}
                </div>
              )}

              {userInfo?.isAdmin && order.isPaid && !order.isDelivered && (
                <Button
                  variant='primary'
                  size='lg'
                  className='w-100 py-2 fw-medium'
                  onClick={deliverHandler}
                  disabled={loadingDeliver}
                  style={{
                    borderRadius: '8px',
                    backgroundColor: '#FF5252',
                    border: 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loadingDeliver ? <Loader size='sm' /> : 'Mark as Delivered'}
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderScreen;
