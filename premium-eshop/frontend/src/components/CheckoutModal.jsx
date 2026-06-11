import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutModal({ isOpen, onClose, showToast }) {
  const { cartItems, subtotal, shipping, tax, discountCode, discountAmount, total, clearCart } = useCart();
  const { token } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Processing, 4: Success
  const [orderReceipt, setOrderReceipt] = useState(null);

  // Form States
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  if (!isOpen) return null;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !address || !city || !zip || !phone) {
      showToast('Please complete all shipping details.', 'error');
      return;
    }
    setStep(2);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      showToast('Please complete all credit card details.', 'error');
      return;
    }

    setStep(3); // Go to Processing State

    // Simulate Network Request delay for payment processing
    setTimeout(async () => {
      try {
        const orderData = {
          items: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
          shippingAddress: {
            fullName,
            address,
            city,
            zip,
            phone
          },
          paymentMethod: 'Credit Card',
          discountCode: discountCode || null
        };

        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to place order');
        }

        setOrderReceipt(data.order);
        clearCart();
        setStep(4); // Success screen
        showToast('Order placed successfully!', 'success');
      } catch (err) {
        showToast(err.message, 'error');
        setStep(2); // Go back to payment step
      }
    }, 2000);
  };

  const handleDoneClick = () => {
    // Reset modal state
    setStep(1);
    setFullName('');
    setAddress('');
    setCity('');
    setZip('');
    setPhone('');
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setOrderReceipt(null);
    onClose();
  };

  return (
    <div style={overlayStyles} onClick={step === 3 ? null : onClose}>
      <div 
        style={modalStyles} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Hidden on success/processing) */}
        {step < 3 && (
          <div style={headerStyles}>
            <h2 style={titleStyles}>
              {step === 1 ? 'Shipping Details' : 'Secure Payment'}
            </h2>
            <button onClick={onClose} style={closeBtnStyles} aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        )}

        {/* STEP 1: SHIPPING DETAILS */}
        {step === 1 && (
          <form onSubmit={handleShippingSubmit} style={formStyles}>
            <div style={formGroupStyles}>
              <label style={labelStyles}>Full Name</label>
              <input 
                type="text" 
                placeholder="Jane Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={inputStyles}
                required
              />
            </div>
            <div style={formGroupStyles}>
              <label style={labelStyles}>Address Line</label>
              <input 
                type="text" 
                placeholder="123 Luxury Ave, Apt 4B" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={inputStyles}
                required
              />
            </div>
            <div style={rowInputStyles}>
              <div style={{...formGroupStyles, flex: 2}}>
                <label style={labelStyles}>City</label>
                <input 
                  type="text" 
                  placeholder="New York" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={inputStyles}
                  required
                />
              </div>
              <div style={{...formGroupStyles, flex: 1}}>
                <label style={labelStyles}>ZIP Code</label>
                <input 
                  type="text" 
                  placeholder="10001" 
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  style={inputStyles}
                  required
                />
              </div>
            </div>
            <div style={formGroupStyles}>
              <label style={labelStyles}>Phone Number</label>
              <input 
                type="tel" 
                placeholder="+1 (555) 019-2834" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyles}
                required
              />
            </div>
            <button type="submit" className="btn-premium" style={submitBtnStyles}>
              Continue to Payment
            </button>
          </form>
        )}

        {/* STEP 2: CREDIT CARD PAYMENT */}
        {step === 2 && (
          <form onSubmit={handlePaymentSubmit} style={formStyles}>
            <div style={orderSummaryBoxStyles}>
              <h4 style={summaryTitleStyles}>Order Total Summary</h4>
              <div style={summaryRowStyles}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{...summaryRowStyles, color: 'var(--success)'}}>
                  <span>Discount (10%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={summaryRowStyles}>
                <span>Shipping & Tax:</span>
                <span>${(shipping + tax).toFixed(2)}</span>
              </div>
              <div style={totalSummaryRowStyles}>
                <span>Amount to Pay:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div style={formGroupStyles}>
              <label style={labelStyles}>Cardholder Name</label>
              <input 
                type="text" 
                placeholder="Jane Doe" 
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                style={inputStyles}
                required
              />
            </div>
            <div style={formGroupStyles}>
              <label style={labelStyles}>Card Number</label>
              <input 
                type="text" 
                placeholder="4111 2222 3333 4444" 
                maxLength="19"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                style={inputStyles}
                required
              />
            </div>
            <div style={rowInputStyles}>
              <div style={{...formGroupStyles, flex: 1}}>
                <label style={labelStyles}>Expiry Date</label>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  maxLength="5"
                  value={cardExpiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 2) val = val.substring(0,2) + '/' + val.substring(2,4);
                    setCardExpiry(val);
                  }}
                  style={inputStyles}
                  required
                />
              </div>
              <div style={{...formGroupStyles, flex: 1}}>
                <label style={labelStyles}>CVV</label>
                <input 
                  type="password" 
                  placeholder="•••" 
                  maxLength="3"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                  style={inputStyles}
                  required
                />
              </div>
            </div>

            <div style={btnRowStyles}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setStep(1)}
                style={{flex: 1}}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="btn-premium" 
                style={{flex: 2}}
              >
                Pay ${total.toFixed(2)}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: PROCESSING PAYMENT */}
        {step === 3 && (
          <div style={processingContainerStyles}>
            <div style={spinnerStyles}></div>
            <h3 style={processingTitleStyles}>Processing Secure Payment</h3>
            <p style={processingSubtitleStyles}>
              Please do not refresh the page or click back. We are verifying details with your bank.
            </p>
          </div>
        )}

        {/* STEP 4: ORDER SUCCESS RECEIPT */}
        {step === 4 && orderReceipt && (
          <div style={receiptContainerStyles}>
            <div style={successIconStyles}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 style={receiptHeaderTitleStyles}>Order Confirmed!</h3>
            <p style={receiptSubtitleStyles}>
              Thank you for shopping with us. Your invoice has been generated successfully.
            </p>

            <div style={invoiceCardStyles}>
              <div style={invoiceHeaderStyles}>
                <span>Order Reference:</span>
                <strong>{orderReceipt.id}</strong>
              </div>
              <div style={invoiceDividerStyles}></div>
              
              <div style={invoiceItemsListStyles}>
                {orderReceipt.items.map((item, idx) => (
                  <div key={idx} style={invoiceItemRowStyles}>
                    <span>{item.name} <span style={{color: 'var(--text-muted)'}}>x{item.quantity}</span></span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div style={invoiceDividerStyles}></div>

              <div style={invoiceDetailRowStyles}>
                <span>Subtotal:</span>
                <span>${orderReceipt.financials.subtotal.toFixed(2)}</span>
              </div>
              {orderReceipt.financials.discount > 0 && (
                <div style={{...invoiceDetailRowStyles, color: 'var(--success)'}}>
                  <span>Discount (10%):</span>
                  <span>-${orderReceipt.financials.discount.toFixed(2)}</span>
                </div>
              )}
              <div style={invoiceDetailRowStyles}>
                <span>Shipping:</span>
                <span>{orderReceipt.financials.shipping === 0 ? 'Free' : `$${orderReceipt.financials.shipping.toFixed(2)}`}</span>
              </div>
              <div style={invoiceDetailRowStyles}>
                <span>Tax:</span>
                <span>${orderReceipt.financials.tax.toFixed(2)}</span>
              </div>
              <div style={invoiceDividerStyles}></div>
              <div style={invoiceTotalRowStyles}>
                <span>Total Paid:</span>
                <span>${orderReceipt.financials.total.toFixed(2)}</span>
              </div>
            </div>

            <div style={shippingDetailsBoxStyles}>
              <h5 style={shipTitleStyles}>Shipment Destination</h5>
              <p style={shipTextStyles}><strong>{orderReceipt.shippingAddress.fullName}</strong></p>
              <p style={shipTextStyles}>{orderReceipt.shippingAddress.address}</p>
              <p style={shipTextStyles}>{orderReceipt.shippingAddress.city}, {orderReceipt.shippingAddress.zip}</p>
              <p style={shipTextStyles}>Phone: {orderReceipt.shippingAddress.phone}</p>
            </div>

            <button 
              onClick={handleDoneClick} 
              className="btn-premium" 
              style={doneBtnStyles}
            >
              Continue Shopping
            </button>
          </div>
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
  zIndex: 300,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
};

const modalStyles = {
  width: '100%',
  maxWidth: '480px',
  maxHeight: '90vh',
  overflowY: 'auto',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '24px',
  padding: '32px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  display: 'flex',
  flexDirection: 'column',
  animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
};

const headerStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
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

const formStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const formGroupStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyles = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
};

const inputStyles = {
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1.5px solid var(--border-color)',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  fontSize: '0.95rem',
  outline: 'none',
};

const rowInputStyles = {
  display: 'flex',
  gap: '12px',
};

const submitBtnStyles = {
  width: '100%',
  height: '46px',
  marginTop: '12px',
};

const btnRowStyles = {
  display: 'flex',
  gap: '12px',
  marginTop: '12px',
};

const orderSummaryBoxStyles = {
  background: 'var(--bg-tertiary)',
  padding: '16px',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginBottom: '8px',
};

const summaryTitleStyles = {
  fontSize: '0.9rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  borderBottom: '1px dashed var(--border-color)',
  paddingBottom: '6px',
  marginBottom: '4px',
};

const summaryRowStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.85rem',
  fontWeight: '500',
  color: 'var(--text-secondary)',
};

const totalSummaryRowStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '1.05rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '6px',
  marginTop: '4px',
};

/* STEP 3 Processing Styles */
const processingContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 0',
  textAlign: 'center',
};

const spinnerStyles = {
  width: '50px',
  height: '50px',
  border: '4px solid var(--border-color)',
  borderTop: '4px solid var(--accent)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '24px',
};

const processingTitleStyles = {
  fontSize: '1.3rem',
  fontWeight: '800',
  marginBottom: '8px',
};

const processingSubtitleStyles = {
  fontSize: '0.9rem',
  color: 'var(--text-secondary)',
  maxWidth: '320px',
  lineHeight: '1.5',
};

/* STEP 4 Success Receipt Styles */
const receiptContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const successIconStyles = {
  background: 'var(--success)',
  borderRadius: '50%',
  width: '64px',
  height: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
  marginBottom: '20px',
};

const receiptHeaderTitleStyles = {
  fontSize: '1.6rem',
  fontWeight: '800',
  marginBottom: '8px',
  color: 'var(--text-primary)',
};

const receiptSubtitleStyles = {
  fontSize: '0.9rem',
  color: 'var(--text-secondary)',
  textAlign: 'center',
  marginBottom: '24px',
  maxWidth: '380px',
  lineHeight: '1.4',
};

const invoiceCardStyles = {
  width: '100%',
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
  borderRadius: '16px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginBottom: '20px',
};

const invoiceHeaderStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.9rem',
  color: 'var(--text-secondary)',
};

const invoiceDividerStyles = {
  height: '1px',
  background: 'var(--border-color)',
  margin: '8px 0',
};

const invoiceItemsListStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const invoiceItemRowStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.9rem',
  fontWeight: '500',
  color: 'var(--text-primary)',
};

const invoiceDetailRowStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
};

const invoiceTotalRowStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '1.15rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
};

const shippingDetailsBoxStyles = {
  width: '100%',
  border: '1.5px solid var(--border-color)',
  borderRadius: '16px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  marginBottom: '24px',
};

const shipTitleStyles = {
  fontSize: '0.85rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '6px',
};

const shipTextStyles = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.4',
};

const doneBtnStyles = {
  width: '100%',
  height: '46px',
};
