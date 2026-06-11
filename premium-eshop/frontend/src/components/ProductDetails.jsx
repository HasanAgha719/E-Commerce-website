import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductDetails({ product, onClose, showToast }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Standard');

  if (!product) return null;

  const handleAddToCart = () => {
    try {
      addToCart(product, quantity);
      showToast(`${quantity}x ${product.name} added to cart!`, 'success');
      onClose();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const incrementQty = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      showToast(`Only ${product.stock} items left in stock.`, 'error');
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Render Star Ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} style={{ color: '#fbbf24' }}>★</span>);
      } else {
        stars.push(<span key={i} style={{ color: 'var(--text-muted)' }}>☆</span>);
      }
    }
    return stars;
  };

  const isOutOfStock = product.stock === 0;

  // Set mock choices based on category
  const sizes = product.category === 'Fashion' ? ['S', 'M', 'L', 'XL'] : ['Standard', 'Pro Edition'];

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div 
        style={modalStyles} 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={closeBtnStyles} aria-label="Close details">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div style={containerStyles}>
          {/* Product Image */}
          <div style={imageColStyles}>
            <img 
              src={product.image} 
              alt={product.name} 
              style={imageStyles}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
              }}
            />
          </div>

          {/* Product Info */}
          <div style={infoColStyles}>
            <span style={categoryBadgeStyles}>{product.category}</span>
            <h2 style={titleStyles}>{product.name}</h2>
            
            <div style={ratingRowStyles}>
              <div style={starsStyles}>{renderStars(product.rating)}</div>
              <span style={reviewsStyles}>{product.rating} / 5 ({product.reviews} reviews)</span>
            </div>

            <div style={priceStyles}>${product.price.toFixed(2)}</div>

            <div style={dividerStyles}></div>

            <p style={descriptionStyles}>{product.description}</p>

            {/* Spec Options */}
            {!isOutOfStock && (
              <div style={optionsStyles}>
                <div style={optionGroupStyles}>
                  <label style={labelStyles}>Configuration / Size</label>
                  <div style={pillContainerStyles}>
                    {sizes.map((sz) => (
                      <button 
                        key={sz} 
                        onClick={() => setSelectedSize(sz)}
                        style={pillStyles(selectedSize === sz)}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={optionGroupStyles}>
                  <label style={labelStyles}>Quantity</label>
                  <div style={qtySelectorStyles}>
                    <button onClick={decrementQty} style={qtyBtnStyles}>-</button>
                    <span style={qtyValStyles}>{quantity}</span>
                    <button onClick={incrementQty} style={qtyBtnStyles}>+</button>
                  </div>
                </div>
              </div>
            )}

            {/* Add to Cart Actions */}
            <div style={actionRowStyles}>
              {isOutOfStock ? (
                <div style={outOfStockBannerStyles}>Currently Out of Stock</div>
              ) : (
                <>
                  <button 
                    className="btn-premium" 
                    onClick={handleAddToCart}
                    style={addBtnStyles}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    Add to Cart • ${(product.price * quantity).toFixed(2)}
                  </button>
                  
                  <div style={stockCountStyles(product.stock <= 5)}>
                    {product.stock <= 5 
                      ? `Hurry! Only ${product.stock} items remaining.` 
                      : `In Stock: ${product.stock} units available.`}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styling Objects
const overlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(8px)',
  zIndex: 350,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
};

const modalStyles = {
  width: '100%',
  maxWidth: '920px',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '28px',
  padding: '40px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  position: 'relative',
  animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
};

const closeBtnStyles = {
  position: 'absolute',
  top: '24px',
  right: '24px',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 10,
  transition: 'transform var(--transition-fast)',
};

const containerStyles = {
  display: 'flex',
  gap: '40px',
  flexWrap: 'wrap',
};

const imageColStyles = {
  flex: '1 1 380px',
  borderRadius: '20px',
  overflow: 'hidden',
  backgroundColor: 'var(--bg-tertiary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '350px',
};

const imageStyles = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  maxHeight: '450px',
};

const infoColStyles = {
  flex: '1.2 1 380px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

const categoryBadgeStyles = {
  background: 'rgba(99, 102, 241, 0.15)',
  color: 'var(--accent)',
  fontSize: '0.8rem',
  fontWeight: '700',
  padding: '4px 12px',
  borderRadius: '8px',
  textTransform: 'uppercase',
  marginBottom: '16px',
};

const titleStyles = {
  fontSize: '2rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
  marginBottom: '10px',
  lineHeight: '1.2',
};

const ratingRowStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '20px',
};

const starsStyles = {
  fontSize: '1.1rem',
};

const reviewsStyles = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  fontWeight: '500',
};

const priceStyles = {
  fontSize: '2rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
  marginBottom: '20px',
};

const dividerStyles = {
  width: '100%',
  height: '1px',
  background: 'var(--border-color)',
  marginBottom: '20px',
};

const descriptionStyles = {
  fontSize: '0.95rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
  marginBottom: '24px',
};

const optionsStyles = {
  display: 'flex',
  gap: '32px',
  marginBottom: '28px',
  flexWrap: 'wrap',
  width: '100%',
};

const optionGroupStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const labelStyles = {
  fontSize: '0.8rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
};

const pillContainerStyles = {
  display: 'flex',
  gap: '8px',
};

const pillStyles = (isActive) => ({
  padding: '8px 16px',
  borderRadius: '10px',
  border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border-color)'}`,
  background: isActive ? 'var(--accent)' : 'transparent',
  color: isActive ? '#ffffff' : 'var(--text-primary)',
  fontWeight: '600',
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
});

const qtySelectorStyles = {
  display: 'flex',
  alignItems: 'center',
  border: '1.5px solid var(--border-color)',
  borderRadius: '10px',
  height: '38px',
};

const qtyBtnStyles = {
  width: '38px',
  height: '100%',
  background: 'transparent',
  border: 'none',
  color: 'var(--text-primary)',
  fontWeight: '600',
  fontSize: '1.1rem',
  cursor: 'pointer',
};

const qtyValStyles = {
  padding: '0 16px',
  fontSize: '0.95rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
};

const actionRowStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  width: '100%',
};

const addBtnStyles = {
  width: '100%',
  height: '50px',
  fontSize: '1.05rem',
};

const stockCountStyles = (isLow) => ({
  fontSize: '0.85rem',
  color: isLow ? 'var(--error)' : 'var(--success)',
  fontWeight: '600',
});

const outOfStockBannerStyles = {
  width: '100%',
  height: '50px',
  background: 'var(--border-color)',
  color: 'var(--text-muted)',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  fontSize: '1rem',
};
