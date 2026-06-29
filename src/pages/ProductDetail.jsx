import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, Zap, Shield, MapPin, RefreshCw, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard/ProductCard';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToRecentlyViewed, recentlyViewed, clearCart } = useCart();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const found = products.find(p => p.id === parseInt(id));
    if (found) {
      setProduct(found);
      setMainImage(found.image);
      addToRecentlyViewed(found);
      window.scrollTo(0, 0);
    }
  }, [id]);

  if (!product) return <div className="container">Loading...</div>;

  const handleBuyNow = () => {
    clearCart();
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.productMain}>
        <div className={styles.gallery}>
          <div className={styles.mainImgWrapper}>
            <img src={mainImage} alt={product.name} className={styles.mainImage} />
          </div>
          <div className={styles.thumbnails}>
            {[product.image, product.image, product.image, product.image].map((img, i) => (
              <div 
                key={i} 
                className={`${styles.thumb} ${mainImage === img ? styles.activeThumb : ''}`}
                onMouseEnter={() => setMainImage(img)}
              >
                <img src={img} alt={`${product.name} ${i}`} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.breadcrumb}>
            <span>Home</span> <ChevronRight size={14} />
            <span>{product.category}</span> <ChevronRight size={14} />
            <span className={styles.activePath}>{product.brand}</span>
          </div>

          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.brand}>Brand: {product.brand}</p>
          
          <div className={styles.ratingRow}>
            <div className={styles.ratingBadge}>
              {product.rating} <Star size={14} fill="white" color="white" />
            </div>
            <span className={styles.reviews}>{product.reviews.toLocaleString()} Ratings & Reviews</span>
            <span className={styles.assured}>Assured Delivery</span>
          </div>

          <div className={styles.priceSection}>
            <div className={styles.mainPriceRow}>
              <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
              <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
              <span className={styles.discount}>{product.discount}% off</span>
            </div>
            {product.price > 5000 && (
              <p className={styles.emi}>EMI from ₹999/month. <button>View Plans</button></p>
            )}
          </div>

          <div className={styles.deliveryBadge}>
            <MapPin size={18} />
            <span>Available for delivery in Erode & surrounding areas</span>
          </div>

          <div className={styles.actions}>
            <button className={styles.cartBtn} onClick={() => addToCart(product)}>
              <ShoppingCart size={20} />
              ADD TO CART
            </button>
            <button className={styles.buyBtn} onClick={handleBuyNow}>
              <Zap size={20} />
              BUY NOW
            </button>
          </div>

          <div className={styles.offers}>
            <h4>Available offers</h4>
            <ul>
              <li><Zap size={16} color="#388e3c" /> Bank Offer: 10% off on SBI Credit Cards</li>
              <li><Zap size={16} color="#388e3c" /> Partner Offer: Get ₹500 voucher on orders above ₹5000</li>
            </ul>
          </div>

          <div className={styles.specs}>
            <h3>Specifications</h3>
            <table>
              <tbody>
                {Object.entries(product.specs).map(([key, value]) => (
                  <tr key={key}>
                    <td className={styles.specLabel}>{key}</td>
                    <td className={styles.specValue}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {recentlyViewed.length > 1 && (
        <section className={styles.recentlyViewed}>
          <h3>Recently Viewed</h3>
          <div className={styles.rvGrid}>
            {recentlyViewed.filter(p => p.id !== product.id).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
