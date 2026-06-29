import React, { createContext, useContext, useState, useEffect } from 'react';
import { products } from '../data/products';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('suguna_cart');
      if (!savedCart) return [];
      const parsed = JSON.parse(savedCart);
      // Rehydrate with latest price + emi from products.js so stale localStorage data is fixed
      return parsed.map(item => {
        const latest = products.find(p => p.id === item.id);
        return latest
          ? { ...item, price: latest.price, emi: latest.emi }
          : item;
      });
    } catch {
      return [];
    }
  });

  const [compareList, setCompareList] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    localStorage.setItem('suguna_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    // Always pull the freshest data from products.js when adding
    const latest = products.find(p => p.id === product.id) || product;
    setCart(prev => {
      const existing = prev.find(item => item.id === latest.id);
      if (existing) {
        return prev.map(item =>
          item.id === latest.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...latest, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const toggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 3) {
        alert('You can compare up to 3 products only.');
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

  // Always reflect latest prices + emi from products.js (guards against any stale state)
  const cartWithLatestData = cart.map(item => {
    const latest = products.find(p => p.id === item.id);
    return latest
      ? { ...item, price: latest.price, emi: latest.emi }
      : item;
  });

  const cartTotal = cartWithLatestData.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const cartCount = cartWithLatestData.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  // Cart-level EMI: total cart value spread over 12 months at 14% p.a.
  const cartEmi = (() => {
    if (cartTotal <= 0) return null;
    const r = 14 / 12 / 100;
    const n = 12;
    return Math.round((cartTotal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  })();

  return (
    <CartContext.Provider
      value={{
        cart: cartWithLatestData,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        cartEmi,
        compareList,
        toggleCompare,
        recentlyViewed,
        addToRecentlyViewed,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};