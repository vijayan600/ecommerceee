import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Bot, Loader2, MessageSquare, Send, SlidersHorizontal, Calculator, ChevronDown } from 'lucide-react';
import styles from './AIAdvisor.module.css';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const SYSTEM_PROMPT = `You are a friendly and knowledgeable shop assistant for "Suguna Wet Grinder" in Erode, Tamil Nadu, India.
The shop sells kitchen appliances and electronics. Brands include: Suguna, Crompton, Butterfly, Prestige, Vidiem, Surya, and Samsung.
Contact: 98431 55508 / 98677 11233. Location: Erode, Tamil Nadu.
- Give short, helpful answers in simple English.
- If asked about exact price, suggest calling the shop.
- If comparing products, give a clear recommendation.
- Be warm and friendly. You can use Tamil words occasionally like "Vanakkam".
- If the user asks about EMI, instalment, monthly payment, finance, or loan for a product, respond ONLY with a JSON block in this exact format and nothing else:
  {"emi_intent": true, "product_name": "<product name>", "price": <number or null>}
- If price is mentioned extract it, otherwise set null.`;

// ─── EMI Calculator — Bottom Sheet Slide ──────────────────────────────────────

export const EMICalculator = ({ initialPrice = '', initialProduct = '', onClose }) => {
  const [price, setPrice] = useState(String(initialPrice));
  const [months, setMonths] = useState(12);
  const [rate, setRate] = useState(14);
  const [emi, setEmi] = useState(null);
  const [plans, setPlans] = useState([]);
  const [visible, setVisible] = useState(false);

  // drag-to-dismiss state
  const sheetRef = useRef(null);
  const startY = useRef(null);
  const currentY = useRef(0);

  const TENURE_OPTIONS = [3, 6, 9, 12, 18, 24];

  // slide in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  // touch drag-to-dismiss
  const onTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e) => {
    if (startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && sheetRef.current) {
      currentY.current = dy;
      sheetRef.current.style.transform = `translateY(${dy}px)`;
    }
  };
  const onTouchEnd = () => {
    if (currentY.current > 100) {
      handleClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    startY.current = null;
    currentY.current = 0;
  };

  const calcEMI = useCallback((p, r, n) => {
    if (!p || p <= 0) return 0;
    const monthly = r / 12 / 100;
    if (monthly === 0) return p / n;
    return (p * monthly * Math.pow(1 + monthly, n)) / (Math.pow(1 + monthly, n) - 1);
  }, []);

  useEffect(() => {
    const p = parseFloat(price);
    if (!p || p <= 0) { setEmi(null); setPlans([]); return; }
    const currentEmi = calcEMI(p, rate, months);
    setEmi(currentEmi);
    const allPlans = TENURE_OPTIONS.map(n => {
      const e = calcEMI(p, rate, n);
      const total = e * n;
      return { months: n, emi: e, total, interest: total - p };
    });
    setPlans(allPlans);
  }, [price, months, rate, calcEMI]);

  const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

  return (
    <div className={`${styles.sheetOverlay} ${visible ? styles.sheetOverlayVisible : ''}`} onClick={handleClose}>
      <div
        ref={sheetRef}
        className={`${styles.sheet} ${visible ? styles.sheetVisible : ''}`}
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div className={styles.sheetHandle} />

        {/* Header */}
        <div className={styles.sheetHeader}>
          <div className={styles.sheetHeaderIcon}>
            <Calculator size={20} />
          </div>
          <div className={styles.sheetHeaderText}>
            <h3>EMI Calculator</h3>
            <p>{initialProduct ? `For: ${initialProduct}` : 'Plan your purchase'}</p>
          </div>
          <button className={styles.sheetCloseBtn} onClick={handleClose} aria-label="Close">
            <ChevronDown size={22} />
          </button>
        </div>

        <div className={styles.sheetBody}>
          {/* Price + Rate row */}
          <div className={styles.emiInputGrid}>
            <div className={styles.emiField}>
              <label>Product Price (₹)</label>
              <input
                type="number"
                className={styles.emiInput}
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g. 8500"
                min="0"
                inputMode="numeric"
              />
            </div>
            <div className={styles.emiField}>
              <label>Interest Rate — <strong>{rate}% p.a.</strong></label>
              <input
                type="range"
                min="6" max="24" step="0.5"
                value={rate}
                onChange={e => setRate(parseFloat(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderTicks}>
                <span>6%</span><span>15%</span><span>24%</span>
              </div>
            </div>
          </div>

          {/* Tenure pills */}
          <div className={styles.tenureTabs}>
            {TENURE_OPTIONS.map(n => (
              <button
                key={n}
                className={`${styles.tenureTab} ${months === n ? styles.tenureActive : ''}`}
                onClick={() => setMonths(n)}
              >
                {n}M
              </button>
            ))}
          </div>

          {/* Hero EMI */}
          {emi !== null && parseFloat(price) > 0 ? (
            <>
              <div className={styles.emiHero}>
                <span className={styles.emiLabel}>Monthly EMI</span>
                <span className={styles.emiAmount}>₹{fmt(emi)}</span>
                <span className={styles.emiSub}>for {months} months @ {rate}% p.a.</span>
              </div>

              {/* Plans table */}
              <div className={styles.plansTable}>
                <div className={styles.plansHeader}>
                  <span>Tenure</span><span>EMI/mo</span><span>Total</span><span>Interest</span>
                </div>
                {plans.map(p => (
                  <div
                    key={p.months}
                    className={`${styles.planRow} ${p.months === months ? styles.planRowActive : ''}`}
                    onClick={() => setMonths(p.months)}
                  >
                    <span>{p.months} mo</span>
                    <span>₹{fmt(p.emi)}</span>
                    <span>₹{fmt(p.total)}</span>
                    <span className={styles.interest}>₹{fmt(p.interest)}</span>
                  </div>
                ))}
              </div>

              <p className={styles.emiDisclaimer}>
                * Indicative only. Actual EMI may vary by lender. Contact shop for finance options.
              </p>
            </>
          ) : (
            <div className={styles.emiEmpty}>
              <Calculator size={40} opacity={0.2} />
              <p>Enter a product price to see EMI plans</p>
            </div>
          )}
        </div>

        <div className={styles.sheetFooter}>
          <button className={styles.doneBtn} onClick={handleClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

// ─── Budget Filter Bar ────────────────────────────────────────────────────────

export const BudgetFilter = ({ products = [], onFilter, maxBudget = 50000 }) => {
  const [budget, setBudget] = useState(maxBudget);
  const [inputVal, setInputVal] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const applyFilter = useCallback((val) => {
    const b = Number(val);
    if (!onFilter) return;
    if (!b || b >= maxBudget) {
      onFilter(products);
    } else {
      onFilter(products.filter(p => p.price <= b));
    }
  }, [products, onFilter, maxBudget]);

  const handleSlider = (e) => {
    const v = Number(e.target.value);
    setBudget(v);
    setInputVal(v < maxBudget ? String(v) : '');
    applyFilter(v < maxBudget ? v : maxBudget);
  };

  const handleInput = (e) => {
    setInputVal(e.target.value);
    const v = Number(e.target.value);
    if (v > 0) {
      setBudget(Math.min(v, maxBudget));
      applyFilter(v);
    } else {
      setBudget(maxBudget);
      applyFilter(maxBudget);
    }
  };

  const handleClear = () => {
    setBudget(maxBudget);
    setInputVal('');
    if (onFilter) onFilter(products);
  };

  const hasFilter = budget < maxBudget;
  const fmt = (n) => new Intl.NumberFormat('en-IN').format(n);

  return (
    <div className={styles.budgetBar}>
      <button
        className={`${styles.budgetToggle} ${hasFilter ? styles.budgetActive : ''}`}
        onClick={() => setIsOpen(o => !o)}
      >
        <SlidersHorizontal size={16} />
        {hasFilter ? `Budget: ₹${fmt(budget)}` : 'Set Budget'}
        {hasFilter && (
          <span className={styles.budgetClear} onClick={(e) => { e.stopPropagation(); handleClear(); }}>✕</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.budgetPanel}>
          <div className={styles.budgetPanelHeader}>
            <span>Max Budget</span>
            <input
              type="number"
              className={styles.budgetInput}
              value={inputVal}
              onChange={handleInput}
              placeholder={`Up to ₹${fmt(maxBudget)}`}
              inputMode="numeric"
            />
          </div>
          <input
            type="range"
            min="1000"
            max={maxBudget}
            step="500"
            value={budget}
            onChange={handleSlider}
            className={styles.budgetSlider}
          />
          <div className={styles.budgetSliderLabels}>
            <span>₹1,000</span>
            <span className={styles.budgetCurrent}>
              {hasFilter ? `₹${fmt(budget)}` : 'All products'}
            </span>
            <span>₹{fmt(maxBudget)}</span>
          </div>
          <button className={styles.budgetDone} onClick={() => setIsOpen(false)}>Apply</button>
        </div>
      )}
    </div>
  );
};

// ─── AI Advisor Modal ─────────────────────────────────────────────────────────

export const AIAdvisor = ({ products, onClose }) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAdvice = async () => {
      setLoading(true);
      setError(null);

      const productDetails = products
        .map(p => `${p.name} (${p.brand}) - ₹${p.price}. Specs: ${JSON.stringify(p.specs)}`)
        .join('\n');

      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            max_tokens: 300,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              {
                role: 'user',
                content: `Compare these products and give a clear recommendation in 3-4 sentences:\n${productDetails}`,
              },
            ],
          }),
        });

        if (!res.ok) throw new Error('Failed to get advice.');
        const data = await res.json();
        setResponse(data.choices[0].message.content);
      } catch (err) {
        console.error(err);
        setError('Our AI Advisor is currently busy. Please try again in a moment.');
      } finally {
        setLoading(false);
      }
    };

    getAdvice();
  }, [products]);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}><X /></button>
        <div className={styles.header}>
          <div className={styles.botIcon}>
            <Bot size={28} />
          </div>
          <div>
            <h3>Suguna AI Advisor</h3>
            <p>Smart recommendations for you</p>
          </div>
        </div>
        <div className={styles.body}>
          {loading ? (
            <div className={styles.loading}>
              <Loader2 className={styles.spinner} />
              <p>Analyzing products...</p>
            </div>
          ) : error ? (
            <div className={styles.error}><p>{error}</p></div>
          ) : (
            <div className={styles.response}>
              <MessageSquare className={styles.quoteIcon} size={24} />
              <div className={styles.text}>{response}</div>
              <div className={styles.footer}>
                <p>✓ Based on local Erode customer preferences</p>
              </div>
            </div>
          )}
        </div>
        <button className={styles.doneBtn} onClick={onClose}>Got it, thanks!</button>
      </div>
    </div>
  );
};

// ─── Floating Chatbot ─────────────────────────────────────────────────────────

export const Chatbot = ({ currentProduct = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "👋 Vanakkam! I'm the Suguna Assistant. Ask me about our wet grinders, mixers, fans, or any product!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showEMI, setShowEMI] = useState(false);
  const [emiProduct, setEmiProduct] = useState({ name: '', price: '' });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickChips = currentProduct
    ? [`EMI for this product?`, 'Compare with similar?', 'Is this worth buying?', 'Shop timings?']
    : ['Best wet grinder under ₹5000?', 'Which mixer grinder is good?', 'Samsung products?', 'Shop timings?'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentProduct && history.length === 0) {
      setHistory([{
        role: 'system',
        content: `The customer is currently viewing: ${currentProduct.name} priced at ₹${currentProduct.price}.`,
      }]);
    }
  }, [isOpen, currentProduct]);

  const openEMIFromBot = (productName, price) => {
    setEmiProduct({ name: productName, price: price || currentProduct?.price || '' });
    setShowEMI(true);
  };

  const sendMessage = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    if (trimmed === 'EMI for this product?' && currentProduct) {
      openEMIFromBot(currentProduct.name, currentProduct.price);
      setMessages(prev => [
        ...prev,
        { role: 'user', text: trimmed },
        { role: 'bot', text: `Sure! Opening the EMI calculator for ${currentProduct.name} 📊` },
      ]);
      return;
    }

    const newHistory = [...history, { role: 'user', content: trimmed }];
    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);
    setHistory(newHistory);

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 200,
          temperature: 0.7,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newHistory,
          ],
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const reply = data.choices[0].message.content;

      let parsedEMI = null;
      try {
        const jsonMatch = reply.match(/\{[\s\S]*"emi_intent"[\s\S]*\}/);
        if (jsonMatch) parsedEMI = JSON.parse(jsonMatch[0]);
      } catch (_) {}

      if (parsedEMI?.emi_intent) {
        const pName = parsedEMI.product_name || currentProduct?.name || 'this product';
        const pPrice = parsedEMI.price || currentProduct?.price || '';
        setHistory(prev => [...prev, { role: 'assistant', content: `Opening EMI calculator for ${pName}.` }]);
        setMessages(prev => [
          ...prev,
          { role: 'bot', text: `Sure! Let me open the EMI calculator for ${pName} 📊` },
        ]);
        setTimeout(() => openEMIFromBot(pName, pPrice), 600);
      } else {
        setHistory(prev => [...prev, { role: 'assistant', content: reply }]);
        setMessages(prev => [...prev, { role: 'bot', text: reply }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: '❌ Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {showEMI && (
        <EMICalculator
          initialPrice={emiProduct.price}
          initialProduct={emiProduct.name}
          onClose={() => setShowEMI(false)}
        />
      )}

      <button className={styles.fab} onClick={() => setIsOpen(o => !o)} aria-label="Open chat assistant">
        {isOpen ? <X size={24} color="#0A1628" /> : <Bot size={24} color="#0A1628" />}
      </button>

      <div className={`${styles.chatWindow} ${isOpen ? styles.chatOpen : ''}`}>
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderLogo}>
            <Bot size={20} color="#0A1628" />
          </div>
          <div className={styles.chatHeaderInfo}>
            <h4>Suguna Assistant</h4>
            <p>Ask me anything</p>
          </div>
          <button
            className={styles.chatEmiBtn}
            onClick={() => openEMIFromBot(currentProduct?.name || '', currentProduct?.price || '')}
            title="EMI Calculator"
            aria-label="Open EMI Calculator"
          >
            <Calculator size={16} />
          </button>
          <button className={styles.chatCloseBtn} onClick={() => setIsOpen(false)} aria-label="Close chat">
            <X size={18} />
          </button>
        </div>

        <div className={styles.chatMessages}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.chatMsg} ${styles[msg.role]}`}>{msg.text}</div>
          ))}
          {messages.length === 1 && (
            <div className={styles.chips}>
              {quickChips.map(chip => (
                <button key={chip} className={styles.chip} onClick={() => sendMessage(chip)}>{chip}</button>
              ))}
            </div>
          )}
          {loading && (
            <div className={`${styles.chatMsg} ${styles.bot} ${styles.typingMsg}`}>
              <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.chatInputRow}>
          <textarea
            ref={inputRef}
            className={styles.chatInput}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your question..."
            rows={1}
          />
          <button
            className={styles.chatSendBtn}
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            <Send size={18} color="white" />
          </button>
        </div>
      </div>
    </>
  );
};

export default AIAdvisor;