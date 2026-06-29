import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OwnerLogin from './pages/OwnerLogin';
import OwnerDashboard from './pages/OwnerDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import { UserRoute, AdminRoute } from './components/ProtectedRoute';
import ComparePanel from './components/ComparePanel/ComparePanel';
import CartDrawer from './components/CartDrawer/CartDrawer';
import { Chatbot } from './components/AIAdvisor/AIAdvisor';

// Pages where the chatbot should NOT appear
const HIDDEN_CHATBOT_PATHS = [
  '/admin',
  '/login',
  '/register',
  '/owner-login',
  '/owner-dashboard',
];

function AppContent({ isCartOpen, setIsCartOpen }) {
  const location = useLocation();

  const showChatbot = !HIDDEN_CHATBOT_PATHS.some(path =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="app">
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/owner-login" element={<OwnerLogin />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </main>
      <ComparePanel />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {showChatbot && <Chatbot />}

      <footer style={{ backgroundColor: '#0A1628', color: 'white', padding: '3rem 0', marginTop: '4rem' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div>
            <h3 style={{ color: '#FFB800', marginBottom: '1rem' }}>Suguna Wet Grinder (சுகுணா)</h3>
            <p>Leading Electronics & Kitchen Appliances Shop in Erode.</p>
            <p style={{ marginTop: '1rem' }}>Cell: 98431 55508 / 98677 11233</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Our Brands</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Suguna', 'Crompton', 'Butterfly', 'Prestige', 'Vidiem', 'Surya', 'Samsung'].map(brand => (
                <span key={brand} style={{ background: '#1e293b', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem' }}>{brand}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Location</h4>
            <p>Erode, Tamil Nadu, India</p>
            <a href="https://maps.google.com" style={{ color: '#00B4D8', display: 'block', marginTop: '0.5rem' }}>View on Google Maps</a>
          </div>
        </div>
        <div className="container" style={{ borderTop: '1px solid #1e293b', marginTop: '2rem', paddingTop: '2rem', textAlign: 'center', opacity: 0.7 }}>
          <p>&copy; 2026 Suguna Wet Grinder. All rights reserved.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>விழாகால சலுகை — 10% முதல் 50% வரை தள்ளுபடி!</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <AuthProvider>
      <OrderProvider>
        <CartProvider>
          <Router>
            <AppContent isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
          </Router>
        </CartProvider>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;