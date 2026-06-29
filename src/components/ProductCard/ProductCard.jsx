import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import styles from './ProductCard.module.css';

const placeholderImg = 'https://via.placeholder.com/400?text=Image+Not+Found';

const ProductCard = ({ product }) => {
  const { addToCart, toggleCompare, compareList } = useCart();
  const navigate = useNavigate();

  const isComparing = compareList.some(p => p.id === product.id);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const handleImgError = (e) => {
    e.target.src = placeholderImg;
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.imageWrapper}>
        <img 
          src={product.image} 
          alt={product.name} 
          className={styles.image} 
          onError={handleImgError}
        />
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
        <div className={styles.compareCheck} onClick={e => e.stopPropagation()}>
          <label className={styles.checkboxContainer}>
            <input
              type="checkbox"
              checked={isComparing}
              onChange={() => toggleCompare(product)}
            />
            <span className={styles.checkmark}></span>
            <span className={styles.compareText}>+ Compare</span>
          </label>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.brandRow}>
          <span className={styles.brand}>{product.brand}</span>
          <div className={styles.rating}>
            <Star size={14} fill="var(--gold)" color="var(--gold)" />
            <span>{product.rating}</span>
            <span className={styles.reviews}>({product.reviews.toLocaleString()})</span>
          </div>
        </div>

        <h3 className={styles.name}>{product.name}</h3>

        <div className={styles.priceRow}>
          <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
          <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
          <span className={styles.discount}>{product.discount}% off</span>
        </div>

        {product.price > 5000 && (
          <p className={styles.emi}>EMI available from ₹999/month</p>
        )}

        <div className={styles.actions}>
          <button
            className={styles.cartBtn}
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
          >
            <ShoppingCart size={18} />
            <span>Add to Cart</span>
          </button>
          <button
            className={styles.buyBtn}
            onClick={handleBuyNow}
          >
            <Zap size={18} />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
