import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Truck, Package, ArrowRight } from 'lucide-react';
import styles from './OrderConfirmation.module.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || ("ORD" + Math.floor(100000 + Math.random() * 900000));
  const paymentMethod = location.state?.paymentMethod || 'cod';

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <CheckCircle size={64} className={styles.checkIcon} />
        </div>
        
        <h1>Order Placed Successfully!</h1>
        <p className={styles.orderId}>Order ID: <strong>{orderId}</strong></p>
        {paymentMethod === 'online' && (
          <p className={styles.paymentSuccessText} style={{ color: '#388e3c', fontWeight: 'bold', margin: '0.5rem 0' }}>
            ✓ Payment Verified via Razorpay UPI
          </p>
        )}
        
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <Truck size={24} />
            <div>
              <h4>Expected Delivery</h4>
              <p>1-3 Business Days</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <Package size={24} />
            <div>
              <h4>Shipment Status</h4>
              <p>Processing at Erode Warehouse</p>
            </div>
          </div>
        </div>

        <p className={styles.message}>
          A confirmation email and SMS has been sent to your registered contact. 
          Thank you for shopping with Suguna Wet Grinder!
        </p>

        <div className={styles.actions}>
          <button className={styles.trackBtn}>TRACK ORDER</button>
          <Link to="/" className={styles.homeLink}>
            CONTINUE SHOPPING <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
