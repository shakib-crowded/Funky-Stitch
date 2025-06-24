import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Table,
  Badge,
  Container,
} from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'; // Added missing imports

import { FaTimes, FaCheck, FaEdit, FaHistory } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useProfileMutation } from '../slices/usersApiSlice';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { Link } from 'react-router-dom';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { userInfo } = useSelector((state) => state.auth);
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();
  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    setName(userInfo.name);
    setEmail(userInfo.email);
  }, [userInfo.email, userInfo.name]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await updateProfile({ name, email, password }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success('Profile updated successfully');
        setPassword('');
        setConfirmPassword('');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container className='py-4'>
      <Row className='g-4'>
        <Col lg={4}>
          <Card className='border-0 shadow-sm'>
            <Card.Body>
              <div className='text-center mb-4'>
                <div className='bg-light rounded-circle d-inline-flex p-3 mb-2'>
                  <FaEdit size={32} className='text-primary' />
                </div>
                <h3 className='fw-bold'>Profile Settings</h3>
                <p className='text-muted'>Update your account information</p>
              </div>

              <Form onSubmit={submitHandler}>
                <Form.Group className='mb-3'>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='py-2'
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='Enter email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='py-2'
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Enter new password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='py-2'
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>

                <Form.Group className='mb-4'>
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Confirm new password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='py-2'
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>

                <Button
                  type='submit'
                  variant='primary'
                  className='w-100 py-2 fw-medium'
                  disabled={loadingUpdateProfile}
                  style={{
                    borderRadius: '8px',
                    backgroundColor: '#FF5252',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(255, 82, 82, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loadingUpdateProfile ? (
                    <Loader size='sm' />
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className='border-0 shadow-sm'>
            <Card.Body>
              <div className='d-flex align-items-center mb-4'>
                <div className='bg-light rounded-circle d-inline-flex p-3 me-3'>
                  <FaHistory className='text-primary' />
                </div>
                <div>
                  <h3 className='fw-bold mb-0'>Order History</h3>
                  <p className='text-muted mb-0'>Your recent purchases</p>
                </div>
              </div>

              {isLoading ? (
                <Loader />
              ) : error ? (
                <Message variant='danger'>
                  {error?.data?.message || error.error}
                </Message>
              ) : orders?.length === 0 ? (
                <Message>
                  You haven't placed any orders yet.{' '}
                  <Link to='/'>Start Shopping</Link>
                </Message>
              ) : (
                <div className='table-responsive'>
                  <Table hover className='mb-0'>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
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
                          <td>₹{order.totalPrice.toFixed(2)}</td>
                          <td>
                            <div className='d-flex align-items-center'>
                              {order.isPaid ? (
                                <Badge bg='success' className='me-2'>
                                  <FaCheck className='me-1' /> Paid
                                </Badge>
                              ) : (
                                <Badge
                                  bg='warning'
                                  text='dark'
                                  className='me-2'
                                >
                                  <FaTimes className='me-1' /> Pending
                                </Badge>
                              )}
                              {order.isDelivered ? (
                                <Badge bg='success'>
                                  <FaCheck className='me-1' /> Delivered
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
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileScreen;
