import { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { savePaymentMethod } from '../slices/cartSlice';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [navigate, shippingAddress]);

  const [paymentMethod, setPaymentMethod] = useState('COD'); // Default to COD
  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  const paymentMethods = [
    {
      id: 'COD',
      label: 'Cash on Delivery',
      icon: 'fas fa-money-bill-wave',
      description: 'Pay when you receive your order',
      available: true,
    },
    {
      id: 'PayPal',
      label: 'PayPal or Credit Card',
      icon: 'fab fa-cc-paypal',
      description: 'Currently unavailable',
      available: false,
    },
    {
      id: 'UPI',
      label: 'UPI Payment',
      icon: 'fas fa-mobile-alt',
      description: 'Currently unavailable',
      available: false,
    },
    {
      id: 'NetBanking',
      label: 'Net Banking',
      icon: 'fas fa-university',
      description: 'Currently unavailable',
      available: false,
    },
    {
      id: 'Wallet',
      label: 'Digital Wallet',
      icon: 'fas fa-wallet',
      description: 'Currently unavailable',
      available: false,
    },
  ];

  return (
    <Container className='py-4'>
      <CheckoutSteps step1 step2 step3 />

      <Card
        className='border-0 shadow-sm'
        style={{ maxWidth: '700px', margin: '0 auto' }}
      >
        <Card.Body className='p-4'>
          <div className='text-center mb-4'>
            <h2 className='fw-bold' style={{ color: '#2c3e50' }}>
              Payment Method
            </h2>
            <p className='text-muted'>Select your preferred payment option</p>
          </div>

          <Form onSubmit={submitHandler}>
            <Form.Group className='mb-4'>
              <Row className='g-3'>
                {paymentMethods.map((method) => (
                  <Col key={method.id} xs={12}>
                    <div
                      className={`p-3 border rounded-3 ${
                        paymentMethod === method.id
                          ? 'border-primary bg-light'
                          : 'border-light'
                      } ${!method.available ? 'opacity-50' : 'cursor-pointer'}`}
                      onClick={() =>
                        method.available && setPaymentMethod(method.id)
                      }
                      style={{
                        transition: 'all 0.2s ease',
                        cursor: method.available ? 'pointer' : 'not-allowed',
                        backgroundColor: !method.available
                          ? '#f8f9fa'
                          : 'inherit',
                      }}
                    >
                      <Form.Check
                        type='radio'
                        id={method.id}
                        name='paymentMethod'
                        label={
                          <div className='d-flex align-items-center'>
                            <i
                              className={`${method.icon} fa-lg me-3`}
                              style={{
                                color:
                                  paymentMethod === method.id
                                    ? '#ADB897'
                                    : '#6c757d',
                              }}
                            ></i>
                            <div>
                              <div className='fw-medium'>{method.label}</div>
                              <small className='text-muted'>
                                {method.description}
                              </small>
                            </div>
                          </div>
                        }
                        checked={paymentMethod === method.id}
                        onChange={() =>
                          method.available && setPaymentMethod(method.id)
                        }
                        className='d-flex align-items-center'
                        disabled={!method.available}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </Form.Group>

            <div className='d-grid gap-2'>
              <Button
                type='submit'
                variant='primary'
                size='lg'
                className='py-2 fw-medium'
                style={{
                  borderRadius: '8px',
                  backgroundColor: '#FF5252',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(255, 82, 82, 0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.backgroundColor = '#E64545';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(255, 82, 82, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = '#FF5252';
                  e.currentTarget.style.boxShadow =
                    '0 2px 8px rgba(255, 82, 82, 0.3)';
                }}
              >
                Continue to Order Review
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentScreen;
