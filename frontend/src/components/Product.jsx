import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import '../assets/styles/Product.css';
const Product = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <Card
      className={`product-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='product-media'>
        <Link to={`/product/${product._id}`} className='image-link'>
          <Card.Img
            src={product.image}
            className='primary-image'
            alt={product.name}
          />
        </Link>

        <div className='product-badges'>
          {product.discount > 0 && (
            <span className='badge discount'>-{product.discount}%</span>
          )}
          {product.countInStock <= 0 && (
            <span className='badge out-of-stock'>Sold Out</span>
          )}
        </div>
      </div>

      <Card.Body className='product-content'>
        <div className='product-category'>{product.category}</div>

        <Card.Title className='product-title'>
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </Card.Title>

        <Card.Text className='product-description'>
          {product.description.length > 100
            ? `${product.description.substring(0, 100)}...`
            : product.description}
        </Card.Text>

        <div className='product-meta'>
          <Rating
            value={product.rating}
            text={`(${product.numReviews})`}
            className='product-rating'
          />

          <div className='price-container'>
            {product.discount > 0 ? (
              <>
                <span className='current-price'>
                  &#8377;
                  {(product.price * (1 - product.discount / 100)).toFixed(2)}
                </span>
                <span className='original-price'>
                  &#8377;{product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className='current-price'>
                &#8377;{product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Product;
