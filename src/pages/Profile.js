import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import '../App.css';

function Profile() {
  const [userAuth, setUserAuth] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserAuth(currentUser);
        // Firestore bata user ko data tanne
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || '' // Naya field for default address
          });
        }
      } else {
        window.location.href = '/login'; // Login xaina bhane faldine
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const docRef = doc(db, 'users', userAuth.uid);
      await updateDoc(docRef, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      });
      setMsg('✅ Profile successfully update bhayo!');
    } catch (err) {
      setMsg('❌ Update garna sakiena! Pheri try garnu.');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div className="spinner"></div>
      <p style={{marginTop:'16px', color:'#7F8C8D', fontWeight:'500'}}>Loading Profile...</p>
    </div>
  );

  return (
    <div className="page-enter" style={styles.page}>
      
      {/* Premium Glassmorphism Navbar */}
      <div style={styles.navbar}>
        <button className="back-btn-hover" style={styles.back} onClick={() => window.location.href='/'}>&larr; Back to Shop</button>
        <h2 style={styles.navTitle}>👤 My Profile</h2>
        <button className="nav-btn-hover" style={styles.logoutBtn} onClick={() => { signOut(auth); window.location.href='/login'; }}>Logout</button>
      </div>

      <div style={styles.body}>
        <div className="premium-card" style={styles.card}>
          
          <div style={styles.headerSection}>
            <div style={styles.avatar}>
              {formData.name ? formData.name.charAt(0).toUpperCase() : '👤'}
            </div>
            <div>
              <h2 style={styles.userName}>{formData.name || 'User'}</h2>
              <p style={styles.userEmail}>{userAuth?.email}</p>
            </div>
          </div>

          <div style={styles.divider}></div>

          {msg && (
            <div style={{...styles.msgBox, background: msg.includes('✅') ? '#EAFAF1' : '#FDEDEC', color: msg.includes('✅') ? '#27AE60' : '#C0392B', borderColor: msg.includes('✅') ? '#A9DFBF' : '#F5B7B1'}}>
              {msg}
            </div>
          )}

          <form onSubmit={handleUpdate} style={styles.form}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input className="premium-input" style={styles.input} type="text" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <input className="premium-input" style={styles.input} type="tel" 
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Default Delivery Address (Area / Tole)</label>
              <input className="premium-input" style={styles.input} type="text" placeholder="e.g. Traffic Chowk, Biratnagar"
                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              <p style={styles.helperText}>Yo address next time order garda aafai fill vayera aauxa.</p>
            </div>

            <button className="premium-btn-solid" style={styles.saveBtn} type="submit" disabled={saving}>
              {saving ? '⏳ Saving...' : 'Save Changes'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', background:'#F4F7F6', fontFamily:"'Inter', system-ui, -apple-system, sans-serif" },
  
  /* Navbar */
  navbar: { background:'rgba(192, 57, 43, 0.95)', backdropFilter: 'blur(10px)', padding:'14px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  back: { background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', color:'white', fontSize:'14px', fontWeight: '500', cursor:'pointer', padding: '8px 16px', borderRadius: '30px', transition: 'all 0.2s' },
  navTitle: { color:'white', margin:0, fontSize:'18px', fontWeight: '700', letterSpacing: '0.5px' },
  logoutBtn: { background:'transparent', color:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.3)', padding:'8px 18px', borderRadius:'30px', cursor:'pointer', fontSize:'14px', fontWeight: '500', transition: 'all 0.2s' },
  
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F4F7F6' },
  body: { padding:'40px 24px', maxWidth:'600px', margin:'0 auto' },
  
  card: { background:'white', borderRadius:'20px', padding:'32px', border: '1px solid #EAEDED', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' },
  
  headerSection: { display: 'flex', alignItems: 'center', gap: '20px' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #C0392B, #E74C3C)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '800', boxShadow: '0 4px 15px rgba(192, 57, 43, 0.3)' },
  userName: { margin: '0 0 4px', fontSize: '24px', color: '#2C3E50', fontWeight: '800' },
  userEmail: { margin: 0, fontSize: '14px', color: '#7F8C8D', fontWeight: '500' },
  
  divider: { height: '1px', background: '#EAEDED', margin: '24px 0' },
  
  msgBox: { padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', marginBottom: '20px', border: '1px solid transparent' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionTitle: { margin: '0 0 8px', fontSize: '18px', color: '#2C3E50', fontWeight: '700' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '700', color: '#34495E', letterSpacing: '0.3px' },
  input: { padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #EAEDED', fontSize: '15px', outline: 'none', background: '#F8F9F9', color: '#2C3E50', transition: 'all 0.2s' },
  helperText: { margin: 0, fontSize: '12px', color: '#95A5A6' },
  
  saveBtn: { width: '100%', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '800', marginTop: '12px' }
};

export default Profile;