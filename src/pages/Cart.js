import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

function Cart() {
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState('cart'); // cart, address, success
  
  // Change 1: Load address from localStorage
  const [address, setAddress] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('savedAddress') || '{}');
    return {
      name: saved.name || '',
      phone: saved.phone || '',
      ward: saved.ward || 'Ward 1',
      area: saved.area || '',
      note: saved.note || '',
      deliveryDate: saved.deliveryDate || ''
    };
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const delivery = total > 500 ? 0 : 50;
  const grandTotal = total + delivery;

  // Calculate Maximum Delivery Days from the items in the cart
  const maxDeliveryDays = cart.reduce((max, item) => {
    const days = parseInt(item.deliveryDays) || 0;
    return days > max ? days : max;
  }, 0);

  const estDateObj = new Date(Date.now() + maxDeliveryDays * 86400000);
  const minDateString = estDateObj.toISOString().split('T')[0];

  const removeItem = (id) => {
    const updated = cart.filter(i => i.id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const changeQty = (id, delta) => {
    const updated = cart.map(i => i.id === id ? {...i, qty: Math.max(1, i.qty + delta)} : i);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const placeOrder = async () => {
    if (!address.name || !address.phone || !address.area) {
      alert('Sabai mandatory fields bharnu!'); return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        items: cart,
        total: grandTotal,
        address: address,
        status: 'Pending',
        paymentMethod: 'Cash on Delivery',
        userId: auth.currentUser?.uid || 'guest',
        userName: address.name,
        userPhone: address.phone,
        deliveryDate: address.deliveryDate || minDateString,
        createdAt: new Date()
      });
      
      // Change 2: Save address to localStorage on successful order
      localStorage.setItem('savedAddress', JSON.stringify(address));
      
      localStorage.removeItem('cart');
      setCart([]);
      setStep('success');
    } catch (err) {
      alert('Order place garna sakiena! Pheri try garnu.');
    }
    setLoading(false);
  };

  // Reusable Stepper Component
  const Stepper = ({ currentStep }) => (
    <div style={styles.stepperContainer}>
      <div style={{...styles.step, color: currentStep === 'cart' ? '#C0392B' : '#27AE60'}}>
        <div style={{...styles.stepCircle, background: currentStep === 'cart' ? '#C0392B' : '#27AE60', color: 'white'}}>1</div>
        <span style={styles.stepText}>Cart</span>
      </div>
      <div style={styles.stepLine}></div>
      <div style={{...styles.step, color: currentStep === 'address' ? '#C0392B' : (currentStep === 'success' ? '#27AE60' : '#BDC3C7')}}>
        <div style={{...styles.stepCircle, background: currentStep === 'address' ? '#C0392B' : (currentStep === 'success' ? '#27AE60' : '#EAEDED'), color: currentStep === 'cart' ? '#7F8C8D' : 'white'}}>2</div>
        <span style={styles.stepText}>Checkout</span>
      </div>
      <div style={styles.stepLine}></div>
      <div style={{...styles.step, color: currentStep === 'success' ? '#27AE60' : '#BDC3C7'}}>
        <div style={{...styles.stepCircle, background: currentStep === 'success' ? '#27AE60' : '#EAEDED', color: currentStep === 'success' ? 'white' : '#7F8C8D'}}>3</div>
        <span style={styles.stepText}>Done</span>
      </div>
    </div>
  );

  // Success Page
  if (step === 'success') {
    return (
      <div style={styles.successPage}>
        <div className="premium-card" style={styles.successCard}>
          <div className="success-bounce" style={styles.successIcon}>🎉</div>
          <h2 style={styles.successTitle}>Order Confirmed!</h2>
          <p style={styles.successSub}>Thank you for shopping with ZipZo.</p>
          <div style={styles.successInfoBox}>
            <div style={styles.infoRow}>
              <span style={styles.infoIcon}>📦</span>
              <div>
                <p style={styles.infoLabel}>Payment Method</p>
                <p style={styles.infoValue}>Cash on Delivery</p>
              </div>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoIcon}>🚚</span>
              <div>
                <p style={styles.infoLabel}>Estimated Delivery</p>
                <p style={styles.infoValue}>{new Date(address.deliveryDate || minDateString).toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'})}</p>
              </div>
            </div>
          </div>
          <p style={styles.successNote}>📞 Hamro team le tapai lai order confirm garna call garnechha.</p>
          
          <div style={styles.successBtnGroup}>
            <button className="premium-btn-outline" style={styles.outlineBtn} onClick={() => window.location.href='/orders'}>
              Track Order
            </button>
            <button className="premium-btn-solid" style={styles.solidBtn} onClick={() => window.location.href='/'}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Address Page
  if (step === 'address') {
    return (
      <div style={styles.page}>
        <div style={styles.navbar}>
          <button className="back-btn-hover" style={styles.back} onClick={() => setStep('cart')}>&larr; Back to Cart</button>
          <h2 style={styles.navTitle}>Checkout</h2>
          <div style={{width: '80px'}} /> {/* Spacer for centering */}
        </div>
        
        <div style={styles.body}>
          <Stepper currentStep="address" />

          <div style={styles.checkoutGrid}>
            {/* Left Column: Form */}
            <div style={styles.checkoutLeft}>
              <div className="premium-card" style={styles.formCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.formTitle}>📍 Delivery Address</h3>
                  <p style={styles.formSubtitle}>Provide your details for safe delivery.</p>
                </div>
                
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name *</label>
                    <input className="premium-input" style={styles.input} placeholder="e.g. Roshan Mehta"
                      value={address.name} onChange={e => setAddress({...address, name: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone Number *</label>
                    <input className="premium-input" style={styles.input} placeholder="98XXXXXXXX"
                      value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Ward Select</label>
                    <select className="premium-input" style={styles.input} value={address.ward}
                      onChange={e => setAddress({...address, ward: e.target.value})}>
                      {Array.from({length:19}, (_,i) => (
                        <option key={i+1} value={`Ward ${i+1}`}>Ward {i+1} — Biratnagar</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Area / Tole *</label>
                    <input className="premium-input" style={styles.input} placeholder="e.g. Traffic Chowk"
                      value={address.area} onChange={e => setAddress({...address, area: e.target.value})} />
                  </div>
                  <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                    <label style={styles.label}>Additional Note (Optional)</label>
                    <input className="premium-input" style={styles.input} placeholder="e.g. Ghar ko rang rato xa..."
                      value={address.note} onChange={e => setAddress({...address, note: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Summary */}
            <div style={styles.checkoutRight}>
              <div className="premium-card" style={styles.summaryCard}>
                <h3 style={styles.formTitle}>Order Summary</h3>
                <div style={styles.summaryItems}>
                  {cart.map(item => (
                    <div key={item.id} style={styles.summaryRow}>
                      <span style={styles.summaryItemTitle}>{item.title} <span style={styles.summaryQty}>x{item.qty}</span></span>
                      <span style={styles.summaryItemPrice}>Rs. {item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
                
                <div style={styles.divider}></div>
                
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Subtotal</span>
                  <span style={styles.summaryValue}>Rs. {total}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Delivery Fee</span>
                  <span style={{...styles.summaryValue, color: delivery === 0 ? '#27AE60' : '#2C3E50'}}>
                    {delivery === 0 ? 'Free' : `Rs. ${delivery}`}
                  </span>
                </div>
                
                <div style={styles.divider}></div>
                
                <div style={styles.summaryTotalRow}>
                  <span>Total Amount</span>
                  <span style={styles.grandTotal}>Rs. {grandTotal}</span>
                </div>

                {/* Trust Badge for COD */}
                <div style={styles.trustBadge}>
                  <div style={styles.trustIcon}>💵</div>
                  <div>
                    <h4 style={styles.trustTitle}>Cash on Delivery</h4>
                    <p style={styles.trustDesc}>Pay securely when you receive your order.</p>
                  </div>
                </div>

                <button className="premium-btn-checkout" style={styles.placeBtn} onClick={placeOrder} disabled={loading}>
                  {loading ? (
                    <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                      <div className="spinner-small"></div> Processing...
                    </span>
                  ) : (
                    `Confirm Order • Rs. ${grandTotal}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cart Page
  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <button className="back-btn-hover" style={styles.back} onClick={() => window.location.href='/'}>&larr; Back to Shop</button>
        <h2 style={styles.navTitle}>Shopping Cart</h2>
        <div style={{width: '100px'}} />
      </div>
      
      <div style={styles.body}>
        <Stepper currentStep="cart" />

        {cart.length === 0 ? (
          <div className="premium-card" style={styles.empty}>
            <div style={styles.emptyIcon}>🛒</div>
            <h3 style={styles.emptyTitle}>Your cart is empty</h3>
            <p style={styles.emptyDesc}>Looks like you haven't added any books yet.</p>
            <button className="premium-btn-solid" style={{...styles.solidBtn, padding: '12px 32px'}} onClick={() => window.location.href='/'}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={styles.checkoutGrid}>
            <div style={styles.checkoutLeft}>
              {cart.map(item => (
                <div key={item.id} className="premium-cart-item" style={styles.item}>
                  <div style={styles.itemImgBox}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.title} style={styles.itemImg} />
                      : <span style={{fontSize:'32px'}}>📚</span>
                    }
                  </div>
                  
                  <div style={styles.itemInfo}>
                    <div style={styles.itemHeaderRow}>
                      <div>
                        <h4 style={styles.itemTitle}>{item.title}</h4>
                        <p style={styles.itemAuthor}>{item.author}</p>
                      </div>
                      <button className="delete-btn-hover" style={styles.removeBtn} onClick={() => removeItem(item.id)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </div>
                    
                    {item.deliveryDays ? (
                      <span style={styles.deliveryBadge}>🚚 By {new Date(Date.now() + item.deliveryDays * 86400000).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>
                    ) : (
                      <span style={styles.deliveryBadge}>⚡ Same Day Delivery</span>
                    )}

                    <div style={styles.itemActionRow}>
                      <span style={styles.itemPrice}>Rs. {item.price}</span>
                      <div style={styles.qtyControl}>
                        <button style={styles.qtyBtn} onClick={() => changeQty(item.id, -1)}>−</button>
                        <span style={styles.qtyNum}>{item.qty}</span>
                        <button style={styles.qtyBtn} onClick={() => changeQty(item.id, 1)}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.checkoutRight}>
              <div className="premium-card" style={styles.summaryCard}>
                <h3 style={styles.formTitle}>Cart Totals</h3>
                
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Subtotal ({cart.reduce((s,i)=>s+i.qty,0)} items)</span>
                  <span style={styles.summaryValue}>Rs. {total}</span>
                </div>
                
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Delivery Fee</span>
                  <span style={{...styles.summaryValue, color: delivery === 0 ? '#27AE60' : '#2C3E50', fontWeight: delivery === 0 ? '700' : '500'}}>
                    {delivery === 0 ? 'FREE' : `Rs. ${delivery}`}
                  </span>
                </div>
                
                {delivery > 0 && (
                  <div style={styles.upsellBox}>
                    <span style={{fontSize:'16px'}}>💡</span>
                    <span>Add <strong>Rs. {500 - total}</strong> more to your cart to get <strong>Free Delivery!</strong></span>
                  </div>
                )}
                
                <div style={styles.divider}></div>
                
                <div style={styles.summaryTotalRow}>
                  <span>Total Amount</span>
                  <span style={styles.grandTotal}>Rs. {grandTotal}</span>
                </div>
                
                <button className="premium-btn-checkout" style={styles.checkoutBtn} onClick={() => setStep('address')}>
                  Proceed to Checkout &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', background:'#F4F7F6', fontFamily:"'Inter', system-ui, -apple-system, sans-serif", paddingBottom: '60px' },
  
  /* Glassmorphism Navbar */
  navbar: { background:'rgba(192, 57, 43, 0.95)', backdropFilter: 'blur(10px)', padding:'16px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  back: { background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', color:'white', fontSize:'14px', fontWeight: '500', cursor:'pointer', padding: '8px 16px', borderRadius: '30px', transition: 'all 0.2s' },
  navTitle: { color:'white', margin:0, fontSize:'18px', fontWeight: '700', letterSpacing: '0.5px' },
  
  body: { padding:'24px', maxWidth:'1000px', margin:'0 auto' },
  
  /* Stepper */
  stepperContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', gap: '12px', maxWidth: '500px', margin: '0 auto 40px' },
  step: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px', transition: 'color 0.3s' },
  stepCircle: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', transition: 'all 0.3s' },
  stepText: { display: window.innerWidth < 500 ? 'none' : 'block' },
  stepLine: { flex: 1, height: '2px', background: '#EAEDED', borderRadius: '2px' },
  
  /* Grid Layout */
  checkoutGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', alignItems: 'start' },
  checkoutLeft: { display: 'flex', flexDirection: 'column', gap: '16px' },
  checkoutRight: { position: 'sticky', top: '100px' },
  
  /* Empty Cart */
  empty: { textAlign:'center', padding:'80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  emptyIcon: { fontSize:'72px', marginBottom: '16px', opacity: 0.8 },
  emptyTitle: { fontSize: '24px', fontWeight: '800', color: '#2C3E50', margin: '0 0 8px' },
  emptyDesc: { color: '#7F8C8D', marginBottom: '32px' },
  
  /* Premium Cart Items */
  item: { background:'white', borderRadius:'16px', padding:'20px', display:'flex', gap:'20px', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #F2F4F4' },
  itemImgBox: { width:'90px', height:'120px', background:'#F8F9F9', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden', border: '1px solid #EAEDED' },
  itemImg: { width:'100%', height:'100%', objectFit:'cover' },
  itemInfo: { flex:1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  itemHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemTitle: { margin:'0 0 6px', fontWeight:'700', fontSize:'16px', color:'#2C3E50', lineHeight: '1.3' },
  itemAuthor: { margin:0, fontSize:'13px', color:'#7F8C8D', fontWeight: '500' },
  removeBtn: { background:'transparent', border:'none', color:'#E74C3C', cursor:'pointer', padding: '6px', borderRadius: '8px', transition: 'background 0.2s' },
  deliveryBadge: { display: 'inline-block', background: '#EAFAF1', color: '#27AE60', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', marginTop: '8px', alignSelf: 'flex-start' },
  itemActionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' },
  itemPrice: { fontSize:'18px', color:'#C0392B', fontWeight:'800' },
  qtyControl: { display:'flex', alignItems:'center', background: '#F8F9F9', borderRadius: '30px', padding: '4px 6px', border: '1px solid #EAEDED' },
  qtyBtn: { width:'28px', height:'28px', border:'none', borderRadius:'50%', background:'white', cursor:'pointer', fontSize:'16px', fontWeight: 'bold', color: '#2C3E50', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  qtyNum: { fontSize:'14px', fontWeight:'700', minWidth:'30px', textAlign:'center', color: '#2C3E50' },
  
  /* Address Form */
  formCard: { padding:'32px' },
  cardHeader: { marginBottom: '24px', borderBottom: '1px solid #EAEDED', paddingBottom: '16px' },
  formTitle: { fontSize:'20px', fontWeight:'800', color:'#2C3E50', margin: '0 0 4px' },
  formSubtitle: { fontSize: '14px', color: '#7F8C8D', margin: 0 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize:'13px', fontWeight:'700', color:'#34495E', letterSpacing: '0.3px' },
  input: { padding:'12px 16px', border:'1.5px solid #EAEDED', borderRadius:'12px', fontSize:'15px', outline:'none', transition: 'all 0.2s', background: '#F8F9F9', color: '#2C3E50' },
  
  /* Summary Card */
  summaryCard: { padding:'28px' },
  summaryItems: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' },
  summaryRow: { display:'flex', justifyContent:'space-between', alignItems: 'center', fontSize:'15px' },
  summaryItemTitle: { color: '#5C6A79', fontWeight: '500' },
  summaryQty: { color: '#95A5A6', fontSize: '13px', marginLeft: '6px' },
  summaryItemPrice: { color: '#2C3E50', fontWeight: '600' },
  divider: { height: '1px', background: '#EAEDED', margin: '20px 0' },
  summaryLabel: { color: '#7F8C8D', fontWeight: '500' },
  summaryValue: { color: '#2C3E50', fontWeight: '700' },
  upsellBox: { background: '#FEF9E7', padding: '12px 16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px', border: '1px solid #F9E79F', color: '#D4AC0D', fontSize: '13px' },
  summaryTotalRow: { display:'flex', justifyContent:'space-between', alignItems: 'center', fontSize:'18px', fontWeight: '800', color: '#2C3E50', marginBottom: '24px' },
  grandTotal: { color:'#C0392B', fontSize: '24px' },
  
  trustBadge: { background:'#F8F9F9', border: '1px solid #EAEDED', borderRadius:'12px', padding:'16px', display:'flex', gap:'16px', alignItems:'center', marginBottom:'24px' },
  trustIcon: { fontSize:'28px', background: '#EAFAF1', padding: '10px', borderRadius: '10px' },
  trustTitle: { fontWeight:'700', color: '#2C3E50', margin: '0 0 4px', fontSize: '15px' },
  trustDesc: { fontSize:'12px', color:'#7F8C8D', margin:0, lineHeight: '1.4' },
  
  checkoutBtn: { width:'100%', padding:'16px', borderRadius:'12px', fontSize:'16px', fontWeight:'700', marginTop:'12px' },
  placeBtn: { width:'100%', padding:'16px', borderRadius:'12px', fontSize:'16px', fontWeight:'800' },
  
  /* Success Page */
  successPage: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding: '40px 20px' },
  successCard: { padding:'48px 40px', textAlign:'center', maxWidth:'460px', width: '100%' },
  successIcon: { fontSize:'80px', marginBottom:'20px' },
  successTitle: { fontSize:'28px', fontWeight:'800', color:'#27AE60', margin:'0 0 8px' },
  successSub: { color:'#7F8C8D', fontSize: '15px', marginBottom:'32px' },
  successInfoBox: { background:'#F8F9F9', border: '1px solid #EAEDED', borderRadius:'16px', padding:'24px', textAlign:'left', marginBottom:'24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  infoRow: { display: 'flex', gap: '16px', alignItems: 'center' },
  infoIcon: { fontSize: '24px', background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  infoLabel: { fontSize: '12px', color: '#95A5A6', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px', margin: '0 0 4px' },
  infoValue: { fontSize: '15px', color: '#2C3E50', fontWeight: '700', margin: 0 },
  successNote: { fontSize: '14px', color: '#D35400', background: '#FDF2E9', padding: '12px', borderRadius: '10px', fontWeight: '500', marginBottom: '32px' },
  successBtnGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
  outlineBtn: { padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '700' },
  solidBtn: { padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '700' }
};

export default Cart;