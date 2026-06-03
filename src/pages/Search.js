import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function Search() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // URL bata search query line (?q=atomic)
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('q') || '';

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'under500', '500to1000', 'over1000'
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const snap = await getDocs(collection(db, 'product'));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchProducts();
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
    alert('✅ Cart ma add bhayo!');
  };

  // Filter Logic
  let filtered = products.filter(p => {
    // 1. Search Query Match
    const matchSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.author?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Category Match
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    
    // 3. Price Match
    let matchPrice = true;
    if (priceFilter === 'under500') matchPrice = p.price < 500;
    if (priceFilter === '500to1000') matchPrice = p.price >= 500 && p.price <= 1000;
    if (priceFilter === 'over1000') matchPrice = p.price > 1000;

    // 4. Stock Match
    const matchStock = inStockOnly ? p.inStock !== false : true;

    return matchSearch && matchCat && matchPrice && matchStock;
  });

  // Fallback Logic (Yedi result zero aayo bhane aru random books dekhaune)
  const isFallback = filtered.length === 0 && !loading;
  if (isFallback) {
    filtered = products.slice(0, 4); // Show top 4 books as recommendation
  }

  return (
    <div className="page-enter" style={styles.page}>
      
      {/* Navbar */}
      <div style={styles.navbar}>
        <button className="back-btn-hover" style={styles.back} onClick={() => window.location.href='/'}>&larr; Home</button>
        <div style={styles.searchNavBox}>
            <input 
              style={styles.navSearchInput} 
              defaultValue={searchQuery}
              onKeyDown={(e) => {
                  if(e.key === 'Enter') window.location.href = `/search?q=${e.target.value}`;
              }}
              placeholder="Search books..."
            />
        </div>
        <button className="nav-btn-hover" style={styles.cartBtn} onClick={() => window.location.href='/cart'}>🛒 Cart</button>
      </div>

      <div style={styles.container}>
        {/* Left Sidebar Filters */}
        <div style={styles.sidebar}>
          <div className="premium-card" style={styles.filterCard}>
            <h3 style={styles.filterTitle}>⚙️ Filters</h3>
            
            {/* Category Filter */}
            <div style={styles.filterGroup}>
              <h4 style={styles.filterSub}>Category</h4>
              {['all', 'selfhelp', 'novel', 'textbook', 'children'].map(cat => (
                <label key={cat} style={styles.radioLabel}>
                  <input type="radio" name="cat" checked={categoryFilter === cat} onChange={() => setCategoryFilter(cat)} />
                  {cat === 'all' ? 'All Books' : cat === 'selfhelp' ? 'Self Help' : cat === 'novel' ? 'Novels' : cat === 'textbook' ? 'Textbooks' : 'Children'}
                </label>
              ))}
            </div>

            <div style={styles.divider}></div>

            {/* Price Filter */}
            <div style={styles.filterGroup}>
              <h4 style={styles.filterSub}>Price Range</h4>
              <label style={styles.radioLabel}><input type="radio" name="price" checked={priceFilter==='all'} onChange={()=>setPriceFilter('all')} /> All Prices</label>
              <label style={styles.radioLabel}><input type="radio" name="price" checked={priceFilter==='under500'} onChange={()=>setPriceFilter('under500')} /> Under Rs. 500</label>
              <label style={styles.radioLabel}><input type="radio" name="price" checked={priceFilter==='500to1000'} onChange={()=>setPriceFilter('500to1000')} /> Rs. 500 - Rs. 1000</label>
              <label style={styles.radioLabel}><input type="radio" name="price" checked={priceFilter==='over1000'} onChange={()=>setPriceFilter('over1000')} /> Over Rs. 1000</label>
            </div>

            <div style={styles.divider}></div>

            {/* Stock Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" checked={inStockOnly} onChange={(e)=>setInStockOnly(e.target.checked)} />
                Exclude Out of Stock
              </label>
            </div>
            
            <button style={styles.clearBtn} onClick={() => { setCategoryFilter('all'); setPriceFilter('all'); setInStockOnly(false); window.location.href='/search'; }}>
              Clear Filters
            </button>
          </div>
        </div>

        {/* Main Search Results Area */}
        <div style={styles.mainContent}>
          <div style={styles.resultsHeader}>
            <h2 style={styles.resultsTitle}>
              {searchQuery ? `Results for "${searchQuery}"` : 'All Books'}
            </h2>
            <span style={styles.countBadge}>{isFallback ? '0' : filtered.length} found</span>
          </div>

          {loading ? (
            <div style={{textAlign:'center', padding:'40px'}}><div className="spinner"></div></div>
          ) : (
            <div style={styles.listGrid}>
              
              {/* Fallback Message */}
              {isFallback && (
                <div style={styles.fallbackBox}>
                  <h3>Oops! We couldn't find exactly what you were looking for. 📭</h3>
                  <p>But don't worry, here are some top recommendations for you:</p>
                </div>
              )}

              {/* Line by Line (Row) Product Display */}
              {filtered.map(p => (
                <div key={p.id} className="premium-card" style={styles.rowCard} onClick={() => window.location.href=`/book/${p.id}`}>
                  <div style={styles.rowImgBox}>
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.title} style={styles.rowImg} /> : <span style={{fontSize:'40px'}}>📚</span>}
                  </div>
                  
                  <div style={styles.rowInfo}>
                    <div style={styles.rowHeader}>
                      <div>
                        <h3 style={styles.rowTitle}>{p.title}</h3>
                        <p style={styles.rowAuthor}>By {p.author}</p>
                      </div>
                      <div style={styles.rowPriceBox}>
                        <span style={styles.rowPrice}>Rs. {p.price}</span>
                        {p.deliveryDays && <span style={styles.rowDelivery}>🚚 By {new Date(Date.now() + p.deliveryDays * 86400000).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>}
                      </div>
                    </div>
                    
                    <div style={styles.rowFooter}>
                      <span style={{...styles.stockTag, background: p.inStock === false ? '#FDEDEC' : '#EAFAF1', color: p.inStock === false ? '#E74C3C' : '#27AE60'}}>
                        {p.inStock === false ? 'Out of Stock' : 'In Stock'}
                      </span>
                      <button className="premium-btn-solid" style={styles.rowBtn} onClick={(e) => addToCart(p, e)}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', background:'#F4F7F6', fontFamily:"'Inter', system-ui, sans-serif" },
  navbar: { background:'rgba(192, 57, 43, 0.95)', backdropFilter: 'blur(10px)', padding:'12px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100 },
  back: { background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', color:'white', fontSize:'14px', cursor:'pointer', padding: '8px 16px', borderRadius: '30px' },
  cartBtn: { background:'white', color:'#C0392B', border:'none', padding:'8px 18px', borderRadius:'30px', cursor:'pointer', fontWeight:'700', fontSize:'14px' },
  searchNavBox: { flex:0.6, background:'white', borderRadius:'30px', padding:'8px 20px', display:'flex' },
  navSearchInput: { border:'none', outline:'none', width:'100%', fontSize:'15px' },
  
  container: { display: 'flex', gap: '24px', padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', alignItems: 'flex-start' },
  
  /* Sidebar */
  sidebar: { width: '260px', flexShrink: 0, position: 'sticky', top: '100px' },
  filterCard: { background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #EAEDED' },
  filterTitle: { margin: '0 0 20px', fontSize: '18px', color: '#2C3E50', fontWeight: '800' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  filterSub: { margin: '0 0 4px', fontSize: '14px', color: '#7F8C8D', textTransform: 'uppercase' },
  radioLabel: { fontSize: '14px', color: '#2C3E50', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  checkboxLabel: { fontSize: '14px', color: '#2C3E50', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' },
  divider: { height: '1px', background: '#EAEDED', margin: '20px 0' },
  clearBtn: { width: '100%', padding: '10px', background: 'transparent', border: '1px solid #BDC3C7', borderRadius: '8px', color: '#7F8C8D', cursor: 'pointer', marginTop: '16px', fontWeight: '600' },

  /* Main Content */
  mainContent: { flex: 1 },
  resultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '16px 24px', borderRadius: '12px', border: '1px solid #EAEDED' },
  resultsTitle: { margin: 0, fontSize: '20px', color: '#2C3E50', fontWeight: '800' },
  countBadge: { background: '#EAEDED', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', color: '#7F8C8D' },
  
  fallbackBox: { background: '#FEF9E7', border: '1px dashed #F39C12', padding: '20px', borderRadius: '12px', marginBottom: '20px', color: '#D35400' },
  
  listGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  
  /* Row Card (Amazon style) */
  rowCard: { background: 'white', borderRadius: '16px', border: '1px solid #EAEDED', display: 'flex', gap: '20px', padding: '16px', cursor: 'pointer' },
  rowImgBox: { width: '120px', height: '160px', background: '#F8F9F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  rowImg: { width: '100%', height: '100%', objectFit: 'cover' },
  rowInfo: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  rowHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  rowTitle: { margin: '0 0 6px', fontSize: '18px', color: '#2C3E50', fontWeight: '800' },
  rowAuthor: { margin: 0, fontSize: '14px', color: '#7F8C8D' },
  rowPriceBox: { textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  rowPrice: { fontSize: '22px', fontWeight: '800', color: '#C0392B' },
  rowDelivery: { fontSize: '11px', color: '#27AE60', background: '#EAFAF1', padding: '2px 8px', borderRadius: '10px', marginTop: '4px' },
  rowFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F2F4F4' },
  stockTag: { fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' },
  rowBtn: { padding: '10px 24px', borderRadius: '30px', fontSize: '14px' }
};

export default Search;