import React, { createContext, useContext, useState, useEffect } from 'react';
import { products } from '../data/products';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('suguna_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [compareList, setCompareList] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    localStorage.setItem('suguna_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const toggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 products only.");
        return prev;
      }
      return [...prev, product];
    });
  };

  const addToRecentlyViewed = (product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 5);
    });
  };

  // Sync stored cart prices with latest prices from products.js
  const cartWithLatestPrices = cart.map(item => {
    const prod = products.find(p => p.id === item.id);
    return prod ? { ...item, price: prod.price } : item;
  });

  const cartTotal = cartWithLatestPrices.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cartWithLatestPrices.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart: cartWithLatestPrices, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartTotal,
      cartCount,
      compareList,
      toggleCompare,
      recentlyViewed,
      addToRecentlyViewed
    }}>
      {children}
    </CartContext.Provider>
  );
};
