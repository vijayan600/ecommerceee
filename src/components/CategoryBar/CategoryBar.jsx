import React from 'react';
import { 
  WashingMachine, 
  Flame, 
  Wind, 
  Tv, 
  CookingPot, 
  Zap 
} from 'lucide-react';
import styles from './CategoryBar.module.css';

const categories = [
  { name: 'Wet Grinder', icon: <WashingMachine size={24} /> },
  { name: 'Gas Stove', icon: <Flame size={24} /> },
  { name: 'Fan', icon: <Wind size={24} /> },
  { name: 'TV', icon: <Tv size={24} /> },
  { name: 'Kitchen', icon: <CookingPot size={24} /> },
  { name: 'Small Appliances', icon: <Zap size={24} /> }
];

const CategoryBar = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className={styles.wrapper}>
      <div className={`container ${styles.container}`}>
        <div className={styles.scrollArea}>
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`${styles.chip} ${activeCategory === cat.name ? styles.active : ''}`}
              onClick={() => onCategoryChange(cat.name)}
            >
              <span className={styles.icon}>{cat.icon}</span>
              <span className={styles.name}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
