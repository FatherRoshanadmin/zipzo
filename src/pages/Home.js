import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import '../App.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(0);

  // Mobile Menu States
  const [isMobile, setIsMobile] = useState(window.innerWidth < 850);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const banners = [
    { bg:'linear-gradient(-45deg, #c0392b, #e74c3c, #f39c12, #d35400)', emoji:'📚', title:'Biratnagar ko #1 Book Store!', sub:'Same day delivery • Free delivery above Rs. 500' },
    { bg:'linear-gradient(-45deg, #1A5276, #2980b9, #1abc9c, #16a085)', emoji:'🎓', title:'School & College Books Available!', sub:'All textbooks at best price' },
    { bg:'linear-gradient(-45deg, #1E8449, #27ae60, #2ecc71, #f1c40f)', emoji:'🚚', title:'Free Delivery on Rs. 500+', sub:'Order now — deliver today!' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      const snap = await getDocs(collection(db, 'product'));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchProducts();
    const interval = setInterval(() => setBanner(b => (b + 1) % 3), 5000);
    
    const handleResize = () => setIsMobile(window.innerWidth < 850);
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const addToCart = (product, e) => {
    if (e) e.stopPropagation();
    const existing = JSON.parse(localStorage.getItem('cart') || '[]');
    const found = existing.find(i => i.id === product.id);
    let updated;
    if (found) {
      updated = existing.map(i => i.id === product.id ? {...i, qty: i.qty + 1} : i);
    } else {
      updated = [...existing, {...product, qty: 1}];
    }
    localStorage.setItem('cart', JSON.stringify(updated));
    setCart(updated);
    alert('✅ Cart ma add bhayo!');
  };

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const categories = ['all', 'selfhelp', 'novel', 'textbook', 'children'];

  const filtered = products.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
                        p.author?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="page-enter" style={styles.page}>

      {/* Glassmorphism Navbar */}
      <div className="navbar" style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.logo}>⚡ ZipZo</span>
          <span style={styles.tagline}>Biratnagar ko Online Pasal</span>
        </div>
        
        <div style={styles.navRight}>
          {isMobile ? (
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <button style={styles.mobileCartBtn} onClick={() => window.location.href='/cart'}>
                🛒 <span style={styles.cartBadgeSmall}>{cartCount}</span>
              </button>
              <button style={styles.hamburgerBtn} onClick={() => setMobileMenuOpen(true)}>☰</button>
            </div>
          ) : (
            <>
              <button className="nav-btn-hover" style={styles.cartBtn} onClick={() => window.location.href='/cart'}>
                🛒 Cart <span style={styles.cartBadge}>{cartCount}</span>
              </button>
              <button className="nav-btn-hover" style={styles.ordersBtn} onClick={() => window.location.href='/wishlist'}>❤️ Wishlist</button>
              <button className="nav-btn-hover" style={styles.ordersBtn} onClick={() => window.location.href='/orders'}>📦 Orders</button>
              <button className="nav-btn-hover" style={styles.ordersBtn} onClick={() => window.location.href='/profile'}>👤 Profile</button>
              <button className="nav-btn-hover" style={styles.logoutBtn} onClick={() => { signOut(auth); window.location.href='/login'; }}>Logout</button>
            </>
          )}
        </div>
      </div>

      {/* Modern Premium Mobile Drawer */}
      {isMobile && mobileMenuOpen && (
        <div style={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)}>
          <div className="fade-in-content" style={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={{margin:0, color:'#2C3E50', fontWeight:'800', fontSize: '22px'}}>⚡ ZipZo</h2>
                <p style={{margin:0, color:'#7F8C8D', fontSize:'11px', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', marginTop: '2px'}}>Main Menu</p>
              </div>
              <button style={styles.closeMenuBtn} onClick={() => setMobileMenuOpen(false)}>✕</button>
            </div>
            
            {/* Drawer Links */}
            <div style={styles.drawerLinks}>
              <button className="mobile-menu-item" style={styles.drawerLinkItem} onClick={() => window.location.href='/cart'}>
                <div style={{...styles.drawerIconBox, background:'#EAF2F8'}}><span style={{fontSize:'18px'}}>🛒</span></div>
                <span style={styles.drawerLinkText}>Shopping Cart</span>
                <span style={styles.drawerBadge}>{cartCount}</span>
              </button>
              
              <button className="mobile-menu-item" style={styles.drawerLinkItem} onClick={() => window.location.href='/wishlist'}>
                <div style={{...styles.drawerIconBox, background:'#FDEDEC'}}><span style={{fontSize:'18px'}}>❤️</span></div>
                <span style={styles.drawerLinkText}>My Wishlist</span>
              </button>
              
              <button className="mobile-menu-item" style={styles.drawerLinkItem} onClick={() => window.location.href='/orders'}>
                <div style={{...styles.drawerIconBox, background:'#FEF9E7'}}><span style={{fontSize:'18px'}}>📦</span></div>
                <span style={styles.drawerLinkText}>My Orders</span>
              </button>
              
              <button className="mobile-menu-item" style={styles.drawerLinkItem} onClick={() => window.location.href='/profile'}>
                <div style={{...styles.drawerIconBox, background:'#EAFAF1'}}><span style={{fontSize:'18px'}}>👤</span></div>
                <span style={styles.drawerLinkText}>Profile Settings</span>
              </button>
            </div>

            {/* Drawer Footer */}
            <div style={styles.drawerFooter}>
              <button style={styles.drawerLogoutBtn} onClick={() => { signOut(auth); window.location.href='/login'; }}>
                <span style={{fontSize:'18px'}}>🚪</span> Logout securely
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Cinematic Hero Section */}
      <div style={styles.heroContainer}>
        {banners.map((b, i) => (
          <div key={i} className="hero-animated-bg" style={{...styles.heroBgLayer, backgroundImage: b.bg, opacity: i === banner ? 1 : 0}} />
        ))}
        <div style={styles.heroOverlay}></div>

        <div className="hero-content" style={styles.heroContent}>
          <div key={banner} className="fade-in-content">
            <div style={styles.bannerDots}>
              {banners.map((_, i) => (
                <div key={i} style={{...styles.dot, background: i === banner ? 'white' : 'rgba(255,255,255,0.3)', transform: i === banner ? 'scale(1.4)' : 'scale(1)'}}
                  onClick={() => setBanner(i)} />
              ))}
            </div>
            <h1 style={styles.heroTitle}>
              <span style={{marginRight: '12px', fontSize: '1.2em', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'}}>{banners[banner].emoji}</span> 
              {banners[banner].title}
            </h1>
            <p style={styles.heroSub}>{banners[banner].sub}</p>
          </div>
          
          <div style={styles.searchBoxWrapper}>
            <div style={styles.searchBox}>
              <span style={{fontSize:'20px', color: '#666'}}>🔍</span>
              <input className="search-input" style={styles.searchInput}
                placeholder="Search books, authors..."
                value={search} 
                onChange={e => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && search.trim()) {
                    window.location.href = `/search?q=${search}`;
                  }
                }}
              />
              <button 
                onClick={() => { if(search.trim()) window.location.href = `/search?q=${search}` }}
                style={{background:'#C0392B', color:'white', border:'none', padding:'8px 20px', borderRadius:'30px', cursor:'pointer', fontWeight:'bold'}}>
                Search
              </button>
            </div>

            {search.length > 0 && (
              <div className="premium-card" style={{position:'absolute', top:'100%', left:0, right:0, background:'white', borderRadius:'16px', marginTop:'8px', overflow:'hidden', zIndex:50, textAlign:'left', border:'1px solid #EAEDED'}}>
                {filtered.slice(0, 5).map(p => (
                  <div key={p.id} 
                    style={{padding:'12px 20px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', borderBottom:'1px solid #F2F4F4'}}
                    onClick={() => window.location.href = `/book/${p.id}`}
                    onMouseOver={(e) => e.currentTarget.style.background = '#F8F9F9'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {p.imageUrl ? <img src={p.imageUrl} style={{width:'30px', height:'40px', objectFit:'cover', borderRadius:'4px'}} alt=""/> : <span>📚</span>}
                    <div>
                      <p style={{margin:0, color:'#2C3E50', fontWeight:'700', fontSize:'14px'}}>{p.title}</p>
                      <p style={{margin:0, color:'#7F8C8D', fontSize:'12px'}}>in {p.category}</p>
                    </div>
                  </div>
                ))}
                
                {filtered.length === 0 ? (
                   <div style={{padding:'16px', textAlign:'center', color:'#7F8C8D', fontSize:'14px'}}>No match found for "{search}"</div>
                ) : (
                  <div style={{padding:'12px', textAlign:'center', background:'#FDF2E9', color:'#D35400', fontWeight:'bold', cursor:'pointer'}}
                       onClick={() => window.location.href = `/search?q=${search}`}>
                    See all results for "{search}" &rarr;
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={styles.statsContainer}>
        <div style={styles.stats}>
          {[['500+','Books Collection'],['Same Day','Fast Delivery'],['COD','Payment Available'],['100%','Original Quality']].map(([val,label], idx) => (
            <div key={label} style={{...styles.statItem, borderRight: idx !== 3 && !isMobile ? '1px solid #eee' : 'none'}}>
              <strong style={styles.statVal}>{val}</strong>
              <span style={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Body */}
      <div style={styles.body}>
        
        {/* Promotion Banner */}
        <div style={styles.offerBanner}>
          <div style={styles.offerLeft}>
            <span style={styles.offerTag}>🔥 LIMITED TIME OFFER</span>
            <h3 style={styles.offerTitle}>FREE Delivery on orders above Rs. 500!</h3>
            <p style={styles.offerSub}>Order your favorite books today and get them delivered to your doorstep at zero cost.</p>
          </div>
          <div style={styles.offerRight}>
            <button className="pulse-btn" style={styles.offerBtn} onClick={() => window.location.href='/'}>
              Claim Offer &rarr;
            </button>
          </div>
        </div>

        {/* Categories Pill Menu */}
        <div style={styles.catWrapper}>
          <div style={styles.catRow}>
            {categories.map(cat => (
              <button key={cat} className="cat-btn"
                style={{...styles.catBtn, ...(category === cat ? styles.catActive : {})}}
                onClick={() => setCategory(cat)}>
                {cat === 'all' ? '📚 All Books' : cat === 'selfhelp' ? '💡 Self Help' : cat === 'novel' ? '📖 Novels' : cat === 'textbook' ? '🎓 Textbooks' : '👶 Children'}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>🔥 Featured Books</h2>
          <div style={styles.resultBadge}>{filtered.length} items found</div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div className="spinner"></div>
            <p style={{marginTop: '16px', color: '#888', fontWeight: '500'}}>Fetching books...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={{fontSize:'20px', color:'#333', margin:'0 0 8px'}}>No books found</h3>
            <p style={{fontSize:'15px', color:'#777', margin:0}}>Try searching for a different title or author.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((p, index) => (
              <div key={p.id} className="premium-card" style={{...styles.card, animationDelay: `${index * 0.05}s`}}
                onClick={() => window.location.href=`/book/${p.id}`}>
                
                <div style={styles.imgBox}>
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.title} style={styles.cardImg} loading="lazy" />
                    : <span style={{fontSize:'56px'}}>📚</span>
                  }
                  <div style={styles.deliveryTag}>⚡ Same Day</div>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{p.title}</h3>
                    <p style={styles.cardAuthor}>{p.author}</p>
                  </div>
                  
                  <div style={styles.priceRow}>
                    <span style={styles.price}>Rs. {p.price}</span>
                    <span style={styles.codTag}>COD Available</span>
                  </div>
                  
                  {p.deliveryDays && (
                    <div style={styles.deliveryInfo}>
                      <span style={{fontSize: '14px'}}>🚚</span> 
                      <span>By {new Date(Date.now() + p.deliveryDays * 86400000).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>
                    </div>
                  )}

                  <div style={styles.btnGroup}>
                    <button className="card-btn-outline" style={styles.addToCartBtn}
                      onClick={(e) => { e.stopPropagation(); addToCart(p, e); }}>
                      🛒 Add
                    </button>
                    <button className="card-btn-solid" style={styles.buyNowBtn}
                      onClick={(e) => { e.stopPropagation(); addToCart(p, e); window.location.href='/cart'; }}>
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div style={styles.footerBrand}>
            <h3 style={styles.footerLogo}>⚡ ZipZo</h3>
            <p style={styles.footerDesc}>Biratnagar's premier destination for books. Fast delivery, genuine products, and trusted service.</p>
          </div>
          <div>
            <h4 style={styles.footerHeading}>Quick Links</h4>
            <ul style={styles.footerList}>
              <li className="footer-link-hover" style={styles.footerLink} onClick={() => window.location.href='/'}>Home</li>
              <li className="footer-link-hover" style={styles.footerLink} onClick={() => window.location.href='/orders'}>Track Orders</li>
              <li className="footer-link-hover" style={styles.footerLink} onClick={() => window.location.href='/cart'}>Shopping Cart</li>
            </ul>
          </div>
          <div>
            <h4 style={styles.footerHeading}>Get in Touch</h4>
            <ul style={styles.footerList}>
              <li style={styles.footerContact}>📞 +977 98XXXXXXXX</li>
              <li style={styles.footerContact}>📍 Traffic Chowk, Biratnagar</li>
              <li style={styles.footerContact}>⏰ Sun - Fri, 9:00 AM - 8:00 PM</li>
            </ul>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>© {new Date().getFullYear()} ZipZo. Crafted with passion in Nepal.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', background:'#F4F7F6', fontFamily:"'Inter', system-ui, -apple-system, sans-serif" },
  
  /* Navbar */
  navbar: { background:'rgba(192, 57, 43, 0.95)', backdropFilter: 'blur(10px)', padding:'14px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100, borderBottom: '1px solid rgba(255,255,255,0.1)' },
  navLeft: { display:'flex', alignItems:'baseline', gap:'12px' },
  logo: { color:'white', fontSize:'24px', fontWeight:'800', letterSpacing: '-0.5px' },
  tagline: { color:'rgba(255,255,255,0.7)', fontSize:'13px', fontWeight: '500', display: window.innerWidth < 600 ? 'none' : 'inline' },
  navRight: { display:'flex', gap:'12px', alignItems:'center' },
  
  /* Desktop Buttons */
  cartBtn: { background:'white', color:'#C0392B', border:'none', padding:'8px 18px', borderRadius:'30px', cursor:'pointer', fontWeight:'700', fontSize:'14px', display:'flex', alignItems:'center', gap:'8px', transition: 'all 0.2s' },
  cartBadge: { background:'#C0392B', color:'white', borderRadius:'50%', width:'22px', height:'22px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight: 'bold' },
  ordersBtn: { background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.1)', padding:'8px 18px', borderRadius:'30px', cursor:'pointer', fontSize:'14px', fontWeight: '500', transition: 'all 0.2s' },
  logoutBtn: { background:'transparent', color:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.3)', padding:'8px 18px', borderRadius:'30px', cursor:'pointer', fontSize:'14px', fontWeight: '500', transition: 'all 0.2s' },
  
  /* Mobile Buttons */
  hamburgerBtn: { background: 'transparent', color: 'white', border: 'none', fontSize: '28px', cursor: 'pointer', padding: '0 8px' },
  mobileCartBtn: { background: 'transparent', color: 'white', border: 'none', fontSize: '24px', cursor: 'pointer', position: 'relative' },
  cartBadgeSmall: { position: 'absolute', top: '-5px', right: '-10px', background: 'white', color: '#C0392B', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', border: '2px solid #C0392B' },
  
  /* Premium Mobile Drawer Menu */
  mobileOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, backdropFilter: 'blur(5px)' },
  mobileDrawer: { position: 'fixed', top: 0, right: 0, bottom: 0, width: '300px', background: '#F4F7F6', zIndex: 1001, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 40px rgba(0,0,0,0.2)' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: 'white', borderBottom: '1px solid #EAEDED' },
  closeMenuBtn: { background: '#F8F9F9', border: '1px solid #EAEDED', width: '36px', height: '36px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', color: '#7F8C8D', fontWeight: 'bold', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  
  drawerLinks: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px' },
  drawerLinkItem: { background: 'white', border: '1px solid #EAEDED', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  drawerIconBox: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' },
  drawerLinkText: { fontSize: '15px', fontWeight: '700', color: '#2C3E50', flex: 1, textAlign: 'left' },
  drawerBadge: { background: '#C0392B', color: 'white', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', fontWeight: '800' },
  
  drawerFooter: { marginTop: 'auto', padding: '24px', background: 'white', borderTop: '1px solid #EAEDED' },
  drawerLogoutBtn: { width: '100%', background: '#FDEDEC', color: '#C0392B', border: '1px solid #F5B7B1', borderRadius: '14px', padding: '14px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' },
  
  /* Hero Section */
  heroContainer: { position: 'relative', minHeight:'380px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding:'80px 24px', overflow: 'hidden' },
  heroBgLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 1 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.35))', zIndex: 2 },
  heroContent: { position: 'relative', zIndex: 3, maxWidth:'800px', width: '100%', margin:'0 auto', textAlign: 'center', color: 'white' },
  bannerDots: { display:'flex', gap:'8px', marginBottom:'24px', justifyContent:'center' },
  dot: { width:'10px', height:'10px', borderRadius:'50%', cursor:'pointer', transition:'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' },
  heroTitle: { fontSize:'46px', fontWeight:'800', marginBottom:'16px', lineHeight:'1.2', letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' },
  heroSub: { fontSize:'18px', opacity:0.95, marginBottom:'36px', fontWeight: '500', textShadow: '0 1px 4px rgba(0,0,0,0.2)' },
  searchBoxWrapper: { maxWidth: '600px', margin: '0 auto', position: 'relative' },
  searchBox: { background:'white', borderRadius:'40px', padding:'12px 24px', display:'flex', alignItems:'center', gap:'12px', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', transition: 'box-shadow 0.3s ease' },
  searchInput: { border:'none', outline:'none', fontSize:'16px', flex:1, color:'#333', background: 'transparent', padding: '4px 0' },
  
  statsContainer: { maxWidth: '1000px', margin: '-40px auto 30px', position: 'relative', zIndex: 20, padding: '0 16px' },
  stats: { background:'white', display:'flex', justifyContent:'space-between', padding:'24px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', flexWrap: 'wrap', gap: '16px' },
  statItem: { flex: 1, minWidth: '120px', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' },
  statVal: { fontSize: '24px', fontWeight: '800', color: '#2C3E50' },
  statLabel: { fontSize: '13px', color: '#7F8C8D', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' },
  
  body: { maxWidth:'1200px', margin:'0 auto', padding:'0 24px 60px' },
  offerBanner: { background:'linear-gradient(135deg, #F39C12, #D35400)', borderRadius:'16px', padding:'32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'20px', marginBottom: '40px', boxShadow: '0 8px 24px rgba(211, 84, 0, 0.2)' },
  offerLeft: { color:'white', flex: 1, minWidth: '300px' },
  offerTag: { background:'rgba(255,255,255,0.2)', padding:'6px 14px', borderRadius:'30px', fontSize:'12px', fontWeight:'700', letterSpacing: '1px', backdropFilter: 'blur(4px)' },
  offerTitle: { fontSize:'24px', fontWeight:'800', margin:'16px 0 8px', lineHeight: '1.3' },
  offerSub: { fontSize:'15px', opacity:0.9, margin: 0, lineHeight: '1.6' },
  offerBtn: { background:'white', color:'#D35400', border:'none', padding:'14px 28px', borderRadius:'30px', cursor:'pointer', fontWeight:'800', fontSize:'15px', transition: 'all 0.3s ease' },
  
  catWrapper: { overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px', msOverflowStyle: 'none', scrollbarWidth: 'none' },
  catRow: { display:'flex', gap:'12px', minWidth: 'max-content' },
  catBtn: { padding:'10px 20px', borderRadius:'30px', border:'1px solid #E0E6ED', background:'white', cursor:'pointer', fontSize:'14px', fontWeight: '600', color:'#5C6A79', transition: 'all 0.2s ease' },
  catActive: { background:'#C0392B', color:'white', border:'1px solid #C0392B', boxShadow: '0 4px 12px rgba(192, 57, 43, 0.2)' },
  
  sectionHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'24px', paddingBottom: '12px', borderBottom: '2px solid #EAEDED' },
  sectionTitle: { fontSize:'24px', fontWeight:'800', color:'#2C3E50', margin: 0 },
  resultBadge: { fontSize:'13px', color:'#7F8C8D', background: '#EAEDED', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'24px' },
  
  card: { background:'white', borderRadius:'16px', overflow:'hidden', cursor:'pointer', display: 'flex', flexDirection: 'column', height: '100%' },
  imgBox: { background:'#F8F9F9', height:'220px', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' },
  cardImg: { width:'100%', height:'100%', objectFit:'cover', transition: 'transform 0.5s ease' },
  deliveryTag: { position:'absolute', top:'12px', left:'12px', background:'rgba(39, 174, 96, 0.9)', color:'white', fontSize:'11px', fontWeight: '700', padding:'6px 12px', borderRadius:'20px', backdropFilter: 'blur(4px)' },
  cardBody: { padding:'20px', display: 'flex', flexDirection: 'column', flex: 1 },
  cardHeader: { flex: 1 },
  cardTitle: { fontSize:'16px', fontWeight:'700', color:'#2C3E50', margin:'0 0 6px', lineHeight:'1.4' },
  cardAuthor: { fontSize:'13px', color:'#7F8C8D', margin:'0 0 16px', fontWeight: '500' },
  priceRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', padding: '12px 0', borderTop: '1px solid #F2F4F4', borderBottom: '1px solid #F2F4F4' },
  price: { fontSize:'18px', fontWeight:'800', color:'#C0392B' },
  codTag: { fontSize:'12px', color:'#27AE60', fontWeight:'700', background: '#EAFAF1', padding: '4px 8px', borderRadius: '6px' },
  deliveryInfo: { display: 'flex', alignItems: 'center', gap: '6px', fontSize:'13px', color:'#5C6A79', fontWeight: '500', marginBottom: '16px' },
  btnGroup: { display:'grid', gridTemplateColumns: '1fr 1fr', gap:'8px', mt: 'auto' },
  addToCartBtn: { padding:'10px', background:'transparent', color:'#C0392B', border:'2px solid #C0392B', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:'700' },
  buyNowBtn: { padding:'10px', background:'#C0392B', color:'white', border:'2px solid #C0392B', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:'700' },
  
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' },
  empty: { textAlign:'center', padding:'80px 20px', background: 'white', borderRadius: '16px', border: '1px dashed #D5DBDB' },
  emptyIcon: { fontSize:'64px', marginBottom: '16px', opacity: 0.5 },
  
  footer: { background:'#1C2833', color:'#EAF2F8', padding:'60px 40px 0', marginTop:'auto' },
  footerGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'40px', maxWidth:'1200px', margin:'0 auto', paddingBottom:'40px' },
  footerBrand: { paddingRight: '20px' },
  footerLogo: { color:'white', fontSize:'28px', fontWeight: '800', marginBottom:'16px', letterSpacing: '-1px' },
  footerDesc: { fontSize:'14px', lineHeight:'1.8', color:'#ABB2B9' },
  footerHeading: { color:'white', fontSize:'16px', fontWeight: '700', marginBottom:'20px', textTransform: 'uppercase', letterSpacing: '1px' },
  footerList: { listStyle: 'none', padding: 0, margin: 0 },
  footerLink: { fontSize:'14px', color:'#ABB2B9', cursor:'pointer', marginBottom:'12px', transition: 'color 0.2s' },
  footerContact: { fontSize:'14px', color:'#ABB2B9', marginBottom:'12px', display: 'flex', alignItems: 'center', gap: '8px' },
  footerBottom: { borderTop:'1px solid rgba(255,255,255,0.1)', padding:'24px 0', textAlign:'center', fontSize:'13px', color:'#808B96' },
};

export default Home;