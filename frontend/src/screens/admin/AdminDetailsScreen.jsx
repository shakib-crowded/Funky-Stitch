import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Button,
  Badge,
  Alert,
  Form,
  Modal,
} from 'react-bootstrap';
import {
  FaCheck,
  FaTimes,
  FaTruck,
  FaBox,
  FaArrowLeft,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetOrderDetailsQuery,
  useDeliverOrderMutation,
  useShipOrderMutation,
  useDeleteOrderMutation,
} from '../../slices/ordersApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Meta from '../../components/Meta';

const AdminOrderDetailsScreen = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  // State for shipping modal
  const [showShipModal, setShowShipModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('FedEx');

  // State for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // API queries
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetOrderDetailsQuery(orderId);

  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();
  const [shipOrder, { isLoading: loadingShip }] = useShipOrderMutation();
  const [deleteOrder, { isLoading: loadingDelete }] = useDeleteOrderMutation();

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle mark as delivered
  const deliverHandler = async () => {
    try {
      await deliverOrder(orderId);
      toast.success('Order marked as delivered');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // Handle mark as shipped
  const shipHandler = async () => {
    try {
      await shipOrder({ orderId, trackingNumber, carrier });
      toast.success('Order marked as shipped');
      setShowShipModal(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // Handle delete order
  const deleteHandler = async () => {
    try {
      await deleteOrder(orderId);
      toast.success('Order deleted successfully');
      navigate('/admin/orderlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
    setShowDeleteModal(false);
  };

  if (isLoading) return <Loader />;

  if (error) {
    return (
      <Container className='py-5'>
        <Message variant='danger'>
          {error?.data?.message || error.error}
          <div className='mt-3'>
            <Button as={Link} to='/admin/orderlist' variant='outline-primary'>
              Back to Orders
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
            <Button as={Link} to='/admin/orderlist' variant='primary'>
              Back to Orders
            </Button>
          </div>
        </Message>
      </Container>
    );
  }

  return (
    <Container className='py-4'>
      <Meta title={`Order ${order._id}`} />

      <Row className='mb-4'>
        <Col>
          <Button
            as={Link}
            to='/admin/orderlist'
            variant='light'
            className='d-flex align-items-center'
          >
            <FaArrowLeft className='me-2' /> Back to Orders
          </Button>
        </Col>
        <Col xs='auto'>
          <div className='d-flex gap-2'>
            <Button
              variant='danger'
              onClick={() => setShowDeleteModal(true)}
              disabled={loadingDelete}
            >
              <FaTrash className='me-1' /> Delete Order
            </Button>
          </div>
        </Col>
      </Row>

      <Row className='mb-4'>
        <Col>
          <h2 className='mb-0'>Order #{order._id}</h2>
          <p className='text-muted mb-0'>
            Placed on {formatDate(order.createdAt)}
          </p>
        </Col>
        <Col xs='auto'>
          <Badge
            bg={
              order.status === 'Delivered'
                ? 'success'
                : order.status === 'Shipped'
                ? 'info'
                : order.status === 'Processing'
                ? 'warning'
                : order.status === 'Cancelled'
                ? 'danger'
                : 'secondary'
            }
            className='fs-6'
          >
            {order.status}
          </Badge>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className='mb-4 shadow-sm'>
            <Card.Header>
              <h5 className='mb-0'>Order Items</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant='flush'>
                {order.orderItems.map((item, index) => (
                  <ListGroup.Item key={index}>
                    <Row className='align-items-center'>
                      <Col md={2}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='img-fluid rounded'
                          style={{ maxHeight: '60px' }}
                        />
                      </Col>
                      <Col md={4}>
                        {console.log('Product: ', item)}
                        <Link to={`/product/${item.product._id}`}>
                          {item.name}
                        </Link>
                        {item.variant && (
                          <div className='text-muted small mt-1'>
                            Variant: {item.variant.color} / {item.variant.size}
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
            </Card.Body>
          </Card>

          <Card className='shadow-sm'>
            <Card.Header>
              <h5 className='mb-0'>Shipping Information</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <Row>
                    <Col md={4} className='fw-bold'>
                      Name:
                    </Col>
                    <Col md={8}>{order.user?.name}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col md={4} className='fw-bold'>
                      Address:
                    </Col>
                    <Col md={8}>
                      {order.shippingAddress.address},{' '}
                      {order.shippingAddress.city}
                      <br />
                      {order.shippingAddress.state},{' '}
                      {order.shippingAddress.postalCode}
                      <br />
                      {order.shippingAddress.country}
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col md={4} className='fw-bold'>
                      Phone:
                    </Col>
                    <Col md={8}>{order.user?.phone}</Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className='mb-4 shadow-sm'>
            <Card.Header>
              <h5 className='mb-0'>Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant='flush'>
                <ListGroup.Item className='d-flex justify-content-between'>
                  <span>Status:</span>
                  <span>
                    <Badge
                      bg={
                        order.status === 'Delivered'
                          ? 'success'
                          : order.status === 'Shipped'
                          ? 'info'
                          : order.status === 'Processing'
                          ? 'warning'
                          : order.status === 'Cancelled'
                          ? 'danger'
                          : 'secondary'
                      }
                    >
                      {order.status}
                    </Badge>
                  </span>
                </ListGroup.Item>
                <ListGroup.Item className='d-flex justify-content-between'>
                  <span>Payment:</span>
                  <span>
                    {order.isPaid ? (
                      <Badge bg='success'>
                        Paid on {formatDate(order.paidAt)}
                      </Badge>
                    ) : (
                      <Badge bg='danger'>Not Paid</Badge>
                    )}
                  </span>
                </ListGroup.Item>
                {order.paymentMethod && (
                  <ListGroup.Item className='d-flex justify-content-between'>
                    <span>Method:</span>
                    <span>{order.paymentMethod}</span>
                  </ListGroup.Item>
                )}
                {order.trackingNumber && (
                  <ListGroup.Item className='d-flex justify-content-between'>
                    <span>Tracking:</span>
                    <span>{order.trackingNumber}</span>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className='mb-4 shadow-sm'>
            <Card.Header>
              <h5 className='mb-0'>Payment Summary</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant='flush'>
                <ListGroup.Item className='d-flex justify-content-between'>
                  <span>Items:</span>
                  <span>₹{order.itemsPrice.toFixed(2)}</span>
                </ListGroup.Item>
                <ListGroup.Item className='d-flex justify-content-between'>
                  <span>Shipping:</span>
                  <span>₹{order.shippingPrice.toFixed(2)}</span>
                </ListGroup.Item>
                <ListGroup.Item className='d-flex justify-content-between'>
                  <span>Tax:</span>
                  <span>₹{order.taxPrice.toFixed(2)}</span>
                </ListGroup.Item>
                <ListGroup.Item className='d-flex justify-content-between fw-bold'>
                  <span>Total:</span>
                  <span>₹{order.totalPrice.toFixed(2)}</span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Order Actions */}
          <Card className='shadow-sm'>
            <Card.Header>
              <h5 className='mb-0'>Order Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className='d-grid gap-2'>
                {!order.isDelivered && (
                  <>
                    {order.status !== 'Shipped' && (
                      <Button
                        variant='info'
                        onClick={() => setShowShipModal(true)}
                        disabled={loadingShip}
                      >
                        <FaTruck className='me-2' />
                        {loadingShip ? 'Processing...' : 'Mark as Shipped'}
                      </Button>
                    )}
                    {order.status === 'Shipped' && (
                      <Button
                        variant='success'
                        onClick={deliverHandler}
                        disabled={loadingDeliver}
                      >
                        <FaCheck className='me-2' />
                        {loadingDeliver ? 'Processing...' : 'Mark as Delivered'}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ship Order Modal */}
      <Modal show={showShipModal} onHide={() => setShowShipModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ship Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Carrier</Form.Label>
              <Form.Select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              >
                <option value='FedEx'>FedEx</option>
                <option value='UPS'>UPS</option>
                <option value='USPS'>USPS</option>
                <option value='DHL'>DHL</option>
                <option value='Local Delivery'>Local Delivery</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Tracking Number</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter tracking number'
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowShipModal(false)}>
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={shipHandler}
            disabled={loadingShip}
          >
            {loadingShip ? 'Processing...' : 'Confirm Shipping'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this order? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant='danger'
            onClick={deleteHandler}
            disabled={loadingDelete}
          >
            {loadingDelete ? 'Deleting...' : 'Delete Order'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminOrderDetailsScreen;
