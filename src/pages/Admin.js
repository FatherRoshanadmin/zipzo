import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const defaultForm = { title:'', author:'', price:'', category:'selfhelp', imageUrl:'', deliveryDays:'3', inStock: true };
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts();
      fetchOrders();
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      setLoginError('Username ra password duitai halnu!'); return;
    }
    try {
      const q = query(collection(db, 'admin'),
        where('username', '==', loginForm.username),
        where('password', '==', loginForm.password)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        setIsLoggedIn(true);
        setLoginError('');
      } else {
        setLoginError('❌ Username ya password galat xa!');
      }
    } catch (err) {
      setLoginError('❌ Login garna sakiena! Pheri try garnu.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
  };

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, 'product'));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchOrders = async () => {
    const snap = await getDocs(collection(db, 'orders'));
    setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    setMsg(`✅ Order status updated to "${newStatus}"!`);
    fetchOrders();
    setTimeout(() => setMsg(''), 3000);
  };

  const handleEditClick = (book) => {
    setForm({
      title: book.title || '',
      author: book.author || '',
      price: book.price || '',
      category: book.category || 'selfhelp',
      imageUrl: book.imageUrl || '',
      deliveryDays: book.deliveryDays || '3',
      inStock: book.inStock !== false
    });
    setEditId(book.id);
    setActiveTab('add');
    setMsg('✏️ Edit mode active. Update details below.');
  };

  const saveProduct = async () => {
    if (!form.title || !form.author || !form.price) {
      setMsg('❌ Title, Author, and Price are required!'); return;
    }
    setLoading(true);
    try {
      const productData = {
        title: form.title,
        author: form.author,
        price: parseFloat(form.price),
        category: form.category,
        imageUrl: form.imageUrl,
        deliveryDays: parseInt(form.deliveryDays) || 3,
        inStock: form.inStock === 'false' || form.inStock === false ? false : true
      };
      if (editId) {
        await updateDoc(doc(db, 'product', editId), productData);
        setMsg('✅ Book successfully updated!');
      } else {
        productData.createdAt = new Date();
        await addDoc(collection(db, 'product'), productData);
        setMsg('✅ New Book successfully added!');
      }
      setForm(defaultForm);
      setEditId(null);
      fetchProducts();
      setActiveTab('products');
    } catch (err) {
      setMsg('❌ Error occurred! Please try again.');
    }
    setLoading(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      await deleteDoc(doc(db, 'product', id));
      setMsg('🗑️ Book successfully deleted!');
      fetchProducts();
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const cancelEdit = () => {
    setForm(defaultForm);
    setEditId(null);
    setMsg('');
    setActiveTab('products');
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Login Page
  if (!isLoggedIn) {
    return (
      <div style={loginStyles.page}>
        <div style={loginStyles.card}>
          <h1 style={loginStyles.logo}>⚡ ZipZo</h1>
          <h2 style={loginStyles.title}>Admin Login</h2>
          <p style={loginStyles.sub}>Authorized personnel only</p>
          {loginError && <div style={loginStyles.error}>{loginError}</div>}
          <div style={loginStyles.formGroup}>
            <label style={loginStyles.label}>Username</label>
            <input style={loginStyles.input} type="text" placeholder="Username halnu"
              value={loginForm.username}
              onChange={e => setLoginForm({...loginForm, username: e.target.value})}
              onKeyPress={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div style={loginStyles.formGroup}>
            <label style={loginStyles.label}>Password</label>
            <input style={loginStyles.input} type="password" placeholder="Password halnu"
              value={loginForm.password}
              onChange={e => setLoginForm({...loginForm, password: e.target.value})}
              onKeyPress={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <button style={loginStyles.btn} onClick={handleLogin}>🔐 Login Garnu</button>
          <button style={loginStyles.backBtn} onClick={() => window.location.href='/'}>← Website ma Janu</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>⚡ ZipZo Admin</h1>
          <p style={styles.headerSub}>Store Management Dashboard</p>
        </div>
        <div style={{display:'flex', gap:'10px'}}>
          <button style={styles.backBtn} onClick={() => window.location.href='/'}>View Store →</button>
          <button style={{...styles.backBtn, background:'rgba(0,0,0,0.2)'}} onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      <div style={styles.tabContainer}>
        <div style={styles.tabs}>
          {[['dashboard','📊 Dashboard'],['products','📚 Manage Books'],['add', editId ? '✏️ Edit Book' : '➕ Add Book'],['orders','📦 Orders']].map(([tab, label]) => (
            <button key={tab} style={{...styles.tab, ...(activeTab===tab ? styles.tabActive : {})}}
              onClick={() => { setActiveTab(tab); setMsg(''); if(tab !== 'add') { setEditId(null); setForm(defaultForm); } }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.body}>
        {msg && <div style={{...styles.msgBox, background: msg.includes('❌') ? '#FDEDEC' : '#EAFAF1', color: msg.includes('❌') ? '#C0392B' : '#27AE60', borderColor: msg.includes('❌') ? '#F5B7B1' : '#A9DFBF'}}>{msg}</div>}

        {activeTab === 'dashboard' && (
          <div>
            <h2 style={styles.sectionTitle}>Overview</h2>
            <div style={styles.statsGrid}>
              <div style={{...styles.statCard, background:'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', borderTop:'4px solid #3498DB'}}>
                <div style={styles.statIcon}>📚</div>
                <div><div style={styles.statNum}>{products.length}</div><div style={styles.statLabel}>Total Books</div></div>
              </div>
              <div style={{...styles.statCard, background:'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', borderTop:'4px solid #27AE60'}}>
                <div style={styles.statIcon}>📦</div>
                <div><div style={styles.statNum}>{orders.length}</div><div style={styles.statLabel}>Total Orders</div></div>
              </div>
              <div style={{...styles.statCard, background:'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', borderTop:'4px solid #F39C12'}}>
                <div style={styles.statIcon}>💰</div>
                <div><div style={styles.statNum}>Rs. {totalRevenue}</div><div style={styles.statLabel}>Total Revenue</div></div>
              </div>
            </div>
            <h2 style={{...styles.sectionTitle, marginTop:'32px'}}>Recently Added</h2>
            <div style={styles.tableCard}>
              <div style={{...styles.tableHeader, gridTemplateColumns:'2fr 1.5fr 1fr 1fr'}}>
                <span>Title</span><span>Author</span><span>Price</span><span>Category</span>
              </div>
              {products.slice(0,5).map(p => (
                <div key={p.id} style={{...styles.tableRow, gridTemplateColumns:'2fr 1.5fr 1fr 1fr'}}>
                  <span style={styles.strongText}>{p.title}</span>
                  <span style={styles.lightText}>{p.author}</span>
                  <span style={styles.priceText}>Rs. {p.price}</span>
                  <span><span style={styles.catTag}>{p.category}</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Inventory ({products.length})</h2>
              <button style={styles.addBtn} onClick={() => setActiveTab('add')}>+ Add New Book</button>
            </div>
            <div style={styles.tableCard}>
              <div style={{...styles.tableHeader, gridTemplateColumns:'80px 2.5fr 1fr 1fr'}}>
                <span>Image</span><span>Book Details</span><span>Pricing & Stock</span><span>Actions</span>
              </div>
              {products.map(p => (
                <div key={p.id} style={{...styles.tableRow, gridTemplateColumns:'80px 2.5fr 1fr 1fr'}}>
                  <span>
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.title} style={styles.thumbImg} />
                      : <div style={styles.thumbPlaceholder}>📚</div>}
                  </span>
                  <div>
                    <div style={styles.strongText}>{p.title}</div>
                    <div style={styles.lightText}>By {p.author}</div>
                    <div style={{marginTop:'4px'}}><span style={styles.catTag}>{p.category}</span></div>
                  </div>
                  <div>
                    <div style={styles.priceText}>Rs. {p.price}</div>
                    <div style={{fontSize:'12px', marginTop:'6px', color: p.inStock === false ? '#C0392B' : '#27AE60', fontWeight:'700', background: p.inStock === false ? '#FDEDEC' : '#EAFAF1', display:'inline-block', padding:'4px 8px', borderRadius:'12px'}}>
                      {p.inStock === false ? '❌ Out of Stock' : '✅ In Stock'}
                    </div>
                  </div>
                  <div style={{display:'flex', gap:'8px'}}>
                    <button style={styles.editBtn} onClick={() => handleEditClick(p)}>✏️ Edit</button>
                    <button style={styles.deleteBtn} onClick={() => deleteProduct(p.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div style={styles.formCard}>
            <h2 style={styles.sectionTitle}>{editId ? '✏️ Edit Book Details' : '➕ Add New Book'}</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Book Title *</label>
                <input style={styles.input} placeholder="e.g. Atomic Habits"
                  value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Author *</label>
                <input style={styles.input} placeholder="e.g. James Clear"
                  value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Selling Price (Rs.) *</label>
                <input style={styles.input} type="number" placeholder="e.g. 550"
                  value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select style={styles.input} value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="selfhelp">💡 Self Help</option>
                  <option value="novel">📖 Novel</option>
                  <option value="textbook">🎓 Textbook</option>
                  <option value="children">👶 Children</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>🚚 Delivery Days</label>
                <select style={styles.input} value={form.deliveryDays}
                  onChange={e => setForm({...form, deliveryDays: e.target.value})}>
                  <option value="1">1 Day (Same Day)</option>
                  <option value="2">2 Days</option>
                  <option value="3">3 Days</option>
                  <option value="5">5 Days</option>
                  <option value="7">7 Days (1 Week)</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>📦 Stock Status</label>
                <select style={styles.input} value={form.inStock}
                  onChange={e => setForm({...form, inStock: e.target.value === 'true'})}>
                  <option value="true">✅ In Stock</option>
                  <option value="false">❌ Out of Stock</option>
                </select>
              </div>
              <div style={{...styles.formGroup, gridColumn:'1 / -1'}}>
                <label style={styles.label}>Book Cover Image URL (Optional)</label>
                <input style={styles.input}
                  placeholder="Right click image on Google → Copy image address"
                  value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
                {form.imageUrl && (
                  <div style={{marginTop:'16px', display:'flex', gap:'16px', alignItems:'center'}}>
                    <img src={form.imageUrl} alt="preview" style={styles.imagePreview} />
                    <span style={{fontSize:'12px', color:'#7F8C8D'}}>Image Preview</span>
                  </div>
                )}
              </div>
            </div>
            <div style={styles.formActions}>
              {editId && <button style={styles.cancelBtn} onClick={cancelEdit}>Cancel Edit</button>}
              <button style={styles.submitBtn} onClick={saveProduct} disabled={loading}>
                {loading ? '⏳ Saving...' : (editId ? '✅ Update Book' : '➕ Publish Book')}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 style={styles.sectionTitle}>Order Management ({orders.length})</h2>
            {orders.length === 0 ? (
              <div style={styles.empty}>
                <span style={{fontSize:'64px'}}>📭</span>
                <h3 style={{color:'#2C3E50', marginTop:'16px'}}>No orders yet</h3>
              </div>
            ) : (
              <div style={styles.tableCard}>
                <div style={{...styles.tableHeader, gridTemplateColumns:'1fr 1.5fr 1fr 1.5fr'}}>
                  <span>Order ID</span><span>Customer</span><span>Total</span><span>Status</span>
                </div>
                {orders.map(o => (
                  <div key={o.id} style={{...styles.tableRow, gridTemplateColumns:'1fr 1.5fr 1fr 1.5fr'}}>
                    <span style={{fontFamily:'monospace', fontSize:'14px', fontWeight:'800', color:'#C0392B'}}>#{o.id.slice(0,8).toUpperCase()}</span>
                    <div>
                      <div style={styles.strongText}>{o.userName || 'Guest'}</div>
                      <div style={styles.lightText}>📞 {o.userPhone}</div>
                      <div style={styles.lightText}>📍 {o.address?.ward}</div>
                    </div>
                    <span style={styles.priceText}>Rs. {o.total}</span>
                    <select
                      value={o.status || 'Pending'}
                      onChange={e => updateOrderStatus(o.id, e.target.value)}
                      style={{...styles.statusSelect,
                        background: o.status === 'Delivered' ? '#EAFAF1' : o.status === 'Out for Delivery' ? '#EBF5FB' : '#FDF2E9',
                        color: o.status === 'Delivered' ? '#27AE60' : o.status === 'Out for Delivery' ? '#2980B9' : '#D35400'
                      }}>
                      <option value="Pending">🕐 Pending</option>
                      <option value="Packed">📦 Packed</option>
                      <option value="Out for Delivery">🚚 Out for Delivery</option>
                      <option value="Delivered">✅ Delivered</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const loginStyles = {
  page: { minHeight:'100vh', background:'linear-gradient(135deg, #C0392B, #E74C3C)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif' },
  card: { background:'white', borderRadius:'16px', padding:'40px', width:'360px', boxShadow:'0 10px 40px rgba(0,0,0,0.2)' },
  logo: { textAlign:'center', color:'#C0392B', fontSize:'28px', margin:'0 0 8px' },
  title: { textAlign:'center', fontSize:'20px', fontWeight:'700', color:'#222', margin:'0 0 4px' },
  sub: { textAlign:'center', fontSize:'13px', color:'#888', marginBottom:'24px' },
  error: { background:'#FEE', color:'#C0392B', padding:'10px 14px', borderRadius:'8px', marginBottom:'16px', fontSize:'13px' },
  formGroup: { marginBottom:'14px' },
  label: { fontSize:'12px', fontWeight:'600', color:'#555', display:'block', marginBottom:'4px' },
  input: { width:'100%', padding:'11px 14px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', outline:'none', boxSizing:'border-box' },
  btn: { width:'100%', padding:'13px', background:'#C0392B', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontSize:'15px', fontWeight:'700', marginBottom:'10px' },
  backBtn: { width:'100%', padding:'10px', background:'white', color:'#888', border:'1px solid #ddd', borderRadius:'10px', cursor:'pointer', fontSize:'13px' },
};

const styles = {
  page: { minHeight:'100vh', background:'#F4F7F6', fontFamily:"'Inter', system-ui, sans-serif" },
  header: { background:'rgba(192,57,43,0.95)', padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100, boxShadow:'0 4px 20px rgba(0,0,0,0.1)' },
  headerTitle: { color:'white', fontSize:'24px', fontWeight:'800', margin:0 },
  headerSub: { color:'rgba(255,255,255,0.8)', fontSize:'13px', marginTop:'4px', textTransform:'uppercase', letterSpacing:'1px' },
  backBtn: { background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.2)', padding:'10px 20px', borderRadius:'30px', cursor:'pointer', fontSize:'13px', fontWeight:'700' },
  tabContainer: { background:'white', padding:'16px 40px', borderBottom:'1px solid #EAEDED' },
  tabs: { display:'flex', gap:'12px', overflowX:'auto' },
  tab: { padding:'10px 24px', border:'none', background:'#F8F9F9', borderRadius:'30px', cursor:'pointer', fontSize:'14px', fontWeight:'700', color:'#7F8C8D', whiteSpace:'nowrap' },
  tabActive: { background:'#FDEDEC', color:'#C0392B' },
  body: { padding:'32px 40px', maxWidth:'1200px', margin:'0 auto' },
  msgBox: { padding:'12px 20px', borderRadius:'12px', marginBottom:'24px', fontSize:'14px', fontWeight:'700', border:'1px solid transparent' },
  sectionTitle: { fontSize:'22px', fontWeight:'800', color:'#2C3E50', marginBottom:'24px' },
  sectionHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'24px' },
  statCard: { borderRadius:'20px', padding:'24px', display:'flex', alignItems:'center', gap:'20px' },
  statIcon: { fontSize:'40px', background:'white', width:'70px', height:'70px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%' },
  statNum: { fontSize:'36px', fontWeight:'800', color:'#2C3E50', marginBottom:'4px' },
  statLabel: { fontSize:'12px', color:'#7F8C8D', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px' },
  tableCard: { background:'white', borderRadius:'20px', overflow:'hidden', border:'1px solid #EAEDED' },
  tableHeader: { display:'grid', padding:'16px 24px', background:'#F8F9F9', fontWeight:'800', fontSize:'12px', color:'#95A5A6', borderBottom:'1px solid #EAEDED', textTransform:'uppercase' },
  tableRow: { display:'grid', padding:'16px 24px', borderBottom:'1px solid #F2F4F4', fontSize:'14px', alignItems:'center' },
  thumbImg: { width:'56px', height:'80px', objectFit:'cover', borderRadius:'10px' },
  thumbPlaceholder: { width:'56px', height:'80px', background:'#FDF2E9', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' },
  strongText: { fontWeight:'800', color:'#2C3E50', marginBottom:'6px', fontSize:'15px' },
  lightText: { color:'#7F8C8D', fontSize:'13px' },
  priceText: { color:'#C0392B', fontWeight:'800', fontSize:'16px' },
  catTag: { background:'#FCEBEB', color:'#C0392B', padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'800', textTransform:'uppercase' },
  editBtn: { background:'#EBF5FB', color:'#2980B9', border:'none', borderRadius:'8px', padding:'8px 14px', cursor:'pointer', fontSize:'13px', fontWeight:'700' },
  deleteBtn: { background:'#FDEDEC', color:'#C0392B', border:'none', borderRadius:'8px', padding:'8px 14px', cursor:'pointer', fontSize:'14px' },
  addBtn: { background:'#C0392B', color:'white', border:'none', padding:'12px 24px', borderRadius:'30px', cursor:'pointer', fontSize:'14px', fontWeight:'700' },
  formCard: { background:'white', borderRadius:'20px', padding:'40px', border:'1px solid #EAEDED' },
  formGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', marginBottom:'40px' },
  formGroup: { display:'flex', flexDirection:'column', gap:'8px' },
  label: { fontSize:'13px', fontWeight:'800', color:'#2C3E50', textTransform:'uppercase', letterSpacing:'0.5px' },
  input: { padding:'14px 16px', border:'1.5px solid #EAEDED', borderRadius:'12px', fontSize:'15px', outline:'none' },
  imagePreview: { width:'100px', height:'140px', objectFit:'cover', borderRadius:'10px' },
  formActions: { display:'flex', gap:'16px', justifyContent:'flex-end', borderTop:'1px solid #EAEDED', paddingTop:'32px' },
  cancelBtn: { padding:'14px 28px', background:'transparent', border:'2px solid #EAEDED', color:'#7F8C8D', borderRadius:'30px', cursor:'pointer', fontWeight:'800', fontSize:'14px' },
  submitBtn: { padding:'14px 32px', background:'#C0392B', color:'white', border:'none', borderRadius:'30px', cursor:'pointer', fontSize:'15px', fontWeight:'700' },
  empty: { textAlign:'center', padding:'100px 20px' },
  statusSelect: { padding:'10px 14px', borderRadius:'10px', border:'none', fontSize:'13px', fontWeight:'800', cursor:'pointer', width:'100%', outline:'none' },
};

export default Admin;