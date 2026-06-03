import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', res.user.uid), {
        name, 
        email, 
        phone, 
        createdAt: new Date()
      });
      window.location.href = '/';
    } catch (err) {
      setError('Registration failed! Yo email already used huna sakchha.');
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Decorative background shapes */}
      <div style={styles.bgBlob1}></div>
      <div style={styles.bgBlob2}></div>

      <div className="premium-card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>⚡</div>
          <h1 style={styles.logoText}>ZipZo</h1>
          <p style={styles.tagline}>Create an account to start shopping</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span style={{fontSize: '16px'}}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Pura Naam (Full Name)</label>
            <input 
              className="premium-input" 
              style={styles.input} 
              type="text" 
              placeholder="e.g. Roshan Mehta"
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              className="premium-input" 
              style={styles.input} 
              type="email" 
              placeholder="e.g. roshan@example.com"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            <input 
              className="premium-input" 
              style={styles.input} 
              type="tel" 
              placeholder="98XXXXXXXX"
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              required 
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input 
              className="premium-input" 
              style={styles.input} 
              type="password" 
              placeholder="Create a strong password"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength="6"
            />
            <span style={styles.helperText}>Minimum 6 characters required.</span>
          </div>

          <button className="premium-btn-solid" style={styles.btn} type="submit" disabled={isLoading}>
            {isLoading ? (
              <span style={styles.loadingWrapper}>
                <div className="spinner-small"></div> Registering...
              </span>
            ) : (
              'Create Account →'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.linkText}>
            Already have an account? <a href="/login" style={styles.loginLink}>Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    minHeight: '100vh', 
    background: '#F4F7F6', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: '40px 20px' // Added top/bottom padding for smaller screens
  },
  
  /* Background Decorative Elements */
  bgBlob1: {
    position: 'absolute',
    top: '-10%',
    left: '-5%',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(231,76,60,0.1) 0%, rgba(255,255,255,0) 70%)',
    borderRadius: '50%',
    zIndex: 0
  },
  bgBlob2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-5%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(39,174,96,0.08) 0%, rgba(255,255,255,0) 70%)',
    borderRadius: '50%',
    zIndex: 0
  },

  /* Card Styles */
  card: { 
    background: 'white', 
    padding: '40px 32px', 
    borderRadius: '20px', 
    width: '100%', 
    maxWidth: '420px', 
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    border: '1px solid rgba(255,255,255,0.8)',
    position: 'relative',
    zIndex: 1,
    boxSizing: 'border-box'
  },
  
  /* Header */
  header: { textAlign: 'center', marginBottom: '32px' },
  logoCircle: { 
    width: '56px', 
    height: '56px', 
    background: '#FDEDEC', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '28px', 
    margin: '0 auto 16px' 
  },
  logoText: { color: '#C0392B', fontSize: '28px', fontWeight: '800', margin: '0 0 8px', letterSpacing: '-0.5px' },
  tagline: { color: '#7F8C8D', fontSize: '14px', margin: 0, fontWeight: '500' },
  
  /* Error Message */
  errorBox: { 
    background: '#FDEDEC', 
    color: '#C0392B', 
    padding: '12px 16px', 
    borderRadius: '10px', 
    fontSize: '13px', 
    fontWeight: '600', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginBottom: '24px',
    border: '1px solid #F5B7B1'
  },
  
  /* Form */
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '700', color: '#2C3E50' },
  input: { 
    width: '100%', 
    padding: '14px 16px', 
    borderRadius: '12px', 
    border: '1.5px solid #EAEDED', 
    fontSize: '15px', 
    boxSizing: 'border-box',
    background: '#F8F9F9',
    color: '#2C3E50',
    transition: 'all 0.2s'
  },
  helperText: { fontSize: '11px', color: '#95A5A6', marginTop: '2px' },
  
  /* Button */
  btn: { 
    width: '100%', 
    padding: '16px', 
    background: '#C0392B', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    fontSize: '16px', 
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.3s'
  },
  loadingWrapper: { display: 'flex', alignItems: 'center', gap: '10px' },
  
  /* Footer */
  footer: { textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #EAEDED' },
  linkText: { fontSize: '14px', color: '#7F8C8D', margin: 0 },
  loginLink: { color: '#C0392B', fontWeight: '700', textDecoration: 'none', marginLeft: '4px' }
};

export default Register;