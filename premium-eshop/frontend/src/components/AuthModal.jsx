import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, showToast }) {
  const { login, register } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLoginView && !name)) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isLoginView) {
        await login(email, password);
        showToast('Successfully logged in!', 'success');
      } else {
        await register(name, email, password);
        showToast('Successfully registered and logged in!', 'success');
      }
      onClose();
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div 
        style={modalStyles} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={headerStyles}>
          <h2 style={titleStyles}>{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
          <button onClick={onClose} style={closeBtnStyles} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={formStyles}>
          {!isLoginView && (
            <div style={formGroupStyles}>
              <label style={labelStyles}>Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyles}
                required
              />
            </div>
          )}

          <div style={formGroupStyles}>
            <label style={labelStyles}>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyles}
              required
            />
          </div>

          <div style={formGroupStyles}>
            <label style={labelStyles}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyles}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-premium" 
            style={submitBtnStyles}
            disabled={loading}
          >
            {loading ? (
              <span className="shimmer" style={loadingShimmerStyles}>Loading...</span>
            ) : isLoginView ? (
              'Login'
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div style={footerStyles}>
          <p style={footerTextStyles}>
            {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => setIsLoginView(!isLoginView)} 
              style={switchBtnStyles}
            >
              {isLoginView ? 'Sign Up' : 'Login'}
            </button>
          </p>
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
  maxWidth: '420px',
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
  fontSize: '1.5rem',
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
  gap: '20px',
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
  transition: 'border-color var(--transition-fast)',
  outline: 'none',
};

const submitBtnStyles = {
  width: '100%',
  height: '46px',
  marginTop: '8px',
};

const footerStyles = {
  marginTop: '24px',
  textAlign: 'center',
};

const footerTextStyles = {
  fontSize: '0.9rem',
  color: 'var(--text-secondary)',
};

const switchBtnStyles = {
  background: 'none',
  border: 'none',
  color: 'var(--accent)',
  fontWeight: '700',
  cursor: 'pointer',
  textDecoration: 'underline',
  padding: 0,
};

const loadingShimmerStyles = {
  display: 'inline-block',
  width: '100%',
  height: '100%',
  textAlign: 'center',
};
