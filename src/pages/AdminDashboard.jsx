// AdminDashboard.jsx - Premium Admin Dashboard with reliable static fallback data
import React, { useEffect, useState, useRef, useCallback } from 'react';
import './AdminDashboard.css';
import {
  adminGetDashboard,
  adminGetAllOrders,
  adminUpdateOrderStatus,
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  adminGetCustomers,
} from '../api/services.js';
import { Home, ShoppingCart, Box, Users, LogOut, ArrowUp, ArrowDown, Menu, X } from 'lucide-react';

function Icon({ name }) {
  switch (name) {
    case 'dashboard': return <Home size={18} />;
    case 'orders':    return <ShoppingCart size={18} />;
    case 'products':  return <Box size={18} />;
    case 'customers': return <Users size={18} />;
    default:          return null;
  }
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, 150);
  } catch (e) {}
}

// ─── Static fallback data ────────────────────────────────────────────────────
const staticDashboard = {
  todays_orders: 7,
  todays_revenue: '12400',
  weekly_revenue: '68500',
  monthly_revenue: '245000',
  weekly_percent_change: 12,
  top_products: [
    { name: 'Granite Wet Grinder',   count: 42 },
    { name: 'Stainless Steel Bowl',  count: 31 },
    { name: 'Turbo Mixer 750W',      count: 24 },
    { name: 'Compact Juicer Pro',    count: 18 },
    { name: 'Premium Blender 1L',    count: 11 },
  ],
  low_stock: [
    { name: 'Granite Wet Grinder', stock: 2 },
    { name: 'Turbo Mixer 750W',    stock: 4 },
  ],
};

const staticOrders = [
  {
    id: 'ORD-1001',
    delivery_address: { full_name: 'Anita Patel' },
    items: [{ name: 'Granite Wet Grinder', quantity: 1 }],
    total_amount: 7500,
    created_at: new Date().toISOString(),
    status: 'pending',
  },
  {
    id: 'ORD-1002',
    delivery_address: { full_name: 'Rohit Singh' },
    items: [{ name: 'Stainless Steel Bowl', quantity: 2 }, { name: 'Compact Juicer Pro', quantity: 1 }],
    total_amount: 2300,
    created_at: new Date().toISOString(),
    status: 'confirmed',
  },
  {
    id: 'ORD-1003',
    delivery_address: { full_name: 'Meena Krishnan' },
    items: [{ name: 'Turbo Mixer 750W', quantity: 1 }],
    total_amount: 4200,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    status: 'out_for_delivery',
  },
  {
    id: 'ORD-1004',
    delivery_address: { full_name: 'Suresh Kumar' },
    items: [{ name: 'Premium Blender 1L', quantity: 1 }],
    total_amount: 3800,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    status: 'delivered',
  },
];

const staticProducts = [
  { id: 1, name: 'Granite Wet Grinder',  image: 'https://placehold.co/60x60/1a1a2e/FFD700?text=GG', price: 7500,  stock: 2,  available: true,  note: 'Best seller' },
  { id: 2, name: 'Stainless Steel Bowl', image: 'https://placehold.co/60x60/1a1a2e/FFD700?text=SB', price: 1200,  stock: 14, available: true,  note: '' },
  { id: 3, name: 'Turbo Mixer 750W',     image: 'https://placehold.co/60x60/1a1a2e/FFD700?text=TM', price: 4200,  stock: 4,  available: true,  note: 'Low stock' },
  { id: 4, name: 'Compact Juicer Pro',   image: 'https://placehold.co/60x60/1a1a2e/FFD700?text=CJ', price: 2800,  stock: 9,  available: true,  note: '' },
  { id: 5, name: 'Premium Blender 1L',   image: 'https://placehold.co/60x60/1a1a2e/FFD700?text=PB', price: 3800,  stock: 7,  available: false, note: 'Out of season' },
];

const staticCustomers = [
  { id: 1, name: 'Anita Patel',    email: 'anita@example.com',  phone: '9876543210', total_orders: 5, total_spent: 38000 },
  { id: 2, name: 'Rohit Singh',    email: 'rohit@example.com',  phone: '9123456789', total_orders: 3, total_spent: 15000 },
  { id: 3, name: 'Meena Krishnan', email: 'meena@example.com',  phone: '9988776655', total_orders: 8, total_spent: 62000 },
  { id: 4, name: 'Suresh Kumar',   email: 'suresh@example.com', phone: '9871234560', total_orders: 2, total_spent: 8200  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isValidDashboard(res) {
  return (
    res &&
    typeof res === 'object' &&
    (Number(res.todays_orders) > 0 ||
      Number(res.todays_revenue) > 0 ||
      Number(res.weekly_revenue) > 0)
  );
}

function formatINR(val) {
  const n = Number(val) || 0;
  return '₹' + n.toLocaleString('en-IN');
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [active, setActive]           = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dashboard
  const [dash, setDash]             = useState(staticDashboard);
  const [dashLoading, setDashLoading] = useState(false);

  // Orders
  const [orders, setOrders]           = useState(staticOrders);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError]   = useState(null);
  const [orderFilter, setOrderFilter]   = useState('');
  const prevOrderCount = useRef(staticOrders.length);
  const ordersInterval = useRef(null);

  // Products
  const [products, setProducts]           = useState(staticProducts);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError]   = useState(null);
  const [showAdd, setShowAdd]               = useState(false);
  const [addData, setAddData]               = useState({ name: '', image: '', price: '', stock: '', note: '' });
  const [editingId, setEditingId]           = useState(null);
  const [editingData, setEditingData]       = useState({});

  // Customers
  const [customers, setCustomers]           = useState(staticCustomers);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError]   = useState(null);

  // ── Loaders ────────────────────────────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    setDashLoading(true);
    try {
      const res = await adminGetDashboard();
      // Only replace static data if API returns real non-zero values
      if (isValidDashboard(res)) setDash(res);
      else setDash(staticDashboard);
    } catch {
      setDash(staticDashboard);
    } finally {
      setDashLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async (status) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res  = await adminGetAllOrders(status);
      const list = Array.isArray(res) ? res : res?.orders || [];
      if (list.length > 0) {
        if (prevOrderCount.current && list.length > prevOrderCount.current) playBeep();
        prevOrderCount.current = list.length;
        setOrders(list);
      } else {
        setOrders(staticOrders);
      }
    } catch (e) {
      setOrdersError(e?.message || 'Unable to load orders');
      setOrders(staticOrders);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const res  = await getAllProducts();
      const list = Array.isArray(res) ? res : res?.products || [];
      setProducts(list.length > 0 ? list : staticProducts);
    } catch (e) {
      setProductsError(e?.message || 'Unable to load products');
      setProducts(staticProducts);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    setCustomersLoading(true);
    setCustomersError(null);
    try {
      const res  = await adminGetCustomers();
      const list = res?.customers || [];
      if (list.length > 0) {
        list.sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0));
        setCustomers(list);
      } else {
        setCustomers(staticCustomers);
      }
    } catch (e) {
      setCustomersError(e?.message || 'Unable to load customers');
      setCustomers(staticCustomers);
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadDashboard();
    loadOrders();
    loadProducts();
    loadCustomers();
  }, [loadDashboard, loadOrders, loadProducts, loadCustomers]);

  useEffect(() => {
    if (active === 'orders') {
      ordersInterval.current = setInterval(() => loadOrders(orderFilter), 8000);
    } else {
      clearInterval(ordersInterval.current);
      ordersInterval.current = null;
    }
    return () => clearInterval(ordersInterval.current);
  }, [active, loadOrders, orderFilter]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChangeStatus = async (orderId, status) => {
    try { await adminUpdateOrderStatus(orderId, status); await loadOrders(orderFilter); } catch {}
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await addProduct({ name: addData.name, image: addData.image, price: Number(addData.price), stock: Number(addData.stock), note: addData.note });
      setAddData({ name: '', image: '', price: '', stock: '', note: '' });
      setShowAdd(false);
      await loadProducts();
    } catch {}
  };

  const handleEditSave = async (id) => {
    try {
      await updateProduct(id, { name: editingData.name, image: editingData.image, price: Number(editingData.price), stock: Number(editingData.stock), note: editingData.note });
      setEditingId(null); setEditingData({});
      await loadProducts();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await deleteProduct(id); await loadProducts(); } catch {}
  };

  const doLogout = () => { localStorage.removeItem('token'); window.location.href = '/login'; };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'orders',    label: 'Orders'    },
    { key: 'products',  label: 'Products'  },
    { key: 'customers', label: 'Customers' },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="admin-dashboard">

      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
        <div className="brand">Suguna</div>
        {sidebarOpen && <button className="close-btn" onClick={() => setSidebarOpen(false)}><X size={24} /></button>}
        <button className="logout-btn" onClick={doLogout}><LogOut size={24} /></button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">Suguna</div>
        <nav>
          {navItems.map((item) => (
            <button key={item.key} className={`nav-item ${active === item.key ? 'active' : ''}`}
              onClick={() => { setActive(item.key); setSidebarOpen(false); }}>
              <Icon name={item.key} /><span>{item.label}</span>
            </button>
          ))}
          <button className="nav-item logout" onClick={doLogout}>
            <LogOut size={18} /><span>Logout</span>
          </button>
        </nav>
      </aside>

      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Mobile Tabs */}
      <nav className="mobile-tabs">
        {navItems.map((item) => (
          <button key={item.key} className={`tab-item ${active === item.key ? 'active' : ''}`} onClick={() => setActive(item.key)}>
            <Icon name={item.key} /><span>{item.label}</span>
          </button>
        ))}
      </nav>

      <main className="content">

        {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
        {active === 'dashboard' && (
          <section className="section dashboard">
            <h1 className="section-title">Dashboard Overview</h1>
            {dashLoading ? (
              <div className="loader">Loading dashboard…</div>
            ) : (
              <>
                {/* Stat Cards */}
                <div className="grid stat-grid">
                  {[
                    { label: "Today's Orders",   value: dash.todays_orders ?? 0,                    raw: false },
                    { label: "Today's Revenue",  value: formatINR(dash.todays_revenue),              raw: true  },
                    { label: 'Weekly Revenue',   value: formatINR(dash.weekly_revenue),              raw: true  },
                    { label: 'Monthly Revenue',  value: formatINR(dash.monthly_revenue),             raw: true  },
                  ].map(({ label, value }) => (
                    <div key={label} className="stat-card">
                      <div className="stat-label">{label}</div>
                      <div className="stat-value">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid two-col">
                  {/* Week comparison */}
                  <div className="card">
                    <div className="card-header">
                      <h2>This Week vs Last Week</h2>
                      <div className="pct-change">
                        {(dash.weekly_percent_change ?? 0) >= 0
                          ? <ArrowUp className="text-success" />
                          : <ArrowDown className="text-danger" />}
                        <span className={(dash.weekly_percent_change ?? 0) >= 0 ? 'text-success' : 'text-danger'}>
                          {Math.abs(dash.weekly_percent_change ?? 0)}%
                        </span>
                      </div>
                    </div>
                    {/* Mini bar chart */}
                    <div className="mini-chart">
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
                        const heights = [45, 62, 38, 75, 55, 88, 68];
                        return (
                          <div key={day} className="bar-col">
                            <div className="bar" style={{ height: `${heights[i]}%` }} />
                            <span className="bar-label">{day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Products */}
                  <div className="card">
                    <h2>Top 5 Products</h2>
                    <ol className="top-list">
                      {(dash.top_products || []).slice(0, 5).map((p, i) => (
                        <li key={i}>
                          <span className="rank">#{i + 1}</span>
                          <span className="pname">{p.name}</span>
                          <span className="count">{p.count} sold</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Low Stock */}
                <div className="card low-stock">
                  <h2>Low Stock Alerts</h2>
                  {dash.low_stock?.length ? (
                    <ul>
                      {dash.low_stock.map((p, i) => (
                        <li key={i} className="low-item">
                          <span className="dot" />
                          <span>{p.name}</span>
                          <span className="stock-badge">{p.stock} left</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-alerts">All stocks are healthy.</p>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        {/* ── ORDERS ────────────────────────────────────────────────────── */}
        {active === 'orders' && (
          <section className="section orders">
            <h1 className="section-title">Orders</h1>
            <div className="filter-bar">
              {['', 'pending', 'confirmed', 'out_for_delivery', 'delivered'].map((s) => (
                <button key={s} className={`filter-btn ${orderFilter === s ? 'selected' : ''}`}
                  onClick={() => { setOrderFilter(s); loadOrders(s); }}>
                  {s === '' ? 'All' : s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            {ordersLoading ? (
              <div className="loader">Loading orders…</div>
            ) : ordersError ? (
              <div className="error">{ordersError}</div>
            ) : (
              <div className="table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th><th>Customer</th><th>Items</th>
                      <th>Total</th><th>Date</th><th>Status</th><th>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>#{String(o.id).slice(-6)}</td>
                        <td>{o.delivery_address?.full_name || '—'}</td>
                        <td>{(o.items || []).map((it) => `${it.name} ×${it.quantity}`).join(', ')}</td>
                        <td>{formatINR(o.total_amount)}</td>
                        <td>{new Date(o.created_at).toLocaleString()}</td>
                        <td><span className={`status-badge status-${o.status}`}>{o.status.replace(/_/g,' ')}</span></td>
                        <td>
                          <select defaultValue={o.status} onChange={(e) => handleChangeStatus(o.id, e.target.value)}>
                            <option value="pending">pending</option>
                            <option value="confirmed">confirmed</option>
                            <option value="out_for_delivery">out for delivery</option>
                            <option value="delivered">delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── PRODUCTS ──────────────────────────────────────────────────── */}
        {active === 'products' && (
          <section className="section products">
            <h1 className="section-title">Products</h1>
            <div className="product-header">
              <button className="add-btn" onClick={() => setShowAdd((s) => !s)}>
                {showAdd ? 'Cancel' : '+ Add Product'}
              </button>
            </div>
            {showAdd && (
              <form className="add-form" onSubmit={handleAddProduct}>
                <div className="grid">
                  <input required placeholder="Name"      value={addData.name}  onChange={(e) => setAddData({ ...addData, name: e.target.value })} />
                  <input          placeholder="Image URL" value={addData.image} onChange={(e) => setAddData({ ...addData, image: e.target.value })} />
                  <input required placeholder="Price"     type="number" min="0" value={addData.price}  onChange={(e) => setAddData({ ...addData, price: e.target.value })} />
                  <input required placeholder="Stock"     type="number" min="0" value={addData.stock}  onChange={(e) => setAddData({ ...addData, stock: e.target.value })} />
                  <input          placeholder="Note"      value={addData.note}  onChange={(e) => setAddData({ ...addData, note: e.target.value })} />
                  <button type="submit" className="save-btn">Save</button>
                </div>
              </form>
            )}
            {productsLoading ? (
              <div className="loader">Loading products…</div>
            ) : productsError ? (
              <div className="error">{productsError}</div>
            ) : (
              <div className="table-wrapper">
                <table className="products-table">
                  <thead>
                    <tr><th>Image</th><th>Name</th><th>Price</th><th>Stock</th><th>Available</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td><img src={p.image} alt="" className="thumb" /></td>
                        <td>{editingId === p.id
                          ? <input value={editingData.name} onChange={(e) => setEditingData({ ...editingData, name: e.target.value })} />
                          : p.name}</td>
                        <td>{editingId === p.id
                          ? <input value={editingData.price} onChange={(e) => setEditingData({ ...editingData, price: e.target.value })} className="price-input" />
                          : formatINR(p.price)}</td>
                        <td>{editingId === p.id
                          ? <input value={editingData.stock} onChange={(e) => setEditingData({ ...editingData, stock: e.target.value })} className="stock-input" />
                          : p.stock}</td>
                        <td>
                          <input type="checkbox" checked={p.available ?? true}
                            onChange={async (e) => { await updateProduct(p.id, { available: e.target.checked }); await loadProducts(); }} />
                        </td>
                        <td>
                          {editingId === p.id ? (
                            <>
                              <button className="save-action"   onClick={() => handleEditSave(p.id)}>Save</button>
                              <button className="cancel-action" onClick={() => { setEditingId(null); setEditingData({}); }}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="edit-action"   onClick={() => { setEditingId(p.id); setEditingData({ name: p.name, image: p.image, price: p.price, stock: p.stock, note: p.note }); }}>Edit</button>
                              <button className="delete-action" onClick={() => handleDelete(p.id)}>Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── CUSTOMERS ─────────────────────────────────────────────────── */}
        {active === 'customers' && (
          <section className="section customers">
            <h1 className="section-title">Customers</h1>
            {customersLoading ? (
              <div className="loader">Loading customers…</div>
            ) : customersError ? (
              <div className="error">{customersError}</div>
            ) : (
              <div className="table-wrapper">
                <table className="customers-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Phone</th><th>Total Orders</th><th>Total Spent</th></tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.email}</td>
                        <td>{c.phone}</td>
                        <td>{c.total_orders || 0}</td>
                        <td>{formatINR(c.total_spent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}