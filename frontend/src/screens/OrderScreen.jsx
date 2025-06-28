import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Card, Button, Badge, Container } from 'react-bootstrap';
import { FaCheck, FaTimes, FaHistory } from 'react-icons/fa';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { toast } from 'react-toastify';

const OrderHistoryScreen = () => {
  const {
    data: response, // Changed from 'orders' to 'response'
    isLoading,
    error,
    refetch,
  } = useGetMyOrdersQuery();
  const orders = response?.orders || response || [];

  // Debugging logs
  useEffect(() => {}, [orders, error]);

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
      toast.success('Orders refreshed');
    } catch (err) {
      toast.error('Failed to refresh orders');
    }
  };

  if (isLoading) return <Loader fullPage />;

  if (error) {
    console.error('Order fetch error:', error);
    return (
      <Container className='py-5'>
        <Message variant='danger'>
          {error?.data?.message || error?.error || 'Failed to load orders'}
          <div className='mt-3'>
            <Button onClick={handleRefresh} variant='outline-primary'>
              Retry
            </Button>
          </div>
        </Message>
      </Container>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Container className='py-5'>
        <Message variant='info'>
          You haven't placed any orders yet.
          <div className='mt-3'>
            <Button as={Link} to='/' variant='primary' className='me-2'>
              Start Shopping
            </Button>
            <Button onClick={handleRefresh} variant='outline-secondary'>
              Refresh
            </Button>
          </div>
        </Message>
      </Container>
    );
  }

  return (
    <Container className='py-4'>
      <Card className='border-0 shadow-sm'>
        <Card.Body>
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div className='d-flex align-items-center'>
              <div className='bg-light rounded-circle d-inline-flex p-3 me-3'>
                <FaHistory className='text-primary' size={20} />
              </div>
              <div>
                <h3 className='fw-bold mb-0'>Order History</h3>
                <p className='text-muted mb-0'>Your recent purchases</p>
              </div>
            </div>
            <Button
              variant='outline-secondary'
              size='sm'
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>

          <div className='table-responsive'>
            <Table hover className='mb-0'>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className='text-muted'>
                      {order._id.substring(0, 8)}...
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      {order.orderItems.reduce(
                        (acc, item) => acc + item.qty,
                        0
                      )}
                    </td>
                    <td>₹{order.totalPrice.toFixed(2)}</td>
                    <td>
                      <div className='d-flex align-items-center flex-wrap gap-2'>
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
                    </td>
                    <td>
                      <Button
                        as={Link}
                        to={`/order/${order._id}`}
                        size='sm'
                        variant='outline-primary'
                        className='px-3'
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderHistoryScreen;
