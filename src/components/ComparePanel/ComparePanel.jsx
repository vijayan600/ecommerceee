import React, { useState } from 'react';
import { X, Bot, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import styles from './ComparePanel.module.css';
import AIAdvisor from '../AIAdvisor/AIAdvisor';

const ComparePanel = () => {
  const { compareList, toggleCompare } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [showAI, setShowAI] = useState(false);

  if (compareList.length === 0) return null;

  return (
    <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
      <button className={styles.toggleBtn} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronRight /> : <ChevronLeft />}
        <span className={styles.count}>{compareList.length}</span>
        {!isOpen && <span className={styles.verticalText}>COMPARE</span>}
      </button>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3>Compare Products</h3>
          <button onClick={() => setIsOpen(false)}><X size={20} /></button>
        </div>

        <div className={styles.productList}>
          {compareList.map(product => (
            <div key={product.id} className={styles.item}>
              <img src={product.image} alt={product.name} />
              <div className={styles.itemInfo}>
                <h4>{product.name}</h4>
                <p>₹{product.price.toLocaleString('en-IN')}</p>
              </div>
              <button className={styles.removeBtn} onClick={() => toggleCompare(product)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {compareList.length >= 2 && (
          <div className={styles.actions}>
            <button className={styles.aiBtn} onClick={() => setShowAI(true)}>
              <Bot size={20} />
              <span>Ask AI Advisor</span>
            </button>
          </div>
        )}
      </div>

      {showAI && (
        <AIAdvisor 
          products={compareList} 
          onClose={() => setShowAI(false)} 
        />
      )}
    </div>
  );
};

export default ComparePanel;
