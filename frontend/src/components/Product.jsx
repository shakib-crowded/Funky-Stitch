import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
// import '../assets/styles/Product.css';
import '../assets/styles/Product.css';
const Product = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageInterval, setImageInterval] = useState(null);

  // Start image carousel on hover
  useEffect(() => {
    if (isHovered && product.images?.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 2000); // Rotate every 2 seconds
      setImageInterval(interval);
    } else {
      clearInterval(imageInterval);
      setCurrentImageIndex(0);
    }
    return () => clearInterval(imageInterval);
  }, [isHovered]);

  // Calculate price range
  const priceData = (() => {
    if (!product.variants?.length) return null;

    const prices = product.variants.map((v) => v.price || product.basePrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const hasDiscount = product.discount > 0;

    return {
      minPrice: hasDiscount
        ? minPrice * (1 - product.discount / 100)
        : minPrice,
      maxPrice: hasDiscount
        ? maxPrice * (1 - product.discount / 100)
        : maxPrice,
      minOriginal: minPrice,
      maxOriginal: maxPrice,
      isRange: minPrice !== maxPrice,
      hasDiscount,
    };
  })();

  // Stock status
  const stockStatus = (() => {
    if (!product.variants?.length)
      return { inStock: false, variantsAvailable: 0 };

    const availableVariants = product.variants.filter((v) => v.stock > 0);
    return {
      inStock: availableVariants.length > 0,
      variantsAvailable: availableVariants.length,
      colorsAvailable: new Set(availableVariants.map((v) => v.color)).size,
    };
  })();

  // Image display
  const displayImages = [
    product.image,
    ...(product.images?.map((img) => img.url) || []),
  ];
  const currentImage = displayImages[currentImageIndex] || product.image;

  return (
    <Card
      className={`product-card ${!stockStatus.inStock ? 'out-of-stock' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='product-media-wrapper'>
        <Link to={`/product/${product._id}`} className='product-image-link'>
          <div className='image-container'>
            <img
              src={currentImage}
              alt={product.name}
              className='product-main-image'
              loading='lazy'
            />
          </div>
        </Link>

        <div className='product-badges'>
          {priceData?.hasDiscount && (
            <span className='badge discount-badge'>-{product.discount}%</span>
          )}
          {product.isNew && <span className='badge new-badge'>New</span>}
          {!stockStatus.inStock && (
            <span className='badge stock-badge'>Sold Out</span>
          )}
          {stockStatus.colorsAvailable > 0 && (
            <span className='badge color-badge'>
              {stockStatus.colorsAvailable} Color
              {stockStatus.colorsAvailable !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <Card.Body className='product-info'>
        <div className='product-category'>{product.category}</div>

        <Card.Title className='product-title'>
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </Card.Title>

        <div className='product-rating'>
          <Rating
            value={product.rating}
            text={`${product.numReviews} review${
              product.numReviews !== 1 ? 's' : ''
            }`}
          />
        </div>

        <div className='product-pricing'>
          {priceData ? (
            <>
              <div className='current-price'>
                ₹{priceData.minPrice.toFixed(2)}
                {priceData.isRange && ` - ₹${priceData.maxPrice.toFixed(2)}`}
              </div>
              {priceData.hasDiscount && (
                <div className='original-price'>
                  <span>₹{priceData.minOriginal.toFixed(2)}</span>
                  {priceData.isRange &&
                    ` - ₹${priceData.maxOriginal.toFixed(2)}`}
                </div>
              )}
            </>
          ) : (
            <div className='not-available'>Not Available</div>
          )}
        </div>

        {stockStatus.inStock && (
          <div className='availability'>
            {stockStatus.variantsAvailable} option
            {stockStatus.variantsAvailable !== 1 ? 's' : ''} available
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default Product;
