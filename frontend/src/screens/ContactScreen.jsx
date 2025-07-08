// src/screens/ContactScreen.jsx
import React, { useState } from 'react';
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Card,
} from 'react-bootstrap';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';

const ContactScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting form');
    }
  };

  return (
    <Container className='py-5'>
      <h1 className='text-center mb-5 fw-bold'>Contact Us</h1>

      <Row className='g-4'>
        <Col lg={6}>
          <Card className='border-0 shadow-sm h-100'>
            <Card.Body className='p-4'>
              <h3 className='mb-4'>Get in Touch</h3>

              <div className='mb-4'>
                <div className='d-flex align-items-center mb-3'>
                  <div className='bg-primary rounded-circle d-flex align-items-center justify-content-center p-3 me-3'>
                    <FaPhone size={20} className='text-white' />
                  </div>
                  <div>
                    <h5 className='mb-0'>Phone</h5>
                    <p className='mb-0 text-muted'>+91 93365 45458</p>
                  </div>
                </div>

                <div className='d-flex align-items-center mb-3'>
                  <div className='bg-primary rounded-circle d-flex align-items-center justify-content-center p-3 me-3'>
                    <FaEnvelope size={20} className='text-white' />
                  </div>
                  <div>
                    <h5 className='mb-0'>Email</h5>
                    <p className='mb-0 text-muted'>funkystitch.outfit@gmail.com</p>
                  </div>
                </div>

                <div className='d-flex align-items-center'>
                  <div className='bg-primary rounded-circle d-flex align-items-center justify-content-center p-3 me-3'>
                    <FaMapMarkerAlt size={20} className='text-white' />
                  </div>
                  <div>
                    <h5 className='mb-0'>Address</h5>
                    <p className='mb-0 text-muted'>
                      Shahjhapur, Lucknow
                    </p>
                  </div>
                </div>
              </div>

              <div className='mt-4'>
                <h5>Business Hours</h5>
                <p className='text-muted'>
                  Monday - Friday: 9:00 AM - 6:00 PM
                  <br />
                  Saturday: 10:00 AM - 4:00 PM
                  <br />
                  Sunday: Closed
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className='border-0 shadow-sm'>
            <Card.Body className='p-4'>
              <h3 className='mb-4'>Send Us a Message</h3>

              {submitted ? (
                <Alert variant='success'>
                  Thank you for contacting us! We'll get back to you soon.
                </Alert>
              ) : (
                <>
                  {error && <Alert variant='danger'>{error}</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Your Name</Form.Label>
                      <Form.Control
                        type='text'
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder='Enter your name'
                      />
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type='email'
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder='Enter your email'
                      />
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label>Subject</Form.Label>
                      <Form.Control
                        type='text'
                        name='subject'
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder='Enter subject'
                      />
                    </Form.Group>

                    <Form.Group className='mb-4'>
                      <Form.Label>Message</Form.Label>
                      <Form.Control
                        as='textarea'
                        name='message'
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder='Enter your message'
                      />
                    </Form.Group>

                    <Button
                      type='submit'
                      variant='primary'
                      size='lg'
                      className='w-100 py-2'
                      style={{
                        backgroundColor: '#FF5252',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                      }}
                    >
                      Send Message
                    </Button>
                  </Form>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactScreen;
