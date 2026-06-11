import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header({ 
  onCartToggle, 
  onAuthToggle, 
  theme, 
  onThemeToggle, 
  onOrdersToggle 
}) {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="header glass" style={headerStyles}>
      <div className="header-container" style={containerStyles}>
        <div className="logo" style={logoStyles} onClick={() => window.location.reload()}>
          <span style={logoTextStyles}></span>
          <span style={logoSubStyles}>E-Shop</span>
        </div>

        <nav className="nav-links" style={navStyles}>
          <button 
            onClick={onThemeToggle} 
            className="theme-toggle" 
            style={iconBtnStyles} 
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              // Sun Icon
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              // Moon Icon
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
          </button>

          <button onClick={onCartToggle} className="cart-btn" style={cartBtnStyles}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <span>Cart</span>
            {totalItems > 0 && <span style={badgeStyles}>{totalItems}</span>}
          </button>

          {user ? (
            <div style={userActionsStyles}>
              <button onClick={onOrdersToggle} className="btn-secondary" style={userBtnStyles}>
                Orders
              </button>
              <div style={welcomeTextStyles}>
                <span>Hi, <strong>{user.name}</strong></span>
                <button onClick={logout} style={logoutBtnStyles}>Logout</button>
              </div>
            </div>
          ) : (
            <button onClick={onAuthToggle} className="btn-premium" style={loginBtnStyles}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

// Styling details using inline CSS objects mixed with layout constants
const headerStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  height: '70px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 24px',
  borderBottom: '1px solid var(--border-color)',
};

const containerStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto',
};

const logoStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
};

const logoTextStyles = {
  fontSize: '1.4rem',
  fontWeight: '800',
  letterSpacing: '-0.5px',
  color: 'var(--text-primary)',
};

const logoSubStyles = {
  fontSize: '0.85rem',
  fontWeight: '600',
  background: 'var(--accent-gradient)',
  color: '#ffffff',
  padding: '2px 8px',
  borderRadius: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const navStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const iconBtnStyles = {
  background: 'transparent',
  border: '1.5px solid var(--border-color)',
  color: 'var(--text-primary)',
  borderRadius: '12px',
  width: '42px',
  height: '42px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
};

const cartBtnStyles = {
  position: 'relative',
  background: 'var(--bg-secondary)',
  border: '1.5px solid var(--border-color)',
  color: 'var(--text-primary)',
  borderRadius: '12px',
  padding: '0 16px',
  height: '42px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  transition: 'all var(--transition-fast)',
};

const badgeStyles = {
  position: 'absolute',
  top: '-6px',
  right: '-6px',
  background: 'var(--error)',
  color: '#ffffff',
  fontSize: '0.75rem',
  fontWeight: '700',
  borderRadius: '999px',
  width: '18px',
  height: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const userActionsStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const userBtnStyles = {
  padding: '8px 16px',
  height: '42px',
  borderRadius: '12px',
  fontSize: '0.9rem',
};

const loginBtnStyles = {
  padding: '0 18px',
  height: '42px',
  borderRadius: '12px',
};

const welcomeTextStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.2',
};

const logoutBtnStyles = {
  background: 'none',
  border: 'none',
  color: 'var(--error)',
  cursor: 'pointer',
  padding: 0,
  fontSize: '0.8rem',
  fontWeight: '600',
  marginTop: '2px',
  textDecoration: 'underline',
};
