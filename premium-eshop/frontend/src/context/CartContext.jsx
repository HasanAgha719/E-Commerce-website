import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountRate, setDiscountRate] = useState(0);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('eshop_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  const saveCart = (newItems) => {
    setCartItems(newItems);
    localStorage.setItem('eshop_cart', JSON.stringify(newItems));
  };

  const addToCart = (product, quantity = 1) => {
    const existingIndex = cartItems.findIndex(item => item.id === product.id);
    
    if (existingIndex > -1) {
      const updatedItems = [...cartItems];
      const newQty = updatedItems[existingIndex].quantity + quantity;
      
      // Limit to stock
      if (newQty > product.stock) {
        throw new Error(`Only ${product.stock} items available in stock.`);
      }
      
      updatedItems[existingIndex].quantity = newQty;
      saveCart(updatedItems);
    } else {
      if (quantity > product.stock) {
        throw new Error(`Only ${product.stock} items available in stock.`);
      }
      saveCart([...cartItems, { ...product, quantity }]);
    }
  };

  const removeFromCart = (productId) => {
    const updatedItems = cartItems.filter(item => item.id !== productId);
    saveCart(updatedItems);
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const updatedItems = cartItems.map(item => {
      if (item.id === productId) {
        if (newQty > item.stock) {
          throw new Error(`Only ${item.stock} items available in stock.`);
        }
        return { ...item, quantity: newQty };
      }
      return item;
    });
    
    saveCart(updatedItems);
  };

  const applyDiscountCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    setDiscountCode(cleanCode);
    if (cleanCode === 'WELCOME10') {
      setDiscountRate(0.10);
      return true;
    } else {
      setDiscountRate(0);
      return false;
    }
  };

  const clearCart = () => {
    saveCart([]);
    setDiscountCode('');
    setDiscountRate(0);
  };

  // Financial Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15.00;
  const tax = subtotal * 0.08;
  const discountAmount = subtotal * discountRate;
  const total = subtotal + tax + shipping - discountAmount;

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    discountCode,
    discountRate,
    applyDiscountCode,
    clearCart,
    subtotal: parseFloat(subtotal.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
