import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  ListGroup,
  Badge,
  Button,
  Container,
  Table,
  Alert,
} from 'react-bootstrap';
import {
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaBox,
  FaShippingFast,
  FaMoneyBillWave,
  FaReceipt,
} from 'react-icons/fa';
import { useGetOrderDetailsQuery } from '../slices/ordersApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

const ViewOrderScreen = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetOrderDetailsQuery(orderId);

  useEffect(() => {
    if (error && error.status === 404) {
      toast.error('Order not found');
      navigate('/order-history');
    } else if (error && error.status === 401) {
      toast.error('Not authorized to view this order');
      navigate('/order-history');
    }
  }, [error, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Order details refreshed');
    } catch (err) {
      toast.error('Failed to refresh order details');
    }
  };

  if (isLoading) return <Loader fullPage />;

  if (error) {
    return (
      <Container className='py-5'>
        <Message variant='danger'>
          {error?.data?.message ||
            error?.error ||
            'Failed to load order details'}
          <div className='mt-3'>
            <Button
              as={Link}
              to='/order-history'
              variant='outline-primary'
              className='me-2'
            >
              Back to Orders
            </Button>
            <Button onClick={handleRefresh} variant='outline-secondary'>
              Retry
            </Button>
          </div>
        </Message>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className='py-5'>
        <Message variant='info'>
          Order not found
          <div className='mt-3'>
            <Button as={Link} to='/order-history' variant='primary'>
              Back to Orders
            </Button>
          </div>
        </Message>
      </Container>
    );
  }

  return (
    <Container className='py-4'>
      <Button
        as={Link}
        to='/order-history'
        variant='light'
        className='mb-4 d-flex align-items-center'
      >
        <FaArrowLeft className='me-2' /> Back to Orders
      </Button>

      <Row>
        <Col md={8}>
          <Card className='mb-4 border-0 shadow-sm'>
            <Card.Header className='bg-white border-0'>
              <h4 className='mb-0'>Order Items</h4>
            </Card.Header>
            <Card.Body>
              {order.orderItems.length === 0 ? (
                <Message variant='info'>No items in this order</Message>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row className='align-items-center'>
                        <Col md={2} className='mb-2 mb-md-0'>
                          <img
                            src={item.image || '/images/default-product.png'}
                            alt={item.name}
                            className='img-fluid rounded'
                            style={{ maxHeight: '60px' }}
                          />
                        </Col>
                        <Col md={4}>
                          <Link to={`/product/${item.product?._id}`}>
                            {item.name}
                          </Link>
                          {item.variant && (
                            <div className='text-muted small mt-1'>
                              Variant: {item.variant.color} /{' '}
                              {item.variant.size}
                            </div>
                          )}
                        </Col>
                        <Col md={2} className='text-center'>
                          {item.qty}
                        </Col>
                        <Col md={4} className='text-end'>
                          ₹{(item.price * item.qty).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>

          <Card className='border-0 shadow-sm'>
            <Card.Header className='bg-white border-0'>
              <h4 className='mb-0'>Personal Details</h4>
            </Card.Header>
            <Card.Body>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <Row>
                    <Col md={4} className='fw-bold'>
                      Name:
                    </Col>
                    <Col md={8}>{order.user?.name}</Col>
                    <Col md={4} className='fw-bold'>
                      Email:
                    </Col>
                    <Col md={8}>{order.user?.email}</Col>
                    <Col md={4} className='fw-bold'>
                      Phone:
                    </Col>
                    <Col md={8}>{order.user?.phone}</Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
          <Card className='border-0 shadow-sm'>
            <Card.Header className='bg-white border-0'>
              <h4 className='mb-0'>Shipping Details</h4>
            </Card.Header>
            <Card.Body>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <Row>
                    <Col md={4} className='fw-bold'>
                      Address:
                    </Col>
                    <Col md={8}>
                      {order.shippingAddress.address},{' '}
                      {order.shippingAddress.city},<br />
                      {order.shippingAddress.state},{' '}
                      {order.shippingAddress.postalCode},<br />
                      {order.shippingAddress.country}
                    </Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className='border-0 shadow-sm mb-4'>
            <Card.Header className='bg-white border-0'>
              <h4 className='mb-0'>Order Summary</h4>
            </Card.Header>
            <Card.Body>
              <ListGroup variant='flush'>
                <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                  <span>Order ID:</span>
                  <span className='text-muted'>{order._id}</span>
                </ListGroup.Item>
                <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                  <span>Date Placed:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </ListGroup.Item>
                <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                  <span>Status:</span>
                  <div>
                    {order.isPaid ? (
                      <Badge bg='success' className='me-2'>
                        <FaCheck className='me-1' /> Paid
                      </Badge>
                    ) : (
                      <Badge bg='warning' text='dark' className='me-2'>
                        <FaTimes className='me-1' /> Pending
                      </Badge>
                    )}
                    {order.isDelivered ? (
                      <Badge bg='success'>
                        <FaCheck className='me-1' /> Delivered
                      </Badge>
                    ) : order.status === 'Shipped' ? (
                      <Badge bg='info'>
                        <FaCheck className='me-1' /> Shipped
                      </Badge>
                    ) : (
                      <Badge bg='secondary'>Processing</Badge>
                    )}
                  </div>
                </ListGroup.Item>
                {order.isPaid && (
                  <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                    <span>Paid On:</span>
                    <span>{formatDate(order.paidAt)}</span>
                  </ListGroup.Item>
                )}
                {order.isDelivered && (
                  <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                    <span>Delivered On:</span>
                    <span>{formatDate(order.deliveredAt)}</span>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className='border-0 shadow-sm'>
            <Card.Header className='bg-white border-0'>
              <h4 className='mb-0'>Payment Summary</h4>
            </Card.Header>
            <Card.Body>
              <Table borderless>
                <tbody>
                  <tr>
                    <td>Items:</td>
                    <td className='text-end'>₹{order.itemsPrice.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Shipping:</td>
                    <td className='text-end'>
                      ₹{order.shippingPrice.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>Tax:</td>
                    <td className='text-end'>₹{order.taxPrice.toFixed(2)}</td>
                  </tr>
                  <tr className='fw-bold'>
                    <td>Total:</td>
                    <td className='text-end'>₹{order.totalPrice.toFixed(2)}</td>
                  </tr>
                </tbody>
              </Table>

              {!order.isPaid && (
                <Alert variant='warning' className='mt-3'>
                  <FaMoneyBillWave className='me-2' />
                  Payment pending for this order
                </Alert>
              )}

              {order.paymentMethod === 'paypal' && order.isPaid && (
                <Alert variant='success' className='mt-3'>
                  <FaReceipt className='me-2' />
                  Paid via PayPal - Transaction ID:{' '}
                  {order.paymentResult?.id || 'N/A'}
                </Alert>
              )}

              {order.status === 'Shipped' && !order.isDelivered && (
                <Alert variant='info' className='mt-3'>
                  <FaShippingFast className='me-2' />
                  Your order is on the way!
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ViewOrderScreen;
