import React from 'react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onSelect, showToast }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Avoid triggering card selection click
    try {
      addToCart(product, 1);
      showToast(`${product.name} added to cart!`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Render Star Ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} style={{ color: '#fbbf24' }}>★</span> // Gold star
        );
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <span key={i} style={{ color: '#fbbf24', position: 'relative' }}>
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} style={{ color: 'var(--text-muted)' }}>☆</span> // Empty star
        );
      }
    }
    return stars;
  };

  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock === 0;

  return (
    <div 
      className="product-card hover-scale" 
      onClick={() => onSelect(product)}
      style={cardStyles}
    >
      <div style={imageContainerStyles}>
        <img 
          src={product.image} 
          alt={product.name} 
          style={imageStyles}
          onError={(e) => {
            // Fallback image if file not generated yet
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
          }}
        />
        <span style={categoryBadgeStyles}>{product.category}</span>
        {isOutOfStock && <div style={soldOutOverlayStyles}>Sold Out</div>}
      </div>

      <div style={infoContainerStyles}>
        <div style={ratingRowStyles}>
          <div style={starsContainerStyles}>{renderStars(product.rating)}</div>
          <span style={reviewsStyles}>({product.reviews})</span>
        </div>

        <h3 style={titleStyles}>{product.name}</h3>
        <p style={descStyles}>
          {product.description.length > 80 
            ? `${product.description.substring(0, 80)}...` 
            : product.description}
        </p>

        <div style={footerRowStyles}>
          <div style={priceContainerStyles}>
            <span style={priceLabelStyles}>Price</span>
            <span style={priceStyles}>${product.price.toFixed(2)}</span>
          </div>

          <button 
            className="btn-premium" 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            style={addBtnStyles(isOutOfStock)}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add
              </>
            )}
          </button>
        </div>

        {isLowStock && (
          <div style={stockWarningStyles}>
            Only {product.stock} items left!
          </div>
        )}
      </div>
    </div>
  );
}

// Styling Objects
const cardStyles = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '20px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  height: '100%',
  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)',
};

const imageContainerStyles = {
  position: 'relative',
  paddingTop: '75%', // 4:3 Aspect Ratio
  backgroundColor: 'var(--bg-tertiary)',
  overflow: 'hidden',
};

const imageStyles = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform var(--transition-slow)',
};

const categoryBadgeStyles = {
  position: 'absolute',
  top: '12px',
  left: '12px',
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(8px)',
  border: '1px solid var(--glass-border)',
  color: 'var(--text-primary)',
  fontSize: '0.75rem',
  fontWeight: '700',
  padding: '4px 10px',
  borderRadius: '8px',
  textTransform: 'uppercase',
};

const soldOutOverlayStyles = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(3px)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  fontSize: '1.2rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

const infoContainerStyles = {
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
};

const ratingRowStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '8px',
};

const starsContainerStyles = {
  display: 'flex',
  fontSize: '0.9rem',
};

const reviewsStyles = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  fontWeight: '500',
};

const titleStyles = {
  fontSize: '1.15rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: '6px',
  lineHeight: '1.3',
};

const descStyles = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  marginBottom: '20px',
  lineHeight: '1.5',
  flexGrow: 1,
};

const footerRowStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 'auto',
};

const priceContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
};

const priceLabelStyles = {
  fontSize: '0.7rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  fontWeight: '600',
};

const priceStyles = {
  fontSize: '1.25rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
};

const addBtnStyles = (isOutOfStock) => ({
  padding: '8px 16px',
  borderRadius: '10px',
  fontSize: '0.85rem',
  background: isOutOfStock ? 'var(--text-muted)' : 'var(--accent-gradient)',
  boxShadow: isOutOfStock ? 'none' : '0 4px 10px rgba(99, 102, 241, 0.2)',
});

const stockWarningStyles = {
  fontSize: '0.75rem',
  color: 'var(--error)',
  fontWeight: '600',
  marginTop: '8px',
  textAlign: 'left',
};
