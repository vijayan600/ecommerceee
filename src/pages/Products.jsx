import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard/ProductCard';
import { products } from '../data/products';
import { Filter, ChevronDown, Star } from 'lucide-react';
import styles from './Products.module.css';

const Products = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchBarQuery = searchParams.get('search') || '';

  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState([]);
  const [priceRange, setPriceRange] = useState(50000);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortOrder, setSortOrder] = useState('popularity');

  useEffect(() => {
    // If search query changes, maybe reset other filters? 
    // Or just let it filter on top of search.
  }, [searchBarQuery]);

  const brands = useMemo(() => [...new Set(products.map(p => p.brand))], []);
  const categories = useMemo(() => [...new Set(products.map(p => p.category))], []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchBarQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchBarQuery.toLowerCase());
      const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
      const matchesBrand = brandFilter.length > 0 ? brandFilter.includes(p.brand) : true;
      const matchesPrice = p.price <= priceRange;
      const matchesRating = p.rating >= ratingFilter;
      
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesRating;
    }).sort((a, b) => {
      if (sortOrder === 'price-low') return a.price - b.price;
      if (sortOrder === 'price-high') return b.price - a.price;
      if (sortOrder === 'rating') return b.rating - a.rating;
      return 0; // Popularity (default order in array)
    });
  }, [categoryFilter, brandFilter, priceRange, ratingFilter, sortOrder, searchBarQuery]);

  const handleBrandToggle = (brand) => {
    setBrandFilter(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  return (
    <div className={`container ${styles.page}`}>
      <aside className={styles.sidebar}>
        <div className={styles.filterHeader}>
          <h3>Filters</h3>
          <button onClick={() => {
            setCategoryFilter('');
            setBrandFilter([]);
            setPriceRange(50000);
            setRatingFilter(0);
          }}>Clear All</button>
        </div>

        <div className={styles.filterSection}>
          <h4>Categories</h4>
          {categories.map(cat => (
            <label key={cat} className={styles.checkboxLabel}>
              <input 
                type="radio" 
                name="category" 
                checked={categoryFilter === cat} 
                onChange={() => setCategoryFilter(cat)} 
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>

        <div className={styles.filterSection}>
          <h4>Brands</h4>
          {brands.map(brand => (
            <label key={brand} className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={brandFilter.includes(brand)} 
                onChange={() => handleBrandToggle(brand)} 
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>

        <div className={styles.filterSection}>
          <h4>Price Range (Up to ₹{priceRange.toLocaleString()})</h4>
          <input 
            type="range" 
            min="500" 
            max="50000" 
            step="500" 
            value={priceRange} 
            onChange={(e) => setPriceRange(parseInt(e.target.value))}
            className={styles.range}
          />
        </div>

        <div className={styles.filterSection}>
          <h4>Customer Rating</h4>
          {[4, 3, 2, 1].map(num => (
            <label key={num} className={styles.checkboxLabel}>
              <input 
                type="radio" 
                name="rating" 
                checked={ratingFilter === num} 
                onChange={() => setRatingFilter(num)} 
              />
              <span className={styles.ratingRow}>
                {num} <Star size={14} fill="var(--gold)" color="var(--gold)" /> & above
              </span>
            </label>
          ))}
        </div>
      </aside>

      <main className={styles.content}>
        <div className={styles.resultsHeader}>
          <p>Showing <strong>{filteredProducts.length}</strong> products {searchBarQuery && `for "${searchBarQuery}"`}</p>
          <div className={styles.sort}>
            <span>Sort by:</span>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="popularity">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className={styles.noResults}>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;
