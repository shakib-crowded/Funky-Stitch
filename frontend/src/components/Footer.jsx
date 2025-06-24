import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const Footer = () => {
  return (
    <footer className='text-white pt-5 pb-4' style={{ background: '#3C4C5D' }}>
      <div className='container'>
        <div className='row g-4'>
          {/* Company Info */}
          <div className='col-lg-4 col-md-6'>
            <h5 className='text-uppercase fw-bold mb-4'>
              <span style={{ color: '#FF5252' }}>Funky &nbsp;</span>
              Stitch
            </h5>
            <p>
              Premium outfit shop for modern generation. We deliver quality
              products with exceptional service.
            </p>
            <div className='social-icons mt-4'>
              <a href='#' className='text-white me-3'>
                <FaFacebook size={20} />
              </a>
              <a href='#' className='text-white me-3'>
                <FaTwitter size={20} />
              </a>
              <a href='#' className='text-white me-3'>
                <FaInstagram size={20} />
              </a>
              <a href='#' className='text-white me-3'>
                <FaLinkedin size={20} />
              </a>
              <a href='#' className='text-white'>
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className='col-lg-2 col-md-6'>
            <h6 className='text-uppercase fw-bold mb-4'>Quick Links</h6>
            <ul className='list-unstyled'>
              <li className='mb-2'>
                <a
                  href='/'
                  className='text-white text-decoration-none footer-link'
                  style={{
                    transition: 'color 0.3s ease',
                    display: 'inline-block',
                  }}
                >
                  Home
                </a>
              </li>
              <li className='mb-2'>
                <a
                  href='/about'
                  className='text-white text-decoration-none footer-link'
                  style={{
                    transition: 'color 0.3s ease',
                    display: 'inline-block',
                  }}
                >
                  About Us
                </a>
              </li>

              <li className='mb-2'>
                <a
                  href='/contact'
                  className='text-white text-decoration-none footer-link'
                  style={{
                    transition: 'color 0.3s ease',
                    display: 'inline-block',
                  }}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className='col-lg-2 col-md-6'>
            <h6 className='text-uppercase fw-bold mb-4'>Customer Service</h6>
            <ul className='list-unstyled'>
              <li className='mb-2'>
                <a
                  href='/profile'
                  className='text-white text-decoration-none footer-link'
                  style={{
                    transition: 'color 0.3s ease',
                    display: 'inline-block',
                  }}
                >
                  My Account
                </a>
              </li>
              <li className='mb-2'>
                <a
                  href='/order-tracking'
                  className='text-white text-decoration-none footer-link'
                  style={{
                    transition: 'color 0.3s ease',
                    display: 'inline-block',
                  }}
                >
                  Order Tracking
                </a>
              </li>
              <li className='mb-2'>
                <a
                  // href='returns'
                  className='text-white text-decoration-none footer-link'
                  style={{
                    transition: 'color 0.3s ease',
                    display: 'inline-block',
                  }}
                >
                  Returns
                </a>
              </li>
            </ul>
          </div>

          {/* Add this style to your CSS or style section */}
          <style jsx>{`
            .footer-link:hover {
              color: #ff5252 !important;
              transform: translateX(3px);
            }
          `}</style>

          {/* Contact Info */}
          <div className='col-lg-4 col-md-6'>
            <h6 className='text-uppercase fw-bold mb-4'>Contact Us</h6>
            <ul className='list-unstyled'>
              <li className='mb-3 d-flex align-items-center'>
                <MdLocationOn className='me-3 text-primary' />
                123 Business Ave, Suite 456, San Francisco, CA 94107
              </li>
              <li className='mb-3 d-flex align-items-center'>
                <MdEmail className='me-3 text-primary' />
                info@shopname.com
              </li>
              <li className='mb-3 d-flex align-items-center'>
                <MdPhone className='me-3 text-primary' />
                +1 (555) 123-4567
              </li>
            </ul>

            {/* Newsletter Subscription */}
            <div className='mt-4'>
              <h6 className='text-uppercase fw-bold mb-3'>Newsletter</h6>
              <div className='input-group mb-3'>
                <input
                  type='email'
                  id='email'
                  autoComplete='email'
                  className='form-control bg-white border-0'
                  placeholder='Your Email'
                  aria-label='Your Email'
                  style={{
                    boxShadow: 'none',
                  }}
                />
                <button
                  style={{ backgroundColor: '#FF5252' }}
                  className='btn btn-primary'
                  type='button'
                >
                  Subscribe
                </button>
              </div>
              <small>Get updates on special offers and products</small>
            </div>
          </div>
        </div>

        <hr className='my-4 bg-secondary' />

        {/* Copyright and Payment Methods */}
        <div className='row align-items-center'>
          <div className='col-md-6 text-center text-md-start'>
            <p className='mb-0'>
              &copy; {new Date().getFullYear()} Funky Stitch. All rights
              reserved.
            </p>
          </div>
          <div className='col-md-6 text-center text-md-end'>
            <img
              src='https://cdn.iconscout.com/icon/free/png-512/free-netbanking-icon-download-in-svg-png-gif-file-formats--credit-debit-card-bank-payment-methods-vol-2-pack-business-icons-32304.png?f=webp&w=512'
              alt='Payment Methods'
              className='img-fluid'
              style={{ maxHeight: '30px' }}
            />
            <img
              src='https://cdn.iconscout.com/icon/free/png-256/free-upi-logo-icon-download-in-svg-png-gif-file-formats--unified-payments-interface-payment-money-transfer-logos-icons-1747946.png?f=webp&w=256'
              alt='Payment Methods'
              className='img-fluid'
              style={{ maxHeight: '30px' }}
            />
            <img
              src='data:image/webp;base64,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'
              alt='Payment Methods'
              className='img-fluid'
              style={{ maxHeight: '30px' }}
            />
          </div>
        </div>
      </div>

      {/* Style */}
      <style jsx>{`
        .hover-text-primary:hover {
          color: #0d6efd !important;
          transition: color 0.3s ease;
        }
        .social-icons a {
          transition: transform 0.3s ease, color 0.3s ease;
        }
        .social-icons a:hover {
          color: #0d6efd !important;
          transform: translateY(-3px);
        }
        .form-control:focus {
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
