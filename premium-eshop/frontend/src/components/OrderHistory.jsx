import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function OrderHistory({ isOpen, onClose, showToast }) {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (isOpen && token) {
      fetchOrders();
    }
  }, [isOpen, token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }
      setOrders(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const toggleExpandOrder = (id) => {
    if (expandedOrderId === id) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(id);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div 
        style={drawerStyles} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={headerStyles}>
          <h2 style={titleStyles}>Your Orders</h2>
          <button onClick={onClose} style={closeBtnStyles} aria-label="Close orders">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {loading ? (
          <div style={loadingContainerStyles}>
            <div style={spinnerStyles}></div>
            <p style={{color: 'var(--text-secondary)'}}>Fetching order history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={emptyContainerStyles}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--text-muted)', marginBottom: '16px'}}><rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect><line x1="16" y1="8" x2="8" y2="8"></line><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="18" x2="8" y2="18"></line></svg>
            <p style={{color: 'var(--text-secondary)', fontWeight: '500'}}>No orders placed yet.</p>
          </div>
        ) : (
          <div style={ordersListStyles}>
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              
              return (
                <div key={order.id} style={orderCardStyles(isExpanded)}>
                  <div 
                    onClick={() => toggleExpandOrder(order.id)}
                    style={orderSummaryRowStyles}
                  >
                    <div style={orderMetaStyles}>
                      <span style={orderIdStyles}>{order.id}</span>
                      <span style={orderDateStyles}>{formatDate(order.date)}</span>
                    </div>

                    <div style={orderStatusBlockStyles}>
                      <span style={statusBadgeStyles(order.status)}>{order.status}</span>
                      <strong style={orderTotalStyles}>${order.financials.total.toFixed(2)}</strong>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={expandedDetailsStyles}>
                      <div style={dividerStyles}></div>
                      <h5 style={subheadingStyles}>Items Ordered</h5>
                      <div style={itemsListStyles}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={itemRowStyles}>
                            <span style={itemNameStyles}>
                              {item.name} <span style={{color: 'var(--text-muted)'}}>x{item.quantity}</span>
                            </span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div style={dividerStyles}></div>
                      <h5 style={subheadingStyles}>Delivery Address</h5>
                      <p style={addressTextStyles}><strong>{order.shippingAddress.fullName}</strong></p>
                      <p style={addressTextStyles}>{order.shippingAddress.address}</p>
                      <p style={addressTextStyles}>{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                      <p style={addressTextStyles}>Phone: {order.shippingAddress.phone}</p>

                      <div style={dividerStyles}></div>
                      <div style={financialBreakdownStyles}>
                        <div style={breakdownRowStyles}>
                          <span>Subtotal:</span>
                          <span>${order.financials.subtotal.toFixed(2)}</span>
                        </div>
                        {order.financials.discount > 0 && (
                          <div style={{...breakdownRowStyles, color: 'var(--success)'}}>
                            <span>Discount:</span>
                            <span>-${order.financials.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div style={breakdownRowStyles}>
                          <span>Shipping:</span>
                          <span>{order.financials.shipping === 0 ? 'Free' : `$${order.financials.shipping.toFixed(2)}`}</span>
                        </div>
                        <div style={breakdownRowStyles}>
                          <span>Tax:</span>
                          <span>${order.financials.tax.toFixed(2)}</span>
                        </div>
                        <div style={{...breakdownRowStyles, fontWeight: '700', color: 'var(--text-primary)', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginTop: '4px'}}>
                          <span>Total Paid:</span>
                          <span>${order.financials.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
  zIndex: 250,
  display: 'flex',
  justifyContent: 'flex-end',
};

const drawerStyles = {
  width: '100%',
  maxWidth: '500px',
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

const loadingContainerStyles = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
};

const spinnerStyles = {
  width: '40px',
  height: '40px',
  border: '3px solid var(--border-color)',
  borderTop: '3px solid var(--accent)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '16px',
};

const emptyContainerStyles = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
};

const ordersListStyles = {
  flexGrow: 1,
  overflowY: 'auto',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const orderCardStyles = (isExpanded) => ({
  background: 'var(--bg-primary)',
  border: `1.5px solid ${isExpanded ? 'var(--accent)' : 'var(--border-color)'}`,
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'border-color var(--transition-fast)',
});

const orderSummaryRowStyles = {
  padding: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
};

const orderMetaStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const orderIdStyles = {
  fontSize: '0.95rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
};

const orderDateStyles = {
  fontSize: '0.8rem',
  color: 'var(--text-muted)',
  fontWeight: '500',
};

const orderStatusBlockStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '6px',
};

const statusBadgeStyles = (status) => {
  let bg = 'var(--accent)';
  if (status === 'Completed') bg = 'var(--success)';
  else if (status === 'Processing') bg = 'rgba(99, 102, 241, 0.15)';
  
  return {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: status === 'Processing' ? 'var(--accent)' : '#ffffff',
    background: bg,
    padding: '2px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
  };
};

const orderTotalStyles = {
  fontSize: '1.1rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
};

const expandedDetailsStyles = {
  padding: '0 20px 20px 20px',
  animation: 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
};

const dividerStyles = {
  height: '1px',
  background: 'var(--border-color)',
  margin: '12px 0',
};

const subheadingStyles = {
  fontSize: '0.8rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '8px',
};

const itemsListStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const itemRowStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.9rem',
  fontWeight: '500',
  color: 'var(--text-primary)',
};

const itemNameStyles = {
  color: 'var(--text-secondary)',
};

const addressTextStyles = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.4',
};

const financialBreakdownStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const breakdownRowStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
};
