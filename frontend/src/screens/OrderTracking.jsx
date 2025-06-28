import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  ListGroup,
  Badge,
} from 'react-bootstrap';
import {
  FaSearch,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxOpen,
  FaShoppingBag,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTrackOrderQuery } from '../slices/ordersApiSlice';
import '../assets/styles/OrderTracking.css';
import { toast } from 'react-toastify';

const OrderTrackingScreen = () => {
  const [orderId, setOrderId] = useState('');
  const [submittedId, setSubmittedId] = useState(null);
  const {
    data: order,
    isLoading,
    error,
  } = useTrackOrderQuery(submittedId, {
    skip: !submittedId,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }
    setSubmittedId(orderId.trim());
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Processing: {
        bg: 'warning',
        text: 'dark',
        icon: <FaShoppingBag className='me-1' />,
      },
      Shipped: {
        bg: 'info',
        text: 'white',
        icon: <FaTruck className='me-1' />,
      },
      Delivered: {
        bg: 'success',
        text: 'white',
        icon: <FaCheckCircle className='me-1' />,
      },
      Cancelled: {
        bg: 'danger',
        text: 'white',
        icon: <FaTimesCircle className='me-1' />,
      },
    };

    const currentStatus = statusMap[status] || {
      bg: 'secondary',
      text: 'white',
      icon: <FaBoxOpen className='me-1' />,
    };

    return (
      <Badge
        bg={currentStatus.bg}
        text={currentStatus.text}
        className='d-flex align-items-center'
      >
        {currentStatus.icon} {status}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container className='py-5'>
      <h1 className='text-center mb-4 fw-bold'>Track Your Order</h1>

      <Row className='justify-content-center'>
        <Col md={10} lg={8}>
          <Card className='border-0 shadow-sm mb-4'>
            <Card.Body className='p-4'>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId='orderId'>
                  <Form.Label className='fw-medium'>
                    Enter Order Number
                  </Form.Label>
                  <div className='d-flex gap-2'>
                    <Form.Control
                      type='text'
                      placeholder='e.g. ORD-123456'
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className='py-2'
                    />
                    <Button
                      variant='primary'
                      type='submit'
                      disabled={isLoading || !orderId.trim()}
                      className='py-2 px-4'
                      style={{
                        backgroundColor: '#FF5252',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                      }}
                    >
                      {isLoading ? (
                        <Spinner animation='border' size='sm' />
                      ) : (
                        <>
                          <FaSearch className='me-1' /> Track Order
                        </>
                      )}
                    </Button>
                  </div>
                  <Form.Text className='text-muted'>
                    Find your order number in your confirmation email or order
                    history
                  </Form.Text>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>

          {error && (
            <Alert variant='danger' className='text-center'>
              {error.data?.message ||
                error.error ||
                'Order not found. Please check your order number.'}
              <div className='mt-2'>
                <Button
                  variant='outline-danger'
                  onClick={() => setSubmittedId(null)}
                  className='me-2'
                >
                  Try Again
                </Button>
                <Button as={Link} to='/order-history' variant='outline-primary'>
                  View Order History
                </Button>
              </div>
            </Alert>
          )}
          {order && (
            <Card className='border-0 shadow-sm mb-4'>
              <Card.Body>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                  <div>
                    <h4 className='mb-1'>Order #{order._id}</h4>
                    <p className='text-muted mb-0'>
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                <Row>
                  <Col md={6}>
                    <Card className='border-0 bg-light mb-3'>
                      <Card.Body>
                        <h5 className='mb-3'>Shipping Information</h5>
                        <p className='mb-1'>
                          <strong>{order.shippingAddress.name}</strong>
                        </p>
                        <p className='mb-1'>{order.shippingAddress.address}</p>
                        <p className='mb-1'>
                          {order.shippingAddress.city},{' '}
                          {order.shippingAddress.postalCode}
                        </p>
                        <p className='mb-0'>{order.shippingAddress.country}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className='border-0 bg-light'>
                      <Card.Body>
                        <h5 className='mb-3'>Order Summary</h5>
                        <ListGroup variant='flush'>
                          <ListGroup.Item className='d-flex justify-content-between px-0'>
                            <span>Items:</span>
                            <span>₹{order.itemsPrice}</span>
                          </ListGroup.Item>
                          <ListGroup.Item className='d-flex justify-content-between px-0'>
                            <span>Shipping:</span>
                            <span>₹{order.shippingPrice}</span>
                          </ListGroup.Item>
                          <ListGroup.Item className='d-flex justify-content-between px-0'>
                            <span>Tax:</span>
                            <span>₹{order.taxPrice}</span>
                          </ListGroup.Item>
                          <ListGroup.Item className='d-flex justify-content-between px-0 fw-bold'>
                            <span>Total:</span>
                            <span>₹{order.totalPrice}</span>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {order.trackingNumber && (
                  <Card className='border-0 bg-light mt-3'>
                    <Card.Body>
                      <h5 className='mb-3'>Tracking Information</h5>
                      <p className='mb-1'>
                        <strong>Carrier:</strong>{' '}
                        {order.carrier || 'Standard Shipping'}
                      </p>
                      <p className='mb-0'>
                        <strong>Tracking Number:</strong> {order.trackingNumber}
                      </p>
                    </Card.Body>
                  </Card>
                )}

                <h5 className='mt-4 mb-3'>Order Items</h5>
                <ListGroup variant='flush' className='mb-4'>
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index} className='py-3 border-bottom'>
                      <div className='d-flex align-items-center'>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='rounded me-3'
                          style={{
                            width: '70px',
                            height: '70px',
                            objectFit: 'contain',
                          }}
                        />
                        <div className='flex-grow-1'>
                          <Link
                            to={`/product/${item.product}`}
                            className='text-decoration-none fw-medium'
                          >
                            {item.name}
                          </Link>
                          <div className='text-muted small'>
                            Qty: {item.qty}
                          </div>
                        </div>
                        <div className='text-end'>
                          <div>₹{item.price * item.qty}</div>
                          <div className='text-muted small'>
                            ₹{item.price} each
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>

                <h5 className='mb-3'>Order Status</h5>
                <div className='timeline'>
                  <div
                    className={`timeline-step ${
                      ['Processing', 'Shipped', 'Delivered'].includes(
                        order.status
                      )
                        ? 'completed'
                        : ''
                    }`}
                  >
                    <div className='timeline-icon'>
                      {['Shipped', 'Delivered'].includes(order.status) ? (
                        <FaCheckCircle className='text-success' />
                      ) : (
                        <FaShoppingBag
                          className={
                            order.status === 'Processing'
                              ? 'text-primary'
                              : 'text-muted'
                          }
                        />
                      )}
                    </div>
                    <div className='timeline-content'>
                      <h6>Order Placed</h6>
                      <p className='text-muted small mb-0'>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`timeline-step ${
                      ['Shipped', 'Delivered'].includes(order.status)
                        ? 'completed'
                        : ''
                    }`}
                  >
                    <div className='timeline-icon'>
                      {order.status === 'Delivered' ? (
                        <FaCheckCircle className='text-success' />
                      ) : order.status === 'Shipped' ? (
                        <FaTruck className='text-primary' />
                      ) : (
                        <FaTimesCircle className='text-muted' />
                      )}
                    </div>
                    <div className='timeline-content'>
                      <h6>Shipped</h6>
                      {order.shippedAt ? (
                        <p className='text-muted small mb-0'>
                          {formatDate(order.shippedAt)}
                        </p>
                      ) : (
                        <p className='text-muted small mb-0'>Pending</p>
                      )}
                    </div>
                  </div>

                  <div
                    className={`timeline-step ${
                      order.status === 'Delivered' ? 'completed' : ''
                    }`}
                  >
                    <div className='timeline-icon'>
                      {order.status === 'Delivered' ? (
                        <FaCheckCircle className='text-success' />
                      ) : (
                        <FaTimesCircle className='text-muted' />
                      )}
                    </div>
                    <div className='timeline-content'>
                      <h6>Delivered</h6>
                      {order.deliveredAt ? (
                        <p className='text-muted small mb-0'>
                          {formatDate(order.deliveredAt)}
                        </p>
                      ) : (
                        <p className='text-muted small mb-0'>Pending</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default OrderTrackingScreen;
