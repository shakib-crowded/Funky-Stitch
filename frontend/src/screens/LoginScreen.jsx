import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Form,
  Button,
  Row,
  Col,
  Card,
  Container,
  FloatingLabel,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
      toast.success('Login successful!');
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container className='py-5'>
      <Row className='justify-content-center'>
        <Col md={8} lg={6} xl={5}>
          <Card className='border-0 shadow-sm'>
            <Card.Body className='p-4'>
              <div className='text-center mb-4'>
                <h2 className='fw-bold' style={{ color: '#2c3e50' }}>
                  Welcome Back
                </h2>
                <p className='text-muted'>Sign in to access your account</p>
              </div>

              <Form noValidate validated={validated} onSubmit={submitHandler}>
                <FloatingLabel
                  controlId='email'
                  label='Email address'
                  className='mb-3'
                >
                  <Form.Control
                    type='email'
                    placeholder='name@example.com'
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='py-3'
                  />
                  <Form.Control.Feedback type='invalid'>
                    Please provide a valid email.
                  </Form.Control.Feedback>
                </FloatingLabel>

                <FloatingLabel
                  controlId='password'
                  label='Password'
                  className='mb-4'
                >
                  <Form.Control
                    type='password'
                    placeholder='Password'
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='py-3'
                  />
                  <Form.Control.Feedback type='invalid'>
                    Password must be at least 6 characters.
                  </Form.Control.Feedback>
                </FloatingLabel>

                <div className='d-grid mb-3'>
                  <Button
                    variant='primary'
                    type='submit'
                    disabled={isLoading}
                    className='py-2 fw-medium'
                    style={{
                      backgroundColor: '#FF5252',
                      border: 'none',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(255, 82, 82, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {isLoading ? (
                      <Loader size='sm' />
                    ) : (
                      <>
                        <FaSignInAlt className='me-2' /> Sign In
                      </>
                    )}
                  </Button>
                </div>

                <div className='text-center mb-3'>
                  <Link
                    to='/forgot-password'
                    className='text-decoration-none'
                    style={{ color: '#FF5252' }}
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className='text-center pt-3 border-top'>
                  <p className='text-muted mb-2'>Don't have an account?</p>
                  <Button
                    as={Link}
                    to={
                      redirect ? `/register?redirect=${redirect}` : '/register'
                    }
                    variant='outline-primary'
                    className='d-flex align-items-center justify-content-center mx-auto'
                    style={{
                      borderRadius: '8px',
                      width: 'fit-content',
                    }}
                  >
                    <FaUserPlus className='me-2' /> Create Account
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginScreen;
