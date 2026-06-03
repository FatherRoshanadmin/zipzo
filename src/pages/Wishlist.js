import React, { useState, useEffect } from 'react';
import '../App.css';

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    // LocalStorage bata wishlist ko data tanne
    setWishlist(JSON.parse(localStorage.getItem('wishlist') || '[]'));
  }, []);

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter(item => item.id !== id);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const moveToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const found = existingCart.find(i => i.id === product.id);
    let updatedCart;
    
    if (found) {
      updatedCart = existingCart.map(i => i.id === product.id ? {...i, qty: i.qty + 1} : i);
    } else {
      updatedCart = [...existingCart, {...product, qty: 1}];
    }
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    removeFromWishlist(product.id); // Cart ma halepachi wishlist bata hataune
    alert('✅ Book moved to Cart!');
  };

  return (
    <div className="page-enter" style={styles.page}>
      
      {/* Premium Glassmorphism Navbar */}
      <div style={styles.navbar}>
        <button className="back-btn-hover" style={styles.back} onClick={() => window.location.href='/'}>&larr; Back to Shop</button>
        <h2 style={styles.navTitle}>❤️ My Wishlist</h2>
        <div style={{width: '100px'}} /> {/* Spacer for centering */}
      </div>

      <div style={styles.body}>
        {wishlist.length === 0 ? (
          <div className="premium-card" style={styles.empty}>
            <div style={styles.emptyIcon}>🤍</div>
            <h3 style={styles.emptyTitle}>Your Wishlist is Empty</h3>
            <p style={styles.emptyDesc}>Save books you love here and buy them whenever you are ready.</p>
            <button className="premium-btn-solid" style={styles.shopBtn} onClick={() => window.location.href='/'}>
              Explore Books
            </button>
          </div>
        ) : (
          <div>
            <p style={styles.itemCount}>You have {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved.</p>
            <div style={styles.grid}>
              {wishlist.map((p, index) => (
                <div key={p.id} className="premium-card" style={{...styles.card, animationDelay: `${index * 0.05}s`}}>
                  
                  <button className="delete-btn-hover" style={styles.removeBtn} onClick={() => removeFromWishlist(p.id)} title="Remove from wishlist">
                    ✕
                  </button>

                  <div style={styles.imgBox} onClick={() => window.location.href=`/book/${p.id}`}>
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.title} style={styles.cardImg} loading="lazy" />
                      : <span style={{fontSize:'56px'}}>📚</span>
                    }
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>{p.title}</h3>
                      <p style={styles.cardAuthor}>{p.author}</p>
                    </div>
                    
                    <div style={styles.priceRow}>
                      <span style={styles.price}>Rs. {p.price}</span>
                    </div>

                    <button className="premium-btn-solid" style={styles.addToCartBtn} onClick={() => moveToCart(p)}>
                      🛒 Move to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
  
  body: { padding:'32px 24px', maxWidth:'1200px', margin:'0 auto' },
  
  /* Empty State */
  empty: { textAlign:'center', padding:'80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px dashed #D5DBDB' },
  emptyIcon: { fontSize:'72px', marginBottom: '16px', opacity: 0.8 },
  emptyTitle: { fontSize: '24px', fontWeight: '800', color: '#2C3E50', margin: '0 0 8px' },
  emptyDesc: { color: '#7F8C8D', marginBottom: '32px', maxWidth: '300px', lineHeight: '1.5' },
  shopBtn: { padding: '14px 32px', borderRadius: '30px', fontSize: '15px', fontWeight: '700' },
  
  itemCount: { fontSize: '15px', color: '#7F8C8D', fontWeight: '600', marginBottom: '20px' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'24px' },
  
  /* Premium Cards */
  card: { background:'white', borderRadius:'16px', overflow:'hidden', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #EAEDED' },
  removeBtn: { position: 'absolute', top: '12px', right: '12px', zIndex: 10, background: 'rgba(255,255,255,0.9)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#C0392B', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'all 0.2s' },
  
  imgBox: { background:'#F8F9F9', height:'220px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', cursor: 'pointer' },
  cardImg: { width:'100%', height:'100%', objectFit:'cover', transition: 'transform 0.5s ease' },
  
  cardBody: { padding:'20px', display: 'flex', flexDirection: 'column', flex: 1 },
  cardHeader: { flex: 1 },
  cardTitle: { fontSize:'16px', fontWeight:'700', color:'#2C3E50', margin:'0 0 6px', lineHeight:'1.4' },
  cardAuthor: { fontSize:'13px', color:'#7F8C8D', margin:'0 0 16px', fontWeight: '500' },
  
  priceRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', padding: '12px 0', borderTop: '1px solid #F2F4F4', borderBottom: '1px solid #F2F4F4' },
  price: { fontSize:'18px', fontWeight:'800', color:'#C0392B' },
  
  addToCartBtn: { padding:'12px', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:'700', width: '100%' },
};

export default Wishlist;