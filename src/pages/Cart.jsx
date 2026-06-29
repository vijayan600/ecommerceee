import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import styles from './Cart.module.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className={`container ${styles.empty}`}>
        <ShoppingBag size={80} color="var(--border-color)" />
        <h2>Your shopping cart is empty</h2>
        <p>Browse our products and find something you love!</p>
        <button className={styles.shopBtn} onClick={() => navigate('/products')}>Go to Shop</button>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <ArrowLeft size={20} />
          <span>Continue Shopping</span>
        </button>
        <h1>Shopping Cart ({cart.length} items)</h1>
      </div>

      <div className={styles.layout}>
        <div className={styles.items}>
          {cart.map(item => (
            <div key={item.id} className={styles.itemCard}>
              <img src={item.image} alt={item.name} onClick={() => navigate(`/product/${item.id}`)} />
              <div className={styles.itemInfo}>
                <h3 onClick={() => navigate(`/product/${item.id}`)}>{item.name}</h3>
                <p className={styles.brand}>Brand: {item.brand}</p>
                <div className={styles.priceRow}>
                  <span className={styles.price}>₹{item.price.toLocaleString('en-IN')}</span>
                  <span className={styles.originalPrice}>₹{item.originalPrice.toLocaleString('en-IN')}</span>
                  <span className={styles.discount}>{item.discount}% Off</span>
                </div>
              </div>
              <div className={styles.controls}>
                <div className={styles.qty}>
                  <button onClick={() => updateQuantity(item.id, -1)}><Minus size={16} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}><Plus size={16} /></button>
                </div>
                <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className={styles.summary}>
          <div className={styles.summaryCard}>
            <h3>Order Summary</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping (Erode Area)</span>
              <span className={styles.free}>FREE</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <button className={styles.checkoutBtn} onClick={() => navigate('/checkout')}>
              PROCEED TO CHECKOUT
            </button>
            <div className={styles.trustRow}>
              <span>✓ Safe & Secure Payments</span>
              <span>✓ 100% Authentic Products</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
