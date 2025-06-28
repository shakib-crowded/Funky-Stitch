import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import '../assets/styles/Product.css';

const Product = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Calculate display price based on variants
  const getDisplayPrice = () => {
    if (!product.variants || product.variants.length === 0) {
      return 'Not Available';
    }

    // Calculate prices with discount applied
    const prices = product.variants.map((v) => v.price || product.basePrice);
    const discountedPrices = prices.map((price) =>
      product.discount > 0 ? price * (1 - product.discount / 100) : price
    );

    const minPrice = Math.min(...discountedPrices);
    const maxPrice = Math.max(...discountedPrices);
    const minOriginalPrice = Math.min(...prices);
    const maxOriginalPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return {
        current: minPrice.toFixed(2),
        original: minOriginalPrice.toFixed(2),
      };
    }
    return {
      current: `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`,
      original: `${minOriginalPrice.toFixed(2)} - ${maxOriginalPrice.toFixed(
        2
      )}`,
    };
  };

  // Check if any variant is in stock
  const isInStock = product.variants?.some((v) => v.stock > 0);
  const availableVariantsCount =
    product.variants?.filter((v) => v.stock > 0).length || 0;

  // Get available colors count (unique colors with stock)
  const availableColorsCount = new Set(
    product.variants?.filter((v) => v.stock > 0).map((v) => v.color)
  ).size;

  return (
    <Card
      className={`product-card ${isHovered ? 'hovered' : ''} ${
        !product.variants || product.variants.length === 0 ? 'no-variants' : ''
      }`}
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
          {isHovered && product.images?.[0] && (
            <Card.Img
              src={product.images[0]}
              className='secondary-image'
              alt={product.name}
            />
          )}
        </Link>

        <div className='product-badges'>
          {product.discount > 0 && (
            <span className='badge discount'>-{product.discount}%</span>
          )}
          {!isInStock && <span className='badge out-of-stock'>Sold Out</span>}
          {availableColorsCount > 0 && (
            <span className='badge colors'>
              {availableColorsCount} color
              {availableColorsCount !== 1 ? 's' : ''}
            </span>
          )}
          {(!product.variants || product.variants.length === 0) && (
            <span className='badge warning'>Not Configured</span>
          )}
        </div>
      </div>

      <Card.Body className='product-content'>
        <div className='product-category'>{product.category}</div>

        <Card.Title className='product-title'>
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </Card.Title>

        <div className='product-meta'>
          <Rating
            value={product.rating}
            text={`(${product.numReviews})`}
            className='product-rating'
          />

          <div className='price-container'>
            {product.variants && product.variants.length > 0 ? (
              <>
                <span className='current-price'>
                  ₹{getDisplayPrice().current}
                </span>
                {product.discount > 0 && (
                  <span className='original-price'>
                    ₹{getDisplayPrice().original}
                  </span>
                )}
              </>
            ) : (
              <span className='not-available'>Not Available</span>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Product;
