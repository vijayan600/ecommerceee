import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('suguna_orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('suguna_orders', JSON.stringify(orders));
  }, [orders]);

  const placeOrder = (orderData) => {
    const newOrder = {
      id: 'ORD' + Date.now(),
      ...orderData,
      status: orderData.paymentMethod === 'cod' ? 'confirmed' : 'payment_pending',
      createdAt: new Date().toISOString(),
    };

    // If UPI payment with transaction ID, mark as confirmed
    if (orderData.paymentMethod === 'online' && orderData.transactionId) {
      newOrder.status = 'payment_verifying';
    }

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getOrdersByStatus = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  return (
    <OrderContext.Provider value={{ orders, placeOrder, updateOrderStatus, getOrdersByStatus }}>
      {children}
    </OrderContext.Provider>
  );
};
