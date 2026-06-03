import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchMyOrders(user.uid);
      } else {
        window.location.href = '/login';
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchMyOrders = async (userId) => {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const ordersData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      ordersData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders: ", error);
    }
    setLoading(false);
  };

  // 🖨️ INVOICE GENERATOR LOGIC
  const printInvoice = (order) => {
    const orderDate = new Date(order.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString();
    const orderId = order.id.slice(0, 8).toUpperCase();
    const isPaid = order.status === 'Delivered';

    const printContent = `
      <html>
        <head>
          <title>Invoice - ZipZo #${orderId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #C0392B; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 36px; font-weight: 900; color: #C0392B; margin: 0; letter-spacing: -1px; }
            .company-details { font-size: 13px; color: #555; margin-top: 8px; line-height: 1.5; }
            .invoice-title { font-size: 32px; font-weight: bold; color: #bdc3c7; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
            .details-row { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .box { background: #f9f9f9; padding: 20px; border-radius: 8px; width: 45%; border: 1px solid #eee; }
            h4 { margin: 0 0 10px 0; font-size: 12px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; }
            p { margin: 5px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #C0392B; color: white; padding: 12px; text-align: left; font-size: 13px; text-transform: uppercase; }
            td { padding: 14px 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            .total-box { float: right; width: 300px; }
            .total-line { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #555; }
            .grand-total { font-size: 20px; font-weight: bold; color: #C0392B; border-top: 2px solid #eee; padding-top: 12px; margin-top: 5px; }
            .watermark { position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 120px; color: rgba(192, 57, 43, 0.05); z-index: -1; font-weight: bold; text-transform: uppercase; }
            .footer { text-align: center; margin-top: 100px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d; font-size: 12px; line-height: 1.5; clear: both; }
          </style>
        </head>
        <body>
          <div class="watermark">${isPaid ? 'PAID' : 'PENDING'}</div>
          
          <div class="header">
            <div>
              <h1 class="logo">⚡ ZipZo</h1>
              <div class="company-details">
                <strong>ZipZo E-commerce Nepal</strong><br>
                Traffic Chowk, Biratnagar, Province 1<br>
                Phone: +977 98XXXXXXXX<br>
                Email: support@zipzo.com
              </div>
            </div>
            <div style="text-align: right;">
              <div class="invoice-title">TAX INVOICE</div>
              <p><strong>Invoice No:</strong> INV-${orderId}</p>
              <p><strong>Order Date:</strong> ${orderDate}</p>
            </div>
          </div>

          <div class="details-row">
            <div class="box">
              <h4>Billed To (Customer Details):</h4>
              <p><strong>${order.userName || 'Valued Customer'}</strong></p>
              <p>Phone: ${order.userPhone || 'N/A'}</p>
              <p>Delivery Location: ${order.address?.ward || ''}, ${order.address?.city || 'Biratnagar'}</p>
            </div>
            <div class="box">
              <h4>Payment Information:</h4>
              <p><strong>Method:</strong> Cash on Delivery (COD)</p>
              <p><strong>Order Status:</strong> ${order.status || 'Pending'}</p>
              <p><strong>Payment Status:</strong> <span style="color: ${isPaid ? '#27ae60' : '#e74c3c'}; font-weight: bold;">${isPaid ? 'PAID' : 'UNPAID'}</span></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th width="10%">S.N.</th>
                <th width="50%">Item Description</th>
                <th width="10%">Qty</th>
                <th width="15%">Unit Price</th>
                <th width="15%">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${item.title}</strong><br><span style="font-size:12px;color:#888;">By ${item.author}</span></td>
                  <td>${item.qty}</td>
                  <td>Rs. ${item.price}</td>
                  <td><strong>Rs. ${item.price * item.qty}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-box">
            <div class="total-line"><span>Subtotal:</span> <span>Rs. ${order.total}</span></div>
            <div class="total-line"><span>Delivery Charge:</span> <span>Rs. 0</span></div>
            <div class="total-line grand-total"><span>Grand Total:</span> <span>Rs. ${order.total}</span></div>
          </div>

          <div class="footer">
            <p><strong>Thank you for shopping with ZipZo!</strong></p>
            <p>If you have any questions concerning this invoice, please contact our support.</p>
            <p><i>This is a computer-generated invoice and does not require a physical signature.</i></p>
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(printContent);
    win.document.close();
    
    setTimeout(() => {
      win.print();
    }, 300);
  };

  const getStatusStyle = (status) => {
    if (status === 'Delivered') return { bg: '#EAFAF1', color: '#27AE60', icon: '✅' };
    if (status === 'Out for Delivery') return { bg: '#EBF5FB', color: '#2980B9', icon: '🚚' };
    if (status === 'Packed') return { bg: '#FEF9E7', color: '#F39C12', icon: '📦' };
    return { bg: '#FDF2E9', color: '#D35400', icon: '🕐' };
  };

  // 🚚 ORDER TRACKING VISUALIZATION LOGIC
  const renderTrackingBar = (currentStatus) => {
    const steps = ['Pending', 'Packed', 'Out for Delivery', 'Delivered'];
    let activeIndex = steps.indexOf(currentStatus || 'Pending');
    if (activeIndex === -1) activeIndex = 0; // fallback to 0 if not found

    return (
      <div style={styles.trackingWrapper}>
        <div style={styles.trackingLineBg}>
          <div style={{...styles.trackingLineActive, width: `${(activeIndex / (steps.length - 1)) * 100}%`}}></div>
        </div>
        <div style={styles.stepsContainer}>
          {steps.map((step, idx) => {
            const isActive = idx <= activeIndex;
            return (
              <div key={step} style={styles.stepBox}>
                <div style={{
                  ...styles.stepDot, 
                  background: isActive ? '#27AE60' : '#EAEDED',
                  color: isActive ? 'white' : 'transparent',
                  border: isActive ? '3px solid #ABEBC6' : '3px solid white',
                  boxShadow: isActive ? '0 0 10px rgba(39,174,96,0.3)' : 'none'
                }}>
                  {isActive ? '✓' : ''}
                </div>
                <span style={{
                  ...styles.stepLabel, 
                  color: isActive ? '#2C3E50' : '#95A5A6',
                  fontWeight: isActive ? '800' : '600'
                }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="page-enter" style={styles.page}>
      
      {/* Premium Navbar */}
      <div style={styles.navbar}>
        <button className="back-btn-hover" style={styles.back} onClick={() => window.location.href='/'}>&larr; Back to Shop</button>
        <h2 style={styles.navTitle}>📦 My Orders</h2>
        <div style={{width: '100px'}} />
      </div>

      <div style={styles.body}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div className="spinner"></div>
            <p style={{marginTop:'16px', color:'#7F8C8D', fontWeight:'500'}}>Fetching your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="premium-card" style={styles.empty}>
            <div style={styles.emptyIcon}>🛍️</div>
            <h3 style={styles.emptyTitle}>No Orders Yet</h3>
            <p style={styles.emptyDesc}>Looks like you haven't placed any orders. Start exploring our book collection!</p>
            <button className="premium-btn-solid" style={styles.shopBtn} onClick={() => window.location.href='/'}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {orders.map((order) => {
              const st = getStatusStyle(order.status);
              return (
                <div key={order.id} className="premium-card" style={styles.orderCard}>
                  
                  {/* Order Header */}
                  <div style={styles.orderHeader}>
                    <div>
                      <div style={styles.orderId}>Order #{order.id.slice(0, 8).toUpperCase()}</div>
                      <div style={styles.orderDate}>Placed on {new Date(order.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})}</div>
                    </div>
                    
                    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                      <div style={{...styles.statusBadge, background: st.bg, color: st.color}}>
                        {st.icon} {order.status || 'Pending'}
                      </div>
                      
                      {/* INVOICE BUTTON */}
                      <button style={styles.invoiceBtn} onClick={() => printInvoice(order)}>
                        🧾 Bill / Invoice
                      </button>
                    </div>
                  </div>

                  {/* 🚚 VISUAL ORDER TRACKING BAR */}
                  {renderTrackingBar(order.status)}

                  {/* Order Items */}
                  <div style={styles.itemsBox}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={styles.itemRow}>
                        <div style={styles.itemInfo}>
                          <div style={styles.itemImgBox}>
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.title} style={styles.itemImg} /> : '📚'}
                          </div>
                          <div>
                            <div style={styles.itemTitle}>{item.title}</div>
                            <div style={styles.itemAuthor}>By {item.author}</div>
                          </div>
                        </div>
                        <div style={styles.itemPriceQty}>
                          <div style={styles.itemQty}>Qty: {item.qty}</div>
                          <div style={styles.itemPrice}>Rs. {item.price * item.qty}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div style={styles.orderFooter}>
                    <div style={styles.deliveryDetails}>
                      <strong>Delivery Address:</strong><br/>
                      {order.userName} ({order.userPhone})<br/>
                      {order.address?.ward}, {order.address?.city || 'Biratnagar'}
                    </div>
                    <div style={styles.totalBox}>
                      <span style={styles.totalLabel}>Total Amount (COD):</span>
                      <span style={styles.totalVal}>Rs. {order.total}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', background:'#F4F7F6', fontFamily:"'Inter', system-ui, -apple-system, sans-serif", paddingBottom: '60px' },
  
  /* Navbar */
  navbar: { background:'rgba(192, 57, 43, 0.95)', backdropFilter: 'blur(10px)', padding:'14px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  back: { background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', color:'white', fontSize:'14px', fontWeight: '500', cursor:'pointer', padding: '8px 16px', borderRadius: '30px', transition: 'all 0.2s' },
  navTitle: { color:'white', margin:0, fontSize:'18px', fontWeight: '700', letterSpacing: '0.5px' },
  
  body: { padding:'32px 24px', maxWidth:'900px', margin:'0 auto' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  
  /* Empty State */
  empty: { textAlign:'center', padding:'80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #EAEDED', borderRadius: '24px' },
  emptyIcon: { fontSize:'72px', marginBottom: '16px' },
  emptyTitle: { fontSize: '24px', fontWeight: '800', color: '#2C3E50', margin: '0 0 8px' },
  emptyDesc: { color: '#7F8C8D', marginBottom: '32px', maxWidth: '350px', lineHeight: '1.5' },
  shopBtn: { padding: '14px 32px', borderRadius: '30px', fontSize: '15px', fontWeight: '700' },
  
  ordersList: { display: 'flex', flexDirection: 'column', gap: '24px' },
  
  /* Order Card */
  orderCard: { background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #EAEDED', padding: '0' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: '#F8F9F9', borderBottom: '1px solid #EAEDED', flexWrap: 'wrap', gap: '16px' },
  orderId: { fontSize: '16px', fontWeight: '800', color: '#2C3E50', fontFamily: 'monospace' },
  orderDate: { fontSize: '13px', color: '#7F8C8D', marginTop: '4px', fontWeight: '500' },
  
  statusBadge: { padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' },
  invoiceBtn: { background: 'white', border: '1px solid #BDC3C7', color: '#34495E', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  
  /* 🚚 Order Tracking Styles */
  trackingWrapper: { position: 'relative', padding: '30px 40px', borderBottom: '1px dashed #EAEDED' },
  trackingLineBg: { position: 'absolute', top: '44px', left: '60px', right: '60px', height: '4px', background: '#EAEDED', borderRadius: '2px', zIndex: 1 },
  trackingLineActive: { height: '100%', background: '#27AE60', borderRadius: '2px', transition: 'width 0.5s ease-in-out' },
  stepsContainer: { display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 },
  stepBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '80px', textAlign: 'center' },
  stepDot: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', transition: 'all 0.3s ease' },
  stepLabel: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' },

  itemsBox: { padding: '24px' },
  itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed #EAEDED' },
  itemInfo: { display: 'flex', gap: '16px', alignItems: 'center' },
  itemImgBox: { width: '50px', height: '70px', background: '#F4F7F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemImg: { width: '100%', height: '100%', objectFit: 'cover' },
  itemTitle: { fontSize: '15px', fontWeight: '700', color: '#2C3E50', marginBottom: '4px' },
  itemAuthor: { fontSize: '13px', color: '#7F8C8D', fontWeight: '500' },
  itemPriceQty: { textAlign: 'right' },
  itemQty: { fontSize: '13px', color: '#7F8C8D', marginBottom: '4px', fontWeight: '600' },
  itemPrice: { fontSize: '16px', fontWeight: '800', color: '#2C3E50' },
  
  orderFooter: { padding: '20px 24px', background: '#F8F9F9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1px solid #EAEDED', flexWrap: 'wrap', gap: '20px' },
  deliveryDetails: { fontSize: '13px', color: '#5C6A79', lineHeight: '1.6' },
  totalBox: { textAlign: 'right' },
  totalLabel: { fontSize: '13px', color: '#7F8C8D', fontWeight: '600', display: 'block', marginBottom: '4px' },
  totalVal: { fontSize: '24px', fontWeight: '800', color: '#C0392B' }
};

export default Orders;