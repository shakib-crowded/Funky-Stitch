import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Table,
  Button,
  Card,
  Container,
  Row,
  Col,
  Modal,
  Badge,
} from 'react-bootstrap';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  useGetOrdersQuery,
  useDeleteOrderMutation,
  useUpdateOrderStatusMutation,
} from '../../slices/ordersApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Paginate from '../../components/Paginate';
import Meta from '../../components/Meta';

const AdminOrderScreen = () => {
  const { pageNumber = 1 } = useParams();
  const navigate = useNavigate();

  // State for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // API queries
  const { data, isLoading, error, refetch } = useGetOrdersQuery({ pageNumber });

  const [deleteOrder, { isLoading: loadingDelete }] = useDeleteOrderMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  // Extract orders - handle both array and object responses
  const orders = Array.isArray(data) ? data : data?.orders || [];
  const pages = data?.pages || 1;
  const page = data?.page || 1;

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle order deletion
  const deleteHandler = async (id) => {
    try {
      await deleteOrder(id).unwrap();
      toast.success('Order deleted successfully');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete order');
    }
    setShowDeleteModal(false);
  };

  // Handle status update
  const statusUpdateHandler = async (orderId, newStatus) => {
    try {
      await updateOrderStatus({ orderId, status: newStatus }).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusMap = {
      Processing: 'warning',
      Shipped: 'info',
      Delivered: 'success',
      Cancelled: 'danger',
      Pending: 'secondary',
    };

    return <Badge bg={statusMap[status] || 'light'}>{status}</Badge>;
  };

  return (
    <Container className='py-4'>
      <Meta title='Admin Orders' />

      <Row className='align-items-center mb-4'>
        <Col>
          <h1 className='mb-0'>Order Management</h1>
        </Col>
        <Col xs='auto'>
          <Button
            variant='outline-secondary'
            onClick={() => navigate(-1)}
            className='d-flex align-items-center'
          >
            <FaArrowLeft className='me-1' /> Back
          </Button>
        </Col>
      </Row>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Card className='shadow-sm mb-4'>
            <Card.Body className='p-0'>
              <Table striped hover responsive className='mb-0'>
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>CUSTOMER</th>
                    <th>DATE</th>
                    <th>TOTAL</th>
                    <th>PAID</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order._id}>
                        <td>{order._id.substring(0, 8)}...</td>
                        <td>
                          {order.user?.name || 'Guest'}
                          {order.user?.email && (
                            <div className='text-muted small'>
                              {order.user.email}
                            </div>
                          )}
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>₹{order.totalPrice.toFixed(2)}</td>
                        <td>
                          {order.isPaid ? (
                            <Badge bg='success'>
                              {order.paidAt ? formatDate(order.paidAt) : 'Paid'}
                            </Badge>
                          ) : (
                            <Badge bg='danger'>
                              <FaTimes /> Not Paid
                            </Badge>
                          )}
                        </td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                        <td>
                          <div className='d-flex gap-2'>
                            <Button
                              as={Link}
                              to={`/admin/orders/${order._id}`}
                              variant='info'
                              size='sm'
                              title='View Details'
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant='danger'
                              size='sm'
                              onClick={() => {
                                setOrderToDelete(order._id);
                                setShowDeleteModal(true);
                              }}
                              title='Delete Order'
                              disabled={loadingDelete}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan='7' className='text-center'>
                        <Message variant='info'>No orders found</Message>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Pagination */}
          {pages > 1 && (
            <div className='mt-3'>
              <Paginate pages={pages} page={page} isAdmin={true} />
            </div>
          )}
        </>
      )}

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
            onClick={() => deleteHandler(orderToDelete)}
            disabled={loadingDelete}
          >
            {loadingDelete ? 'Deleting...' : 'Delete Order'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminOrderScreen;
