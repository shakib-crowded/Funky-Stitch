import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import {
  FaStore,
  FaShippingFast,
  FaHeadset,
  FaShieldAlt,
} from 'react-icons/fa';
import teamImage from '../assets/team.jpg'; // Replace with your actual image
import { Link } from 'react-router-dom';

const AboutUsScreen = () => {
  return (
    <Container className='py-5'>
      {/* Hero Section */}
      <Row className='align-items-center mb-5'>
        <Col md={6}>
          <h1 className='fw-bold mb-4' style={{ color: '#2c3e50' }}>
            Our Story
          </h1>
          <p className='lead'>
            Founded in 2023, we started with a simple mission: to make online
            shopping effortless, enjoyable, and accessible to everyone. What
            began as a small team with big dreams has grown into a trusted
            e-commerce platform serving thousands of happy customers.
          </p>
          <Button
            as={Link}
            to='/'
            variant='primary'
            size='lg'
            className='mt-3'
            style={{
              backgroundColor: '#FF5252',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 25px',
            }}
          >
            Shop Now
          </Button>
        </Col>
        <Col md={6}>
          <img
            src={teamImage}
            alt='Our Team'
            className='img-fluid rounded shadow'
            style={{ maxHeight: '400px', objectFit: 'cover' }}
          />
        </Col>
      </Row>

      {/* Mission Section */}
      <Card
        className='border-0 shadow-sm mb-5 p-4'
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <Card.Body>
          <Row className='align-items-center'>
            <Col md={8}>
              <h2 className='fw-bold mb-3' style={{ color: '#2c3e50' }}>
                Our Mission
              </h2>
              <p className='mb-0'>
                We're committed to providing high-quality products with
                exceptional customer service. Our goal is to create a seamless
                shopping experience that keeps you coming back.
              </p>
            </Col>
            <Col md={4} className='text-center'>
              <div
                className='bg-primary rounded-circle d-inline-flex p-4'
                style={{ color: 'white' }}
              >
                <FaStore size={40} />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Values Section */}
      <h2 className='fw-bold text-center mb-4' style={{ color: '#2c3e50' }}>
        Why Choose Us
      </h2>
      <Row className='g-4 mb-5'>
        <Col md={3}>
          <Card className='h-100 border-0 shadow-sm text-center p-3'>
            <Card.Body>
              <div className='bg-light rounded-circle d-inline-flex p-3 mb-3'>
                <FaShippingFast size={24} className='text-primary' />
              </div>
              <h5>Fast Shipping</h5>
              <p className='text-muted'>
                Get your orders delivered quickly with our reliable shipping
                partners.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className='h-100 border-0 shadow-sm text-center p-3'>
            <Card.Body>
              <div className='bg-light rounded-circle d-inline-flex p-3 mb-3'>
                <FaShieldAlt size={24} className='text-primary' />
              </div>
              <h5>Quality Guaranteed</h5>
              <p className='text-muted'>
                We carefully curate all products to ensure the highest quality
                standards.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className='h-100 border-0 shadow-sm text-center p-3'>
            <Card.Body>
              <div className='bg-light rounded-circle d-inline-flex p-3 mb-3'>
                <FaHeadset size={24} className='text-primary' />
              </div>
              <h5>24/7 Support</h5>
              <p className='text-muted'>
                Our customer service team is always ready to assist you with any
                questions.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className='h-100 border-0 shadow-sm text-center p-3'>
            <Card.Body>
              <div className='bg-light rounded-circle d-inline-flex p-3 mb-3'>
                <FaShieldAlt size={24} className='text-primary' />
              </div>
              <h5>Secure Payments</h5>
              <p className='text-muted'>
                Shop with confidence using our secure payment processing system.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Team Section */}
      <h2 className='fw-bold text-center mb-4' style={{ color: '#2c3e50' }}>
        Meet Our Team
      </h2>
      <Row className='g-4 mb-5'>
        <Col md={4}>
          <Card className='border-0 shadow-sm text-center'>
            <Card.Img
              variant='top'
              src='https://randomuser.me/api/portraits/women/44.jpg'
              className='rounded-circle mx-auto mt-3'
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
            <Card.Body>
              <h5>Sarah Johnson</h5>
              <p className='text-muted'>CEO & Founder</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className='border-0 shadow-sm text-center'>
            <Card.Img
              variant='top'
              src='https://randomuser.me/api/portraits/men/32.jpg'
              className='rounded-circle mx-auto mt-3'
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
            <Card.Body>
              <h5>Michael Chen</h5>
              <p className='text-muted'>Head of Operations</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className='border-0 shadow-sm text-center'>
            <Card.Img
              variant='top'
              src='https://randomuser.me/api/portraits/women/68.jpg'
              className='rounded-circle mx-auto mt-3'
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
            <Card.Body>
              <h5>Priya Patel</h5>
              <p className='text-muted'>Customer Experience</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CTA Section */}
      <Card
        className='border-0 text-white text-center py-5 mb-4'
        style={{ backgroundColor: '#FF5252' }}
      >
        <Card.Body>
          <h2 className='fw-bold mb-3'>Ready to Shop With Us?</h2>
          <p className='lead mb-4'>
            Join thousands of satisfied customers who trust us for their
            shopping needs.
          </p>
          <Button
            as={Link}
            to='/'
            variant='light'
            size='lg'
            style={{
              borderRadius: '8px',
              padding: '10px 30px',
              fontWeight: '600',
            }}
          >
            Browse Products
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AboutUsScreen;
