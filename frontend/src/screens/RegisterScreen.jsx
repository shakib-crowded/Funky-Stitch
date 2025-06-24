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
import { FaUserPlus, FaSignInAlt, FaCheckCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import {
  useRegisterMutation,
  useVerifyOtpMutation,
} from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';

const RegisterScreen = () => {
  const [step, setStep] = useState(1); // 1: Registration form, 2: OTP verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [tempUserId, setTempUserId] = useState(null);
  const [validated, setValidated] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }).unwrap();

      setTempUserId(res.tempUserId);
      setStep(2);
      toast.success(`OTP sent to ${formData.email}`);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const submitOtpVerification = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const res = await verifyOtp({
        tempUserId,
        otp,
        email: formData.email,
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      navigate(redirect);
      toast.success('Registration successful! Welcome!');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Container className='py-5'>
      <Row className='justify-content-center'>
        <Col md={8} lg={6} xl={5}>
          <Card className='border-0 shadow-sm'>
            <Card.Body className='p-4'>
              {step === 1 ? (
                <>
                  <div className='text-center mb-4'>
                    <h2 className='fw-bold' style={{ color: '#2c3e50' }}>
                      Create Account
                    </h2>
                    <p className='text-muted'>Join us to get started</p>
                  </div>

                  <Form
                    noValidate
                    validated={validated}
                    onSubmit={submitRegistration}
                  >
                    <FloatingLabel
                      controlId='name'
                      label='Full Name'
                      className='mb-3'
                    >
                      <Form.Control
                        type='text'
                        name='name'
                        placeholder='John Doe'
                        required
                        minLength={3}
                        value={formData.name}
                        onChange={handleChange}
                        className='py-3'
                      />
                      <Form.Control.Feedback type='invalid'>
                        Please provide your full name.
                      </Form.Control.Feedback>
                    </FloatingLabel>

                    <FloatingLabel
                      controlId='email'
                      label='Email Address'
                      className='mb-3'
                    >
                      <Form.Control
                        type='email'
                        name='email'
                        placeholder='name@example.com'
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className='py-3'
                      />
                      <Form.Control.Feedback type='invalid'>
                        Please provide a valid email.
                      </Form.Control.Feedback>
                    </FloatingLabel>

                    <FloatingLabel
                      controlId='password'
                      label='Password'
                      className='mb-3'
                    >
                      <Form.Control
                        type='password'
                        name='password'
                        placeholder='Password'
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange}
                        className='py-3'
                      />
                      <Form.Control.Feedback type='invalid'>
                        Password must be at least 6 characters.
                      </Form.Control.Feedback>
                      <Form.Text className='text-muted'>
                        At least 6 characters
                      </Form.Text>
                    </FloatingLabel>

                    <FloatingLabel
                      controlId='confirmPassword'
                      label='Confirm Password'
                      className='mb-4'
                    >
                      <Form.Control
                        type='password'
                        name='confirmPassword'
                        placeholder='Confirm Password'
                        required
                        minLength={6}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className='py-3'
                      />
                      <Form.Control.Feedback type='invalid'>
                        Please confirm your password.
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
                      >
                        {isLoading ? (
                          <Loader size='sm' />
                        ) : (
                          <>
                            <FaUserPlus className='me-2' /> Register
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </>
              ) : (
                <>
                  <div className='text-center mb-4'>
                    <FaCheckCircle size={48} className='text-success mb-3' />
                    <h2 className='fw-bold' style={{ color: '#2c3e50' }}>
                      Verify Your Email
                    </h2>
                    <p className='text-muted'>
                      We've sent a 6-digit code to {formData.email}
                    </p>
                  </div>

                  <Form onSubmit={submitOtpVerification}>
                    <FloatingLabel
                      controlId='otp'
                      label='Enter OTP'
                      className='mb-4'
                    >
                      <Form.Control
                        type='text'
                        placeholder='123456'
                        required
                        maxLength={6}
                        value={otp}
                        onChange={handleOtpChange}
                        className='py-3 text-center'
                      />
                    </FloatingLabel>

                    <div className='d-grid mb-3'>
                      <Button
                        variant='primary'
                        type='submit'
                        disabled={isVerifying}
                        className='py-2 fw-medium'
                        style={{
                          backgroundColor: '#FF5252',
                          border: 'none',
                          borderRadius: '8px',
                        }}
                      >
                        {isVerifying ? <Loader size='sm' /> : 'Verify OTP'}
                      </Button>
                    </div>

                    <div className='text-center'>
                      <Button
                        variant='link'
                        onClick={() => setStep(1)}
                        className='text-decoration-none'
                      >
                        Back to registration
                      </Button>
                    </div>
                  </Form>
                </>
              )}

              <div className='text-center pt-3 border-top'>
                <p className='text-muted mb-2'>Already have an account?</p>
                <Button
                  as={Link}
                  to={redirect ? `/login?redirect=${redirect}` : '/login'}
                  variant='outline-primary'
                  className='d-flex align-items-center justify-content-center mx-auto'
                  style={{
                    borderRadius: '8px',
                    width: 'fit-content',
                  }}
                >
                  <FaSignInAlt className='me-2' /> Sign In
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterScreen;
