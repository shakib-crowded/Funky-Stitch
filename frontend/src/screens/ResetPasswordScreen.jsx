// frontend/src/screens/ResetPasswordScreen.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { FaLock, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { useResetPasswordMutation } from '../slices/usersApiSlice';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await resetPassword({ resetToken, password }).unwrap();
      toast.success('Password updated successfully');
      navigate('/login');
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
                <FaCheckCircle size={24} />
              </div>
              <h2 className='fw-bold'>Reset Password</h2>
              <p className='text-muted'>Enter your new password</p>
            </div>

            <Form onSubmit={submitHandler}>
              <Form.Group controlId='password' className='mb-3'>
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type='password'
                  placeholder='Enter new password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </Form.Group>

              <Form.Group controlId='confirmPassword' className='mb-4'>
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type='password'
                  placeholder='Confirm new password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </Form.Group>

              <div className='d-grid mb-3'>
                <Button type='submit' variant='primary' disabled={isLoading}>
                  {isLoading ? <Loader size='sm' /> : 'Reset Password'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </FormContainer>
    </Container>
  );
};

export default ResetPasswordScreen;
