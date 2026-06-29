import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { LogOut, Package, Truck, CreditCard, ShoppingBag, User } from 'lucide-react';
import './OwnerDashboard.module.css';

const OwnerDashboard = () => {
  const { isOwnerLoggedIn, ownerLogout } = useAuth();
  const navigate = useNavigate();
  const { orders, updateOrderStatus, getOrdersByStatus } = useOrders();

  const [filter, setFilter] = useState('all');
  const [displayOrders, setDisplayOrders] = useState([]);

  useEffect(() => {
    if (!isOwnerLoggedIn) {
      navigate('/owner-login');
    }
  }, [isOwnerLoggedIn, navigate]);

  useEffect(() => {
    setDisplayOrders(getOrdersByStatus(filter));
  }, [orders, filter, getOrdersByStatus]);

  const stats = {
    total: orders.length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    pending: orders.filter(o => o.status === 'payment_pending').length,
    cod: orders.filter(o => o.paymentMethod === 'cod').length,
  };

  const handleLogout = () => {
    ownerLogout();
    navigate('/owner-login');
  };

  const handleChangeStatus = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const renderOrderItem = (item, index) => (
    <div className="orderItem" key={index}>
      <span className="itemName">{item.name}</span>
      <span className="itemQty">Qty: {item.quantity}</span>
      <span className="itemPrice">₹{item.price * item.quantity}</span>
    </div>
  );

  return (
    <section className="dashboardPage">
      <header className="header">
        <h1>
          <ShoppingBag size={24} /> Owner Dashboard
        </h1>
        <button className="logoutBtn" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      {/* Stats Cards */}
      <div className="stats">
        <div className="statCard">
          <div className="statIcon total"><Package size={28} /></div>
          <div className="statInfo"><h3>Total Orders</h3><p>{stats.total}</p></div>
        </div>
        <div className="statCard">
          <div className="statIcon confirmed"><Truck size={28} /></div>
          <div className="statInfo"><h3>Confirmed</h3><p>{stats.confirmed}</p></div>
        </div>
        <div className="statCard">
          <div className="statIcon pending"><CreditCard size={28} /></div>
          <div className="statInfo"><h3>Pending Payment</h3><p>{stats.pending}</p></div>
        </div>
        <div className="statCard">
          <div className="statIcon cod"><ShoppingBag size={28} /></div>
          <div className="statInfo"><h3>COD Orders</h3><p>{stats.cod}</p></div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filterTabs">
        {['all', 'confirmed', 'payment_pending', 'cod'].map(tab => (
          <button
            key={tab}
            className={`filterTab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab.replace('_', ' ').toUpperCase()}
            <span className="filterCount">{getOrdersByStatus(tab).length}</span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {displayOrders.length === 0 ? (
        <div className="emptyState">
          <Package size={48} />
          <h3>No orders to display</h3>
          <p>Try changing the filter or wait for new orders.</p>
        </div>
      ) : (
        <div className="ordersList">
          {displayOrders.map(order => (
            <div className="orderCard" key={order.id}>
              <div className="orderHeader">
                <span className="orderId">{order.id}</span>
                <span className="orderDate">{new Date(order.createdAt).toLocaleString()}</span>
                <span className={`statusBadge ${order.status}`}>{order.status.replace('_', ' ')}</span>
              </div>
              <div className="orderBody">
                {/* Customer Details */}
                <div className="section">
                  <h4><User size={16} /> Customer</h4>
                  <div className="detailRow"><span className="label">Name</span><span className="value">{order.customerName || 'N/A'}</span></div>
                  <div className="detailRow"><span className="label">Phone</span><span className="value">{order.phone || 'N/A'}</span></div>
                  <div className="detailRow">
                    <span className="label">Address</span>
                    <span className="value">
                      {order.address ? `${order.address.doorNo || ''}, ${order.address.street || ''}, ${order.address.area || ''}, ${order.address.city || ''} - ${order.address.pincode || ''}` : 'N/A'}
                    </span>
                  </div>
                </div>
                {/* Order Items */}
                <div className="section">
                  <h4><Package size={16} /> Items</h4>
                  <div className="itemsList">
                    {order.items?.map((item, index) => renderOrderItem(item, index))}
                  </div>
                </div>
                {/* Payment & Delivery */}
                <div className="section">
                  <h4><CreditCard size={16} /> Payment</h4>
                  <div className="detailRow">
                    <span className="label">Method</span>
                    <span className={`value paymentTag ${order.paymentMethod}`}>{order.paymentMethod?.toUpperCase()}</span>
                  </div>
                  {order.transactionId && (
                    <div className="detailRow">
                      <span className="label">TXN ID</span>
                      <span className="value txnId" style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{order.transactionId}</span>
                    </div>
                  )}
                </div>
                <div className="section">
                  <h4><Truck size={16} /> Delivery</h4>
                  <div className="detailRow">
                    <span className="label">Type</span>
                    <span className="value deliveryTag">{order.deliveryType?.toUpperCase() || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="orderFooter">
                <span className="totalAmount"><span>Total:</span> ₹{order.totalAmount}</span>
                <div className="actionBtns">
                  {order.status === 'payment_pending' && (
                    <button className="actionBtn confirmBtn" onClick={() => handleChangeStatus(order.id, 'confirmed')}>
                      Confirm
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button className="actionBtn deliverBtn" onClick={() => handleChangeStatus(order.id, 'delivered')}>
                      Mark Delivered
                    </button>
                  )}
                  <button className="actionBtn cancelBtn" onClick={() => handleChangeStatus(order.id, 'cancelled')}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default OwnerDashboard;
