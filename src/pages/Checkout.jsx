import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { Check, MapPin, CreditCard, ShoppingBag, ChevronRight, AlertCircle } from 'lucide-react';
import { ERODE_PINCODES } from '../data/pincodes';
import styles from './Checkout.module.css';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Form State
  const [address, setAddress] = useState({
    name: '', phone: '', pincode: '', line1: '', line2: '', landmark: '', 
    city: 'Erode', district: 'Erode'
  });
  const [pincodeStatus, setPincodeStatus] = useState(null); // 'erode', 'external', null
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'online'
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePincodeChange = (e) => {
    const val = e.target.value;
    setAddress({ ...address, pincode: val });
    if (val.length === 6) {
      if (ERODE_PINCODES.includes(parseInt(val))) {
        setPincodeStatus('erode');
        setPaymentMethod('cod'); // Default to COD for local
      } else {
        setPincodeStatus('external');
        setPaymentMethod('online'); // Force UPI for external
      }
    } else {
      setPincodeStatus(null);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!pincodeStatus) return;
      setStep(2);
    } else if (step === 2) {
      handlePlaceOrder();
    }
  };

  const payWithRazorpay = () => {
    return new Promise((resolve, reject) => {
      // Get the Razorpay Key from Vite env (fallback to the hardcoded test key provided in backend/.env)
      const razorpayKey = import.meta.env.RAZORPAY_KEY_ID;

      const options = {
        key: razorpayKey,
        amount: cartTotal * 100, // Amount in paise
        currency: 'INR',
        name: 'Suguna Wet Grinder',
        description: 'Order Payment',
        handler: function (response) {
          // Payment successful!
          resolve({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        prefill: {
          name: address.name,
          contact: address.phone,
          email: 'customer@sugunagrinder.com',
          method: 'upi' // Prefills UPI method immediately
        },
        notes: {
          address: `${address.line1}, ${address.line2}, ${address.city} - ${address.pincode}`
        },
        theme: {
          color: '#fb641b' // Suguna Premium Orange
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    if (paymentMethod === 'online') {
      try {
        const paymentResult = await payWithRazorpay();
        
        const newOrder = placeOrder({
          customerName: address.name,
          phone: address.phone,
          items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: cartTotal,
          deliveryType: pincodeStatus === 'erode' ? 'door' : 'online',
          address: {
            doorNo: address.line1,
            street: address.line2,
            area: address.landmark,
            city: address.city,
            pincode: address.pincode
          },
          paymentMethod: 'online',
          paymentStatus: 'paid',
          transactionId: paymentResult.razorpay_payment_id
        });

        clearCart();
        navigate('/order-confirmation', { 
          state: { 
            orderId: newOrder.id,
            paymentMethod: 'online'
          } 
        });
      } catch (err) {
        alert(err.message || 'Payment failed or cancelled.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // COD Order
      const newOrder = placeOrder({
        customerName: address.name,
        phone: address.phone,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: cartTotal,
        deliveryType: 'door',
        address: {
          doorNo: address.line1,
          street: address.line2,
          area: address.landmark,
          city: address.city,
          pincode: address.pincode
        },
        paymentMethod: 'cod',
        paymentStatus: 'pending'
      });

      clearCart();
      setIsProcessing(false);
      navigate('/order-confirmation', { 
        state: { 
          orderId: newOrder.id,
          paymentMethod: 'cod' 
        } 
      });
    }
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div className={`container ${styles.empty}`}>
        <ShoppingBag size={64} />
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/products')}>Shop Now</button>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.stepper}>
        <div className={`${styles.step} ${step >= 1 ? styles.activeStep : ''}`}>
          <div className={styles.stepCircle}>{step > 1 ? <Check size={16} /> : 1}</div>
          <span>Address</span>
        </div>
        <div className={styles.connector}></div>
        <div className={`${styles.step} ${step >= 2 ? styles.activeStep : ''}`}>
          <div className={styles.stepCircle}>{step > 2 ? <Check size={16} /> : 2}</div>
          <span>Payment</span>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          {step === 1 && (
            <div className={styles.card}>
              <h3>Delivery Address</h3>
              <form className={styles.form} onSubmit={e => e.preventDefault()}>
                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label>Full Name</label>
                    <input type="text" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} placeholder="Enter name" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Phone Number</label>
                    <input type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="10-digit number" />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label>Pincode</label>
                    <input type="text" maxLength={6} value={address.pincode} onChange={handlePincodeChange} placeholder="6 digits" />
                    {pincodeStatus === 'external' && (
                      <p className={styles.successText}><Check size={14} /> Online Delivery via Courier available to your pincode!</p>
                    )}
                    {pincodeStatus === 'erode' && (
                      <p className={styles.successText}><Check size={14} /> Free Local Door Delivery & Cash on Delivery available!</p>
                    )}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Address (House No, Building, Street, Area)</label>
                  <input type="text" value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label>City</label>
                    <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="City" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>District</label>
                    <input type="text" value={address.district} onChange={e => setAddress({...address, district: e.target.value})} placeholder="District" />
                  </div>
                </div>

                <button 
                  className={styles.nextBtn} 
                  disabled={!pincodeStatus || !address.name || !address.phone}
                  onClick={handleNext}
                >
                  DELIVER TO THIS ADDRESS
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className={styles.card}>
              <h3>Payment Options</h3>
              <div className={styles.paymentList}>
                {pincodeStatus === 'erode' && (
                  <div 
                    className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.selected : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <input type="radio" checked={paymentMethod === 'cod'} readOnly />
                    <div className={styles.optionContent}>
                      <h4>Cash on Delivery (COD)</h4>
                      <p>Pay in cash when you receive the product at your door</p>
                    </div>
                  </div>
                )}

                <div 
                  className={`${styles.paymentOption} ${paymentMethod === 'online' ? styles.selected : ''}`}
                  onClick={() => setPaymentMethod('online')}
                >
                  <input type="radio" checked={paymentMethod === 'online'} readOnly />
                  <div className={styles.optionContent}>
                    <h4>UPI / Razorpay Secure Payment</h4>
                    <p>Pay using Google Pay, PhonePe, Paytm, or Card (Direct Redirect)</p>
                  </div>
                </div>
              </div>

              {paymentMethod === 'online' && (
                <div className={styles.qrSection}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <CreditCard size={48} color="#fb641b" />
                    <h4>Safe & Secure UPI Payment Gateway</h4>
                    <p style={{ fontSize: '0.9rem', color: '#666', maxWidth: '360px' }}>
                      Once you click pay, you will be securely redirected to select Google Pay, PhonePe, UPI, or other payment options.
                    </p>
                  </div>
                </div>
              )}

              <button 
                className={styles.nextBtn} 
                disabled={isProcessing}
                onClick={handleNext}
              >
                {isProcessing ? 'Processing...' : (paymentMethod === 'cod' ? 'CONFIRM COD ORDER' : `PAY ₹${cartTotal.toLocaleString('en-IN')} SECURELY`)}
              </button>
            </div>
          )}
        </div>

        <aside className={styles.summary}>
          <div className={styles.card}>
            <h3>Price Details</h3>
            <div className={styles.summaryRow}>
              <span>Price ({cart.length} items)</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Delivery Charges</span>
              <span className={styles.free}>FREE</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total Amount</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.savings}>
              You will save ₹{Math.round(cartTotal * 0.2).toLocaleString()} on this order
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;