// frontend/src/screens/ForgotPasswordScreen.jsx
import { useState } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { useForgotPasswordMutation } from '../slices/usersApiSlice';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword({ email }).unwrap();
      toast.success('Password reset email sent');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container className='py-5'>
      <FormContainer>
        <Card className='border-0 shadow-sm'>
          <Card.Body className='p-4'>
            <div className='text-center mb-4'>
              <div
                style={{ backgroundColor: '#55B464', color: '#fff' }}
                className=' rounded-circle d-inline-flex p-3 mb-3'
              >
                <FaLock size={24} />
              </div>
              <h2 className='fw-bold'>Forgot Password</h2>
              <p className='text-muted'>
                Enter your email to receive a password reset link
              </p>
            </div>

            <Form onSubmit={submitHandler}>
              <Form.Group controlId='email' className='mb-3'>
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <div className='d-grid mb-3'>
                <Button
                  type='submit'
                  disabled={isLoading}
                  style={{ backgroundColor: '#FF5252' }}
                >
                  {isLoading ? <Loader size='sm' /> : 'Send Reset Link'}
                </Button>
              </div>

              <div className='text-center'>
                <Link to='/login' className='text-decoration-none'>
                  <FaArrowLeft className='me-2' />
                  Back to Login
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </FormContainer>
    </Container>
  );
};

export default ForgotPasswordScreen;
