import { useState, useEffect } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { Link } from 'react-router-dom';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import Meta from '../components/Meta';
import HeroSection from '../components/HeroSection';
import '../assets/styles/HomeScreen.css';

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();
  const [isScrolled, setIsScrolled] = useState(false);

  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='home-screen'>
      <HeroSection />

      <Container
        fluid='xxl'
        className={`product-section ${isScrolled ? 'scrolled' : ''}`}
      >
        <Meta />

        <div className='section-header'>
          <h1 className='section-title'>
            {keyword ? `Search Results for "${keyword}"` : 'Latest Products'}
            {data?.products && (
              <span className='product-count'>
                {data.products.length} products
              </span>
            )}
          </h1>
        </div>

        {isLoading ? (
          <div className='loader-container'>
            <Loader />
          </div>
        ) : error ? (
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <>
            <Row className='product-grid'>
              {data.products.map((product) => (
                <Col
                  key={product._id}
                  xs={12} // Full width on extra small devices
                  sm={6} // 2 columns on small devices
                  md={4} // 3 columns on medium devices
                  lg={4} // 3 columns on large devices
                  xl={4} // Keeping 3 columns on extra large
                  className='product-col'
                >
                  <div className='product-wrapper'>
                    <Product product={product} />
                  </div>
                </Col>
              ))}
            </Row>

            <div className='pagination-container'>
              <Paginate
                pages={data.pages}
                page={data.page}
                keyword={keyword ? keyword : ''}
              />
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default HomeScreen;
