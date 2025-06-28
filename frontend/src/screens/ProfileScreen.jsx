import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Tab, Tabs, Alert } from 'react-bootstrap';
import { FaUser, FaHistory, FaLock, FaMapMarkerAlt } from 'react-icons/fa';
import Loader from '../components/Loader';
import Message from '../components/Message';
import OrderHistoryScreen from './OrderScreen';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import {
  useGetProfileQuery, // Use the new query hook
  useUpdateProfileMutation,
} from '../slices/usersApiSlice';

const ProfileScreen = () => {
  // Fetch user profile data - CHANGED TO useGetProfileQuery
  const {
    data: user,
    isLoading: profileLoading,
    error: profileError,
  } = useGetProfileQuery(); // This should match your actual query endpoint
  // Fetch orders data
  const {
    data: ordersResponse,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useGetMyOrdersQuery();

  // Extract orders from response
  const orders = ordersResponse?.orders || ordersResponse || [];

  // Update profile mutation
  const [updateProfile, { isLoading: updatingProfile }] =
    useUpdateProfileMutation();

  return (
    <div className='container py-4'>
      <h2 className='mb-4'>My Account</h2>

      <Tabs defaultActiveKey='profile' id='profile-tabs' className='mb-4'>
        <Tab
          eventKey='profile'
          title={
            <span>
              <FaUser className='me-1' /> Profile
            </span>
          }
        >
          <Card className='mb-4'>
            <Card.Body>
              {profileLoading ? (
                <Loader />
              ) : profileError ? (
                <Message variant='danger'>
                  {profileError?.data?.message || 'Error loading profile'}
                </Message>
              ) : (
                <>
                  <h4 className='mb-3'>Personal Information</h4>
                  <div className='mb-3'>
                    <strong>Name:</strong> {user?.name || 'N/A'}
                  </div>
                  <div className='mb-3'>
                    <strong>Email:</strong> {user?.email || 'N/A'}
                  </div>
                  <div className='mb-3'>
                    <strong>Phone:</strong> {user?.phone || 'N/A'}
                  </div>

                  <Button
                    as={Link}
                    to='/profile/edit'
                    variant='primary'
                    className='mt-3'
                  >
                    Edit Profile
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>{' '}
        <Tab
          eventKey='orders'
          title={
            <span>
              <FaHistory className='me-1' /> Order History
            </span>
          }
        >
          <Card>
            <Card.Body>
              <OrderHistoryScreen
                orders={orders}
                isLoading={ordersLoading}
                error={ordersError}
                refetch={refetchOrders}
              />
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default ProfileScreen;
