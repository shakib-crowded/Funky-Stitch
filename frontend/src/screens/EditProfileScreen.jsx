import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaSave, FaArrowLeft } from 'react-icons/fa';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '../slices/usersApiSlice';
import Message from '../components/Message';
import FormContainer from '../components/FormContainer';

const EditProfileScreen = () => {
  const navigate = useNavigate();

  // Get current profile data
  const {
    data: user,
    isLoading: loadingProfile,
    error: profileError,
  } = useGetProfileQuery();

  // Update profile mutation
  const [updateProfile, { isLoading: updatingProfile }] =
    useUpdateProfileMutation();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  // Populate form with current user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) return;

    try {
      const updatedData = {
        name: formData.name,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
      };

      const res = await updateProfile(updatedData).unwrap();

      // Show success message immediately
      setMessage({
        variant: 'success',
        text: 'Profile updated successfully!',
      });
      // Redirect after 1.5 seconds
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setMessage({
        variant: 'danger',
        text: err?.data?.message || err.error || 'Failed to update profile',
      });
    }
  };

  return (
    <FormContainer>
      <Card className='border-0 shadow-sm'>
        <Card.Body>
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div className='d-flex align-items-center'>
              <div className='bg-light rounded-circle d-inline-flex p-3 me-3'>
                <FaUser className='text-primary' size={20} />
              </div>
              <div>
                <h3 className='fw-bold mb-0'>Edit Profile</h3>
                <p className='text-muted mb-0'>
                  Update your personal information
                </p>
              </div>
            </div>
            <Button
              variant='outline-secondary'
              size='sm'
              onClick={() => navigate('/profile')}
            >
              <FaArrowLeft className='me-1' /> Back
            </Button>
          </div>

          {message && (
            <Alert variant={message.variant} className='mb-4'>
              {message.text}
            </Alert>
          )}

          {profileError ? (
            <Message variant='danger'>
              {profileError?.data?.message || 'Error loading profile data'}
            </Message>
          ) : (
            <Form onSubmit={submitHandler}>
              <Form.Group controlId='name' className='mb-3'>
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  isInvalid={!!errors.name}
                  placeholder='Enter your full name'
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId='email' className='mb-3'>
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  placeholder='Enter your email'
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId='password' className='mb-3'>
                <Form.Label>
                  New Password (leave blank to keep current)
                </Form.Label>
                <Form.Control
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  placeholder='Enter new password'
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId='confirmPassword' className='mb-4'>
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type='password'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isInvalid={!!errors.confirmPassword}
                  placeholder='Confirm new password'
                />
                <Form.Control.Feedback type='invalid'>
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>

              <div className='d-grid gap-2'>
                <Button
                  type='submit'
                  variant='primary'
                  disabled={loadingProfile || updatingProfile}
                >
                  {updatingProfile ? (
                    <>
                      <Spinner
                        as='span'
                        animation='border'
                        size='sm'
                        role='status'
                        aria-hidden='true'
                        className='me-2'
                      />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave className='me-2' />
                      Update Profile
                    </>
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </FormContainer>
  );
};

export default EditProfileScreen;
