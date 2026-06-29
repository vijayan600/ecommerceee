import React, { useState } from 'react';
import HeroCarousel from '../components/HeroCarousel/HeroCarousel';
import CategoryBar from '../components/CategoryBar/CategoryBar';
import ProductCard from '../components/ProductCard/ProductCard';
import { products } from '../data/products';
import { ArrowRight, ShieldCheck, Truck, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('Wet Grinder');

  const filteredProducts = products
    .filter(p => p.category === activeCategory)
    .slice(0, 4);

  return (
    <div className={styles.home}>
      <HeroCarousel />
      <CategoryBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2>Popular in {activeCategory}</h2>
          <Link to="/products" className={styles.viewAll}>
            View All <ArrowRight size={18} />
          </Link>
        </div>
        <div className={styles.grid}>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className={styles.banner}>
        <div className="container">
          <div className={styles.bannerContent}>
            <div className={styles.bannerText}>
              <span className={styles.label}>FESTIVAL SALE</span>
              <h2>விழாகால சலுகை — 10% முதல் 50% வரை தள்ளுபடி!</h2>
              <p>Special discounts on all premium brands. Offer valid for a limited time.</p>
              <Link to="/products" className={styles.bannerBtn}>Explore Deals</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`container ${styles.features}`}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}><Truck size={32} /></div>
          <div className={styles.featureText}>
            <h4>Fast Delivery</h4>
            <p>Free delivery across all areas in Erode district.</p>
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}><ShieldCheck size={32} /></div>
          <div className={styles.featureText}>
            <h4>Authorized Dealer</h4>
            <p>100% Genuine products from top Indian brands.</p>
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}><Headphones size={32} /></div>
          <div className={styles.featureText}>
            <h4>Expert Support</h4>
            <p>Friendly service and maintenance for all appliances.</p>
          </div>
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2>New Arrivals</h2>
          <Link to="/products" className={styles.viewAll}>
            View All <ArrowRight size={18} />
          </Link>
        </div>
        <div className={styles.grid}>
          {products.filter(p => p.badge === 'New').slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
