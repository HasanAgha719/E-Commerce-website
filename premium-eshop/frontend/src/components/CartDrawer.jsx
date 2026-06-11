import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer({ isOpen, onClose, onCheckout, onAuthToggle, showToast }) {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    discountCode, 
    applyDiscountCode, 
    subtotal, 
    shipping, 
    tax, 
    discountAmount, 
    total 
  } = useCart();
  
  const { user } = useAuth();
  const [promoInput, setPromoInput] = useState(discountCode || '');
  const [promoMessage, setPromoMessage] = useState(discountCode ? 'WELCOME10 (10% off) applied' : '');
  const [promoStatus, setPromoStatus] = useState(discountCode ? 'success' : '');

  if (!isOpen) return null;

  const handleQtyChange = (productId, newQty, itemStock) => {
    try {
      updateQuantity(productId, newQty);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const isValid = applyDiscountCode(promoInput);
    if (isValid) {
      setPromoMessage('Promo code applied successfully! 10% off.');
      setPromoStatus('success');
      showToast('10% off discount code applied!', 'success');
    } else {
      setPromoMessage('Invalid promo code. Try WELCOME10.');
      setPromoStatus('error');
      showToast('Invalid promo code.', 'error');
    }
  };

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty!', 'error');
      return;
    }
    onClose();
    if (!user) {
      showToast('Please login to complete your order.', 'info');
      onAuthToggle();
    } else {
      onCheckout();
    }
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div 
        style={drawerStyles} 
        onClick={(e) => e.stopPropagation()} // Stop click through to overlay
      >
        {/* Drawer Header */}
        <div style={headerStyles}>
          <h2 style={titleStyles}>Shopping Cart</h2>
          <button onClick={onClose} style={closeBtnStyles} aria-label="Close cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Drawer Content */}
        {cartItems.length === 0 ? (
          <div style={emptyStateStyles}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--text-muted)'}}><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <p style={emptyTextStyles}>Your cart is currently empty.</p>
            <button onClick={onClose} className="btn-premium" style={{marginTop: '16px'}}>
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div style={itemsContainerStyles}>
              {cartItems.map((item) => (
                <div key={item.id} style={itemStyles}>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    style={itemImageStyles}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                    }}
                  />
                  <div style={itemInfoStyles}>
                    <h4 style={itemNameStyles}>{item.name}</h4>
                    <span style={itemPriceStyles}>${item.price.toFixed(2)}</span>
                    
                    <div style={qtyRowStyles}>
                      <div style={qtySelectorStyles}>
                        <button 
                          onClick={() => handleQtyChange(item.id, item.quantity - 1, item.stock)}
                          style={qtyBtnStyles}
                        >
                          -
                        </button>
                        <span style={qtyValueStyles}>{item.quantity}</span>
                        <button 
                          onClick={() => handleQtyChange(item.id, item.quantity + 1, item.stock)}
                          style={qtyBtnStyles}
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        style={removeBtnStyles}
                        aria-label="Remove item"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Section */}
            <div style={promoContainerStyles}>
              <div style={promoInputRowStyles}>
                <input 
                  type="text" 
                  placeholder="Promo Code (WELCOME10)" 
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  style={promoInputStyles}
                />
                <button 
                  onClick={handleApplyPromo} 
                  className="btn-secondary"
                  style={promoBtnStyles}
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p style={promoMsgStyles(promoStatus)}>{promoMessage}</p>
              )}
            </div>

            {/* Invoice Summary */}
            <div style={summaryContainerStyles}>
              <div style={summaryRowStyles}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{...summaryRowStyles, color: 'var(--success)'}}>
                  <span>Discount (10%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={summaryRowStyles}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div style={summaryRowStyles}>
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div style={dividerStyles}></div>
              <div style={totalRowStyles}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button 
                className="btn-premium" 
                onClick={handleCheckoutClick}
                style={checkoutBtnStyles}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
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
  background: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(5px)',
  zIndex: 200,
  display: 'flex',
  justifyContent: 'flex-end',
};

const drawerStyles = {
  width: '100%',
  maxWidth: '460px',
  height: '100%',
  background: 'var(--bg-secondary)',
  borderLeft: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
  animation: 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
};

const headerStyles = {
  padding: '24px',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const titleStyles = {
  fontSize: '1.4rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
};

const closeBtnStyles = {
  background: 'none',
  border: 'none',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  padding: 0,
};

const emptyStateStyles = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 24px',
};

const emptyTextStyles = {
  color: 'var(--text-secondary)',
  fontSize: '1.1rem',
  fontWeight: '500',
  marginTop: '16px',
};

const itemsContainerStyles = {
  flexGrow: 1,
  overflowY: 'auto',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const itemStyles = {
  display: 'flex',
  gap: '16px',
  paddingBottom: '20px',
  borderBottom: '1px solid var(--border-color)',
};

const itemImageStyles = {
  width: '80px',
  height: '80px',
  borderRadius: '12px',
  objectFit: 'cover',
  backgroundColor: 'var(--bg-tertiary)',
};

const itemInfoStyles = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
};

const itemNameStyles = {
  fontSize: '1rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: '4px',
};

const itemPriceStyles = {
  fontSize: '1rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  marginBottom: '8px',
};

const qtyRowStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 'auto',
};

const qtySelectorStyles = {
  display: 'flex',
  alignItems: 'center',
  border: '1.5px solid var(--border-color)',
  borderRadius: '8px',
  overflow: 'hidden',
  height: '32px',
};

const qtyBtnStyles = {
  width: '32px',
  height: '100%',
  background: 'transparent',
  border: 'none',
  color: 'var(--text-primary)',
  fontWeight: '600',
  cursor: 'pointer',
};

const qtyValueStyles = {
  padding: '0 12px',
  fontSize: '0.9rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
};

const removeBtnStyles = {
  background: 'none',
  border: 'none',
  color: 'var(--error)',
  fontSize: '0.85rem',
  fontWeight: '600',
  cursor: 'pointer',
  textDecoration: 'underline',
};

const promoContainerStyles = {
  padding: '16px 24px',
  borderTop: '1px solid var(--border-color)',
  background: 'var(--bg-tertiary)',
};

const promoInputRowStyles = {
  display: 'flex',
  gap: '8px',
};

const promoInputStyles = {
  flexGrow: 1,
  padding: '8px 12px',
  borderRadius: '10px',
  border: '1.5px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
};

const promoBtnStyles = {
  padding: '0 16px',
  borderRadius: '10px',
  fontSize: '0.9rem',
};

const promoMsgStyles = (status) => ({
  fontSize: '0.8rem',
  fontWeight: '600',
  marginTop: '6px',
  color: status === 'success' ? 'var(--success)' : 'var(--error)',
});

const summaryContainerStyles = {
  padding: '24px',
  borderTop: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  background: 'var(--bg-secondary)',
};

const summaryRowStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.95rem',
  color: 'var(--text-secondary)',
  fontWeight: '500',
};

const dividerStyles = {
  height: '1px',
  background: 'var(--border-color)',
  margin: '4px 0',
};

const totalRowStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '1.25rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
  marginBottom: '8px',
};

const checkoutBtnStyles = {
  width: '100%',
  height: '48px',
};
