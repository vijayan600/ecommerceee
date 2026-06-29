import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import styles from './CartDrawer.module.css';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            <ShoppingBag size={20} />
            <h3>Your Cart</h3>
            <span className={styles.count}>{cart.length} items</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X /></button>
        </div>

        <div className={styles.items}>
          {cart.length === 0 ? (
            <div className={styles.empty}>
              <p>Your cart is empty</p>
              <button className={styles.shopBtn} onClick={() => { navigate('/products'); onClose(); }}>Shop Now</button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={styles.item}>
                <img src={item.image} alt={item.name} />
                <div className={styles.itemInfo}>
                  <h4>{item.name}</h4>
                  <p className={styles.price}>₹{item.price.toLocaleString('en-IN')}</p>
                  <div className={styles.controls}>
                    <div className={styles.qty}>
                      <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                    </div>
                    <button className={styles.remove} onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <p className={styles.taxInfo}>Taxes and shipping calculated at checkout</p>
            <button 
              className={styles.checkoutBtn}
              onClick={() => { navigate('/checkout'); onClose(); }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
