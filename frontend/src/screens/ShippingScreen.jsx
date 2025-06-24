import { useState } from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHref, useNavigate } from 'react-router-dom';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { saveShippingAddress } from '../slices/cartSlice';
import { FaArrowLeft } from 'react-icons/fa';

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  );
  const [country, setCountry] = useState(shippingAddress.country || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    navigate('/payment');
  };

  return (
    <Container className='py-4'>
      <CheckoutSteps step1 step2 />

      <Card
        className='border-0 shadow-sm'
        style={{ maxWidth: '600px', margin: '0 auto' }}
      >
        <Link variant='outline-secondary' to={'/cart'} className='mb-4'>
          <FaArrowLeft className='me-2' />
          Continue Shopping
        </Link>

        <Card.Body className='p-4'>
          <div className='text-center mb-4'>
            <h2 className='fw-bold' style={{ color: '#2c3e50' }}>
              Shipping Information
            </h2>
            <p className='text-muted'>Enter your delivery details</p>
          </div>

          <Form onSubmit={submitHandler}>
            <Form.Group className='mb-3' controlId='address'>
              <Form.Label className='fw-medium'>Address</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter your full address'
                value={address}
                required
                onChange={(e) => setAddress(e.target.value)}
                className='py-2'
                style={{ borderRadius: '8px', borderColor: '#dfe6e9' }}
              />
            </Form.Group>

            <div className='row'>
              <div className='col-md-6'>
                <Form.Group className='mb-3' controlId='city'>
                  <Form.Label className='fw-medium'>City</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter city'
                    value={city}
                    required
                    onChange={(e) => setCity(e.target.value)}
                    className='py-2'
                    style={{ borderRadius: '8px', borderColor: '#dfe6e9' }}
                  />
                </Form.Group>
              </div>
              <div className='col-md-6'>
                <Form.Group className='mb-3' controlId='postalCode'>
                  <Form.Label className='fw-medium'>Postal Code</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter postal code'
                    value={postalCode}
                    required
                    onChange={(e) => setPostalCode(e.target.value)}
                    className='py-2'
                    style={{ borderRadius: '8px', borderColor: '#dfe6e9' }}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className='mb-4' controlId='country'>
              <Form.Label className='fw-medium'>Country</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter country'
                value={country}
                required
                onChange={(e) => setCountry(e.target.value)}
                className='py-2'
                style={{ borderRadius: '8px', borderColor: '#dfe6e9' }}
              />
            </Form.Group>

            <div className='d-grid'>
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
                Continue to Payment
              </Button>
              <Link to={'/cart'} className='text-decoration-none'>
                <FaArrowLeft className='me-2' />
                Continue Shopping
              </Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ShippingScreen;
