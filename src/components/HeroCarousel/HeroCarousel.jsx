import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Tag, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './HeroCarousel.module.css';

// Real products with Bakrid discount slide data
import sugunawetgriender from '../../assets/sugunawetgriender.webp';
import butterflywetgriender from '../../assets/butterflywetgriender.webp';
import samsungtv from '../../assets/samsungtv.webp';
import butterflygasstove from '../../assets/butterflygasstove.webp';
import preethi from '../../assets/Preethi Zodiac Mixer Grinder 750W.webp';
import cromptonfan from '../../assets/cromptonfan.webp';

const slides = [
  {
    id: 1,
    productId: 1,
    festiveTag: '🌙 Bakrid Special Offer',
    title: 'Suguna Wet Grinder',
    subtitle: 'Make perfect batter for Bakrid seviyan & sweets!',
    discountLabel: '25% OFF',
    price: '₹4,499',
    originalPrice: '₹5,999',
    cta: 'Shop Now',
    gradient: 'linear-gradient(135deg, #0A1628 0%, #1a3a5c 100%)',
    accentColor: '#FFB800',
    image: sugunawetgriender,
  },
  {
    id: 2,
    productId: 6,
    festiveTag: '🎉 Bakrid Dhamaka Sale',
    title: 'Butterfly 3-Burner Gas Stove',
    subtitle: 'Cook Bakrid biryani & mutton feast with ease!',
    discountLabel: '30% OFF',
    price: '₹3,499',
    originalPrice: '₹4,999',
    cta: 'Grab the Deal',
    gradient: 'linear-gradient(135deg, #1a0a28 0%, #3d1a6e 100%)',
    accentColor: '#FF6B35',
    image: butterflygasstove,
  },
  {
    id: 3,
    productId: 11,
    festiveTag: '📺 Eid Exclusive',
    title: 'Samsung 43" 4K Smart TV',
    subtitle: 'Watch Bakrid celebrations in stunning 4K clarity!',
    discountLabel: '27% OFF',
    price: '₹32,990',
    originalPrice: '₹45,000',
    cta: 'Buy Now',
    gradient: 'linear-gradient(135deg, #001a33 0%, #003366 100%)',
    accentColor: '#00B4D8',
    image: samsungtv,
  },
  {
    id: 4,
    productId: 14,
    festiveTag: '🥘 Bakrid Kitchen Sale',
    title: 'Preethi Mixer Grinder 750W',
    subtitle: 'Grind spices for Bakrid korma & haleem in seconds!',
    discountLabel: '19% OFF',
    price: '₹8,500',
    originalPrice: '₹10,500',
    cta: 'Shop Now',
    gradient: 'linear-gradient(135deg, #0d2b1a 0%, #1a5c35 100%)',
    accentColor: '#4CAF50',
    image: preethi,
  },
  {
    id: 5,
    productId: 3,
    festiveTag: '🌟 Eid Mubarak Offer',
    title: 'Butterfly Rhino Wet Grinder',
    subtitle: 'Prepare festive dosas & idlis for your family!',
    discountLabel: '20% OFF',
    price: '₹3,999',
    originalPrice: '₹4,999',
    cta: 'Shop Now',
    gradient: 'linear-gradient(135deg, #1a1000 0%, #4a2c00 100%)',
    accentColor: '#FFB800',
    image: butterflywetgriender,
  },
  {
    id: 6,
    productId: 8,
    festiveTag: '💨 Beat the Heat — Bakrid Sale',
    title: 'Crompton 48" Ceiling Fan',
    subtitle: 'Stay cool while hosting your Bakrid guests!',
    discountLabel: '24% OFF',
    price: '₹1,599',
    originalPrice: '₹2,100',
    cta: 'Order Now',
    gradient: 'linear-gradient(135deg, #001533 0%, #002966 100%)',
    accentColor: '#00B4D8',
    image: cromptonfan,
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();

  const nextSlide = useCallback(() => {
    setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);
  const prevSlide = () => setCurrent(prev => (prev === 0 ? slides.length - 1 : prev - 1));

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, [paused, nextSlide]);

  const handleShopNow = (productId) => {
    navigate(`/product/${productId}`);
  };

  const slide = slides[current];

  return (
    <section
      className={styles.hero}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background gradient transitions */}
      <div className={styles.bg} style={{ background: slide.gradient }} />

      {/* Decorative crescent moon / star shapes */}
      <div className={styles.decorCircle1} style={{ borderColor: slide.accentColor }} />
      <div className={styles.decorCircle2} style={{ borderColor: slide.accentColor }} />
      <div className={styles.decorStar} style={{ color: slide.accentColor }}>✦</div>

      <div className={`container ${styles.slideContent}`}>
        {/* TEXT SIDE */}
        <div className={styles.textContent} key={current}>
          <div className={styles.festiveTag} style={{ background: slide.accentColor }}>
            <Tag size={14} />
            {slide.festiveTag}
          </div>

          <h1 className={styles.title}>{slide.title}</h1>
          <p className={styles.subtitle}>{slide.subtitle}</p>

          <div className={styles.priceRow}>
            <span className={styles.discountBadge} style={{ background: slide.accentColor }}>
              {slide.discountLabel}
            </span>
            <span className={styles.salePrice}>{slide.price}</span>
            <span className={styles.originalPrice}>{slide.originalPrice}</span>
          </div>

          <button
            className={styles.ctaBtn}
            style={{ background: slide.accentColor }}
            onClick={() => handleShopNow(slide.productId)}
          >
            <Zap size={18} />
            {slide.cta}
          </button>
        </div>

        {/* IMAGE SIDE */}
        <div className={styles.imageContent} key={`img-${current}`}>
          <div className={styles.imageGlow} style={{ background: slide.accentColor }} />
          <img
            src={slide.image}
            alt={slide.title}
            className={styles.productImage}
            onError={e => { e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found'; }}
          />
        </div>
      </div>

      {/* Nav Buttons */}
      <button className={`${styles.navBtn} ${styles.prev}`} onClick={prevSlide}>
        <ChevronLeft size={24} />
      </button>
      <button className={`${styles.navBtn} ${styles.next}`} onClick={nextSlide}>
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className={styles.dots}>
        {slides.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i === current ? styles.active : ''}`}
            style={i === current ? { background: slide.accentColor } : {}}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className={styles.counter}>
        {current + 1} / {slides.length}
      </div>
    </section>
  );
};

export default HeroCarousel;
