import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import OrderHistory from './components/OrderHistory';
import ProductDetails from './components/ProductDetails';

function MainLayout() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('rating');
  
  // Modals & Panels State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch Products on Filter changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('q', search);
        if (category && category !== 'All') queryParams.append('category', category);
        if (sort) queryParams.append('sort', sort);

        const response = await fetch(`http://localhost:5000/api/products?${queryParams.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          setProducts(data);
        } else {
          showToast('Failed to load products.', 'error');
        }
      } catch (err) {
        showToast('Server connection error.', 'error');
      } finally {
        setLoading(false);
      }
    };

    // Minor debounce delay for search typing
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, category, sort]);

  // Toast Handler
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <Header 
        onCartToggle={() => setIsCartOpen(true)}
        onAuthToggle={() => setIsAuthOpen(true)}
        theme={theme}
        onThemeToggle={toggleTheme}
        onOrdersToggle={() => setIsOrdersOpen(true)}
      />

      <main className="main-content">
        {/* Hero Banner Section */}
        <section style={heroStyles}>
          <div style={heroOverlayStyles}></div>
          <div style={heroContentStyles}>
            <span style={heroTagStyles}>Welcome to Antigravity Shop</span>
            <h1 style={heroTitleStyles}>
              Experience Premium <span className="gradient-text">Future Electronics</span>
            </h1>
            <p style={heroSubStyles}>
              Discover handcrafted devices designed with high aesthetics and sleek performance. Save 10% on checkout with code <strong style={{color: 'var(--accent-light)'}}>WELCOME10</strong>.
            </p>
            <div style={heroBtnGroupStyles}>
              <a href="#storefront" className="btn-premium" style={{textDecoration: 'none'}}>
                Explore Products
              </a>
              <button 
                className="btn-secondary" 
                onClick={() => showToast("Try checking out the Mech Keyboard!", "info")}
                style={{borderColor: '#ffffff', color: '#ffffff', background: 'rgba(255,255,255,0.05)'}}
              >
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Storefront Section */}
        <section id="storefront" style={storefrontStyles}>
          {/* Search and Filters Bar */}
          <div className="glass" style={filterBarStyles}>
            <div style={searchWrapperStyles}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={searchIconStyles}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchInputStyles}
              />
            </div>

            <div style={categoriesContainerStyles}>
              {['All', 'Audio', 'Fashion', 'Home', 'Accessories', 'Tech'].map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setCategory(cat)}
                  style={categoryPillStyles(category === cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={sortWrapperStyles}>
              <label style={sortLabelStyles}>Sort By</label>
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                style={sortSelectStyles}
              >
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={productsGridStyles}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="shimmer" style={shimmerCardStyles}></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={noProductsStyles}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--text-muted)'}}><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              <h3>No items found matching filters</h3>
              <p>Try clearing your search query or choosing another category.</p>
              <button 
                className="btn-secondary" 
                onClick={() => { setSearch(''); setCategory('All'); }}
                style={{marginTop: '12px'}}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={productsGridStyles}>
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onSelect={setSelectedProduct}
                  showToast={showToast}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer style={footerStyles}>
        <div style={footerContainerStyles}>
          <div>
            <h3>Antigravity Shop</h3>
            <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '300px'}}>
              Building next-generation e-commerce with premium responsive experiences.
            </p>
          </div>
          <div style={footerRightStyles}>
            <span>Developer Sandbox Project</span>
            <span>Created by Antigravity Agent</span>
          </div>
        </div>
      </footer>

      {/* DRAWERS & MODALS */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => setIsCheckoutOpen(true)}
        onAuthToggle={() => setIsAuthOpen(true)}
        showToast={showToast}
      />

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        showToast={showToast}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        showToast={showToast}
      />

      <OrderHistory 
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        showToast={showToast}
      />

      {selectedProduct && (
        <ProductDetails 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          showToast={showToast}
        />
      )}

      {/* TOAST SYSTEM */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            )}
            {toast.type === 'error' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            )}
            {toast.type === 'info' && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainLayout />
      </CartProvider>
    </AuthProvider>
  );
}

// Styling Objects
const heroStyles = {
  position: 'relative',
  background: 'linear-gradient(135deg, #111827 0%, #1e1b4b 100%)',
  borderRadius: '28px',
  padding: '64px 48px',
  overflow: 'hidden',
  marginBottom: '40px',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
};

const heroOverlayStyles = {
  position: 'absolute',
  top: '-50%',
  right: '-30%',
  width: '500px',
  height: '500px',
  background: 'var(--accent-gradient)',
  borderRadius: '50%',
  filter: 'blur(120px)',
  opacity: 0.15,
};

const heroContentStyles = {
  position: 'relative',
  zIndex: 2,
  maxWidth: '680px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

const heroTagStyles = {
  background: 'rgba(255, 255, 255, 0.1)',
  color: '#ffffff',
  fontSize: '0.8rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  padding: '4px 12px',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.15)',
  marginBottom: '20px',
  letterSpacing: '0.5px',
};

const heroTitleStyles = {
  color: '#ffffff',
  fontSize: '2.8rem',
  fontWeight: '800',
  lineHeight: '1.2',
  marginBottom: '16px',
};

const heroSubStyles = {
  color: '#cbd5e1',
  fontSize: '1.05rem',
  lineHeight: '1.5',
  marginBottom: '28px',
};

const heroBtnGroupStyles = {
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap',
};

const storefrontStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const filterBarStyles = {
  padding: '16px 24px',
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '20px',
  flexWrap: 'wrap',
  border: '1px solid var(--border-color)',
};

const searchWrapperStyles = {
  position: 'relative',
  flex: '1 1 280px',
  maxWidth: '400px',
};

const searchIconStyles = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)',
};

const searchInputStyles = {
  width: '100%',
  height: '42px',
  padding: '0 16px 0 44px',
  borderRadius: '12px',
  border: '1.5px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  outline: 'none',
  fontSize: '0.9rem',
};

const categoriesContainerStyles = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

const categoryPillStyles = (isActive) => ({
  padding: '8px 16px',
  borderRadius: '10px',
  border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border-color)'}`,
  background: isActive ? 'var(--accent)' : 'var(--bg-secondary)',
  color: isActive ? '#ffffff' : 'var(--text-primary)',
  fontWeight: '600',
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
});

const sortWrapperStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const sortLabelStyles = {
  fontSize: '0.8rem',
  fontWeight: '700',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
};

const sortSelectStyles = {
  height: '42px',
  padding: '0 12px',
  borderRadius: '12px',
  border: '1.5px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  outline: 'none',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
};

const productsGridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '24px',
};

const shimmerCardStyles = {
  height: '400px',
  borderRadius: '20px',
};

const noProductsStyles = {
  padding: '64px 24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: '8px',
  background: 'var(--bg-secondary)',
  border: '1.5px solid var(--border-color)',
  borderRadius: '20px',
  color: 'var(--text-primary)',
};

const footerStyles = {
  borderTop: '1px solid var(--border-color)',
  padding: '32px 24px',
  marginTop: '64px',
  background: 'var(--bg-secondary)',
};

const footerContainerStyles = {
  maxWidth: '1400px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '20px',
};

const footerRightStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  fontSize: '0.8rem',
  color: 'var(--text-muted)',
  gap: '4px',
};
