import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, getDocs, addDoc, query, where } from 'firebase/firestore';

function BookDetail() {
  // 1. Sabai bhanda paila bookId nikalne (Mathi sariyeko)
  const bookId = window.location.pathname.split('/').pop();

  // 2. States haru
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [added, setAdded] = useState(false);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name:'', rating:5, comment:'' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // 3. Wishlist check garne useEffect
  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (existing.find(i => i.id === bookId)) {
      setInWishlist(true);
    }
  }, [bookId]);

  // 4. Book ra Reviews tanne useEffect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchBook();
    fetchReviews();
  }, [bookId]);

  const toggleWishlist = () => {
    // 🔒 LOGIN CHECK
    if (!auth.currentUser) {
      alert("Please Login to save items to your Wishlist.");
      window.location.href = '/login';
      return;
    }

    let existing = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (inWishlist) {
      existing = existing.filter(i => i.id !== book.id);
      setInWishlist(false);
    } else {
      existing.push(book);
      setInWishlist(true);
    }
    localStorage.setItem('wishlist', JSON.stringify(existing));
  };

  const fetchBook = async () => {
    const snap = await getDoc(doc(db, 'product', bookId));
    if (snap.exists()) {
      const bookData = { id: snap.id, ...snap.data() };
      setBook(bookData);
      fetchSimilarBooks(bookData.category, snap.id);
    }
    setLoading(false);
  };

  const fetchSimilarBooks = async (category, currentId) => {
    const snap = await getDocs(collection(db, 'product'));
    const similar = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(b => b.category === category && b.id !== currentId)
      .slice(0, 4);
    setSimilarBooks(similar);
  };

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), where('bookId', '==', bookId));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setReviews([]);
    }
  };

  const submitReview = async () => {
    if (!reviewForm.name || !reviewForm.comment) {
      alert('Pura naam ra comment lekhnu hola!'); return;
    }
    await addDoc(collection(db, 'reviews'), {
      bookId,
      name: reviewForm.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      createdAt: new Date()
    });
    setReviewSubmitted(true);
    setReviewForm({ name:'', rating:5, comment:'' });
    fetchReviews();
  };

  const addToCart = (bookItem, qty = 1) => {
    // 🔒 LOGIN CHECK
    if (!auth.currentUser) {
      alert("Please Login or Register to buy this book.");
      window.location.href = '/login';
      return;
    }

    const existing = JSON.parse(localStorage.getItem('cart') || '[]');
    const found = existing.find(i => i.id === bookItem.id);
    let updated;
    if (found) {
      updated = existing.map(i => i.id === bookItem.id ? {...i, qty: i.qty + qty} : i);
    } else {
      updated = [...existing, {...bookItem, qty}];
    }
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const renderStars = (rating) => '⭐'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div className="spinner"></div>
      <p style={{marginTop: '16px', color: '#7F8C8D', fontWeight: '500'}}>Loading book details...</p>
    </div>
  );

  if (!book) return (
    <div style={styles.emptyContainer}>
      <div style={styles.emptyIcon}>📭</div>
      <h2 style={styles.emptyTitle}>Book Not Found</h2>
      <p style={styles.emptyDesc}>We couldn't find the book you are looking for.</p>
      <button className="premium-btn-solid" onClick={() => window.location.href='/'} style={{padding: '12px 24px'}}>
        &larr; Back to Home
      </button>
    </div>
  );

  return (
    <div className="page-enter" style={styles.page}>
      
      {/* Premium Glassmorphism Navbar */}
      <div style={styles.navbar}>
        <button className="back-btn-hover" style={styles.back} onClick={() => window.location.href='/'}>&larr; Back</button>
        <h2 style={styles.navTitle}>📚 Book Details</h2>
        <button className="nav-btn-hover" style={styles.cartBtn} onClick={() => window.location.href='/cart'}>
          🛒 Cart
        </button>
      </div>

      <div style={styles.body}>
        
        {/* Main Product Card */}
        <div className="premium-card" style={styles.mainCard}>
          
          {/* Left: Image Showcase */}
          <div style={styles.imgSection}>
            <div style={styles.imgShowcase}>
              {book.imageUrl
                ? <img src={book.imageUrl} alt={book.title} style={styles.bookImg} />
                : <div style={styles.imgPlaceholder}><span style={{fontSize:'80px'}}>📚</span></div>
              }
            </div>
            
            {/* Badges under image */}
            <div style={styles.badgesWrapper}>
              <div style={{...styles.pillBadge, background: '#EAF2F8', color: '#2980B9'}}>
                {book.deliveryDays ? `🚚 ${book.deliveryDays} Days Delivery` : '⚡ Same Day Delivery'}
              </div>
              <div style={{...styles.pillBadge, background: '#FEF9E7', color: '#D4AC0D'}}>💵 Cash on Delivery</div>
              <div style={{...styles.pillBadge, background: book.inStock === false ? '#FDEDEC' : '#EAFAF1', color: book.inStock === false ? '#E74C3C' : '#27AE60'}}>
                {book.inStock === false ? '❌ Out of Stock' : '✅ In Stock'}
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div style={styles.infoSection}>
            <div style={styles.catTag}>{book.category}</div>
            <h1 style={styles.title}>{book.title}</h1>
            <p style={styles.author}>✍️ {book.author}</p>

            {/* Rating */}
            {avgRating && (
              <div style={styles.ratingRow}>
                <span style={styles.ratingNum}>{avgRating}</span>
                <span style={styles.ratingStars}>{renderStars(avgRating)}</span>
                <span style={styles.ratingCount}>({reviews.length} reviews)</span>
              </div>
            )}

            <div style={styles.priceDivider}></div>

            <div style={styles.priceBox}>
              <span style={styles.price}>Rs. {book.price}</span>
              <span style={styles.originalPrice}>Rs. {Math.round(book.price * 1.2)}</span>
              <span style={styles.discount}>20% OFF</span>
            </div>

            <div style={styles.features}>
              <div style={styles.featureItem}><span style={styles.featureIcon}>🚚</span> <span>{book.deliveryDays ? `Delivery by: ${new Date(Date.now() + book.deliveryDays * 86400000).toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'})}` : 'Same Day Delivery within Biratnagar'}</span></div>
              <div style={styles.featureItem}><span style={styles.featureIcon}>🛡️</span> <span>100% Original book guaranteed</span></div>
              <div style={styles.featureItem}><span style={styles.featureIcon}>↩️</span> <span>Easy 7-days return policy</span></div>
            </div>

            {/* Action Area */}
            {book.inStock === false ? (
              <div style={styles.outOfStockMsg}>⚠️ Currently Out of Stock</div>
            ) : (
              <div style={styles.actionArea}>
                <div style={styles.qtyBox}>
                  <span style={styles.qtyLabel}>Qty</span>
                  <div style={styles.qtyControls}>
                    <button style={styles.qtyBtn} onClick={() => setQty(Math.max(1, qty-1))}>−</button>
                    <span style={styles.qtyNum}>{qty}</span>
                    <button style={styles.qtyBtn} onClick={() => setQty(qty+1)}>+</button>
                  </div>
                </div>
                <div style={{marginBottom: '16px'}}>
                  <button 
                    onClick={toggleWishlist} 
                    style={{
                      background: inWishlist ? '#FDEDEC' : '#F8F9F9', 
                      color: inWishlist ? '#C0392B' : '#7F8C8D', 
                      border: `1px solid ${inWishlist ? '#F5B7B1' : '#EAEDED'}`,
                      padding: '10px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                    {inWishlist ? '❤️ Saved in Wishlist' : '🤍 Save for Later'}
                  </button>
                </div>
                <div style={styles.btnRow}>
                  <button className="premium-btn-outline" style={{...styles.addBtn, background: added ? '#EAFAF1' : 'transparent', borderColor: added ? '#27AE60' : '#C0392B', color: added ? '#27AE60' : '#C0392B'}}
                    onClick={() => { addToCart(book, qty); setAdded(true); setTimeout(() => setAdded(false), 2000); }}>
                    {added ? '✅ Added to Cart' : '🛒 Add to Cart'}
                  </button>
                  <button className="premium-btn-solid" style={styles.buyBtn}
                    onClick={() => { addToCart(book, qty); window.location.href='/cart'; }}>
                    Buy Now &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modern Tabs */}
        <div style={styles.tabContainer}>
          <div style={styles.tabHeader}>
            {[['details','📖 Book Details'],['reviews','⭐ Customer Reviews'],['similar','📚 Similar Books']].map(([tab, label]) => (
              <button key={tab}
                style={{...styles.tabBtn, ...(activeTab===tab ? styles.tabActive : {})}}
                onClick={() => setActiveTab(tab)}>
                {label} {tab==='reviews' && reviews.length > 0 ? <span style={styles.tabBadge}>{reviews.length}</span> : ''}
              </button>
            ))}
          </div>

          <div className="premium-card" style={styles.tabContentCard}>
            
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="fade-in-content">
                <h3 style={styles.tabTitle}>About this Book</h3>
                <p style={styles.descText}>
                  <strong>"{book.title}"</strong> authored by <strong>{book.author}</strong> is a highly sought-after book in the {book.category} category. 
                  Order through ZipZo to get the best price and fastest delivery in Biratnagar. Guaranteed genuine copy, securely packed and delivered to your doorstep.
                </p>
                
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Category</span>
                    <span style={styles.infoValue}>{book.category}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Author</span>
                    <span style={styles.infoValue}>{book.author}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Payment</span>
                    <span style={styles.infoValue}>Cash on Delivery</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Delivery Time</span>
                    <span style={{...styles.infoValue, color: '#27AE60'}}>{book.deliveryDays ? `${book.deliveryDays} Days` : 'Same Day'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="fade-in-content">
                <h3 style={styles.tabTitle}>Customer Reviews</h3>

                {/* Rating Summary */}
                {reviews.length > 0 && (
                  <div style={styles.ratingSummary}>
                    <div style={styles.avgRatingBox}>
                      <span style={styles.avgNum}>{avgRating}</span>
                      <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'2px'}}>
                        <span style={styles.avgStars}>{renderStars(avgRating)}</span>
                        <span style={styles.avgCount}>Based on {reviews.length} reviews</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div style={styles.reviewsList}>
                  {reviews.length === 0 ? (
                    <div style={styles.emptySmall}>
                      <span style={{fontSize:'32px'}}>💬</span>
                      <p style={{margin:'8px 0 0', color:'#7F8C8D'}}>No reviews yet. Be the first to review!</p>
                    </div>
                  ) : (
                    reviews.map(r => (
                      <div key={r.id} style={styles.reviewCard}>
                        <div style={styles.reviewHeader}>
                          <div style={styles.reviewAvatar}>{r.name.charAt(0).toUpperCase()}</div>
                          <div>
                            <p style={styles.reviewName}>{r.name}</p>
                            <p style={styles.reviewStars}>{renderStars(r.rating)}</p>
                          </div>
                        </div>
                        <p style={styles.reviewComment}>{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Review Form */}
                {!reviewSubmitted ? (
                  <div style={styles.reviewForm}>
                    <h4 style={styles.formTitle}>Write a Review</h4>
                    <div style={styles.starSelect}>
                      <span style={{fontSize:'14px', fontWeight:'600', color:'#34495E'}}>Rate this book: </span>
                      <div style={{display:'flex', gap:'4px'}}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{fontSize:'22px', cursor:'pointer', color: s <= reviewForm.rating ? '#F39C12' : '#BDC3C7', transition:'color 0.2s'}}
                            onClick={() => setReviewForm({...reviewForm, rating: s})}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <input className="premium-input" style={styles.reviewInput} placeholder="Your Full Name"
                      value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} />
                    <textarea className="premium-input" style={styles.reviewTextarea} placeholder="What did you like or dislike about this book?"
                      value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} />
                    <button className="premium-btn-solid" style={styles.reviewSubmitBtn} onClick={submitReview}>
                      Submit Review
                    </button>
                  </div>
                ) : (
                  <div style={styles.reviewSuccess}>
                    🎉 Thank you! Your review has been submitted successfully.
                  </div>
                )}
              </div>
            )}

            {/* Similar Books Tab */}
            {activeTab === 'similar' && (
              <div className="fade-in-content">
                <h3 style={styles.tabTitle}>You Might Also Like</h3>
                {similarBooks.length === 0 ? (
                  <div style={styles.emptySmall}>
                    <p style={{color:'#7F8C8D'}}>No similar books found in this category.</p>
                  </div>
                ) : (
                  <div style={styles.similarGrid}>
                    {similarBooks.map((b, index) => (
                      <div key={b.id} className="premium-card" style={{...styles.similarCard, animationDelay: `${index*0.05}s`}}
                        onClick={() => window.location.href=`/book/${b.id}`}>
                        <div style={styles.similarImgBox}>
                          {b.imageUrl
                            ? <img src={b.imageUrl} alt={b.title} style={styles.similarImg} />
                            : <span style={{fontSize:'32px'}}>📚</span>
                          }
                        </div>
                        <div style={styles.similarInfo}>
                          <p style={styles.similarTitle}>{b.title}</p>
                          <p style={styles.similarAuthor}>{b.author}</p>
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'8px'}}>
                            <p style={styles.similarPrice}>Rs. {b.price}</p>
                            <button className="add-to-cart-btn" style={styles.similarBtn}
                              onClick={(e) => { e.stopPropagation(); addToCart(b, 1); alert('Added to Cart!'); }}>
                              + Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', background:'#F4F7F6', fontFamily:"'Inter', system-ui, -apple-system, sans-serif", paddingBottom: '60px' },
  
  /* Navbar */
  navbar: { background:'rgba(192, 57, 43, 0.95)', backdropFilter: 'blur(10px)', padding:'14px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100, borderBottom: '1px solid rgba(255,255,255,0.1)' },
  back: { background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', color:'white', fontSize:'14px', fontWeight: '500', cursor:'pointer', padding: '8px 16px', borderRadius: '30px', transition: 'all 0.2s' },
  navTitle: { color:'white', margin:0, fontSize:'18px', fontWeight: '700', letterSpacing: '0.5px' },
  cartBtn: { background:'white', color:'#C0392B', border:'none', padding:'8px 18px', borderRadius:'30px', cursor:'pointer', fontWeight:'700', fontSize:'14px', display:'flex', alignItems:'center', transition: 'all 0.2s' },
  
  /* Layout */
  body: { padding:'32px 24px', maxWidth:'1000px', margin:'0 auto' },
  loadingContainer: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F4F7F6' },
  emptyContainer: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F4F7F6', padding: '20px', textAlign: 'center' },
  emptyIcon: { fontSize: '72px', marginBottom: '16px', opacity: 0.8 },
  emptyTitle: { fontSize: '24px', fontWeight: '800', color: '#2C3E50', margin: '0 0 8px' },
  emptyDesc: { color: '#7F8C8D', marginBottom: '24px' },
  
  /* Main Product Card */
  mainCard: { background:'white', borderRadius:'24px', padding:'32px', display:'flex', gap:'40px', marginBottom:'40px', border: '1px solid #EAEDED', flexWrap:'wrap' },
  
  /* Image Section */
  imgSection: { display:'flex', flexDirection:'column', gap:'20px', minWidth:'280px', flex: 1 },
  imgShowcase: { background:'#F8F9F9', padding: '30px', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', border: '1px solid #EAEDED' },
  bookImg: { width:'100%', maxWidth:'260px', height:'auto', objectFit:'cover', borderRadius:'12px', boxShadow:'0 15px 35px rgba(0,0,0,0.15)', transition: 'transform 0.3s' },
  imgPlaceholder: { width:'200px', height:'300px', background:'linear-gradient(135deg, #FCEBEB, #FFD5D5)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center' },
  
  badgesWrapper: { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' },
  pillBadge: { padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'700', letterSpacing: '0.3px', textAlign: 'center' },
  
  /* Info Section */
  infoSection: { flex: 2, minWidth:'300px', display: 'flex', flexDirection: 'column' },
  catTag: { display:'inline-block', background:'#FCEBEB', color:'#C0392B', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px', alignSelf: 'flex-start' },
  title: { fontSize:'32px', fontWeight:'800', color:'#2C3E50', margin:'0 0 8px', lineHeight: '1.2', letterSpacing: '-0.5px' },
  author: { fontSize:'16px', color:'#7F8C8D', marginBottom:'16px', fontWeight: '500' },
  
  ratingRow: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' },
  ratingNum: { fontSize: '16px', fontWeight:'800', color:'#F39C12' },
  ratingStars: { fontSize:'16px', letterSpacing: '2px' },
  ratingCount: { fontSize:'13px', color:'#95A5A6', fontWeight: '500' },
  
  priceDivider: { height: '1px', background: '#EAEDED', marginBottom: '20px' },
  priceBox: { display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px' },
  price: { fontSize:'36px', fontWeight:'800', color:'#C0392B', lineHeight: '1' },
  originalPrice: { fontSize:'18px', color:'#BDC3C7', textDecoration:'line-through', fontWeight: '500' },
  discount: { background:'#EAFAF1', color:'#27AE60', padding:'6px 12px', borderRadius:'8px', fontSize:'13px', fontWeight:'800' },
  
  features: { display:'flex', flexDirection:'column', gap:'12px', marginBottom:'32px' },
  featureItem: { display:'flex', gap:'12px', fontSize:'14px', color:'#34495E', alignItems: 'center', fontWeight: '500' },
  featureIcon: { fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#F8F9F9', borderRadius: '8px' },
  
  /* Action Area */
  actionArea: { marginTop: 'auto', background: '#F8F9F9', padding: '24px', borderRadius: '16px', border: '1px solid #EAEDED' },
  qtyBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  qtyLabel: { fontSize:'15px', fontWeight:'700', color:'#2C3E50' },
  qtyControls: { display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #EAEDED', borderRadius: '30px', padding: '4px' },
  qtyBtn: { width:'36px', height:'36px', border:'none', background:'transparent', cursor:'pointer', fontSize:'20px', fontWeight: '500', color: '#2C3E50', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyNum: { fontSize:'16px', fontWeight:'700', width:'40px', textAlign:'center', color: '#2C3E50' },
  
  btnRow: { display:'flex', gap:'16px' },
  addBtn: { flex:1, padding:'16px', borderRadius:'12px', fontSize:'15px', fontWeight:'700', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  buyBtn: { flex:2, padding:'16px', borderRadius:'12px', fontSize:'15px', fontWeight:'700', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 20px rgba(192, 57, 43, 0.2)' },
  outOfStockMsg: { background:'#FDEDEC', color:'#C0392B', padding:'16px', borderRadius:'12px', textAlign:'center', fontWeight:'700', fontSize: '15px', border: '1px solid #F5B7B1' },
  
  /* Tabs */
  tabContainer: { display: 'flex', flexDirection: 'column' },
  tabHeader: { display:'flex', gap:'8px', marginBottom:'20px', borderBottom: '2px solid #EAEDED', overflowX: 'auto', scrollbarWidth: 'none' },
  tabBtn: { padding:'12px 24px', border:'none', background:'transparent', cursor:'pointer', fontSize:'15px', color:'#7F8C8D', fontWeight: '600', position: 'relative', borderBottom: '3px solid transparent', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' },
  tabActive: { color:'#C0392B', borderBottom: '3px solid #C0392B' },
  tabBadge: { background: '#EAEDED', color: '#2C3E50', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' },
  tabContentCard: { background:'white', borderRadius:'20px', padding:'32px', border: '1px solid #EAEDED', minHeight: '300px' },
  tabTitle: { fontSize:'20px', fontWeight:'800', marginBottom:'24px', color:'#2C3E50' },
  
  /* Details Tab */
  descText: { fontSize:'15px', color:'#5C6A79', lineHeight:'1.8', marginBottom:'32px' },
  infoGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'16px' },
  infoItem: { display:'flex', flexDirection:'column', gap:'6px', padding:'16px', background:'#F8F9F9', borderRadius:'12px', border: '1px solid #EAEDED' },
  infoLabel: { fontSize:'11px', color:'#95A5A6', fontWeight:'700', textTransform:'uppercase', letterSpacing: '0.5px' },
  infoValue: { fontSize:'15px', color:'#2C3E50', fontWeight:'700' },
  
  /* Reviews Tab */
  ratingSummary: { background:'#F8F9F9', borderRadius:'16px', padding:'24px', marginBottom:'32px', border: '1px solid #EAEDED', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avgRatingBox: { display:'flex', alignItems:'center', gap:'16px' },
  avgNum: { fontSize:'56px', fontWeight:'800', color:'#2C3E50', lineHeight: 1 },
  avgStars: { fontSize:'20px', color: '#F39C12', letterSpacing: '2px' },
  avgCount: { fontSize:'13px', color:'#7F8C8D', fontWeight: '500' },
  
  reviewsList: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' },
  emptySmall: { textAlign: 'center', padding: '40px 20px' },
  reviewCard: { background:'white', border: '1px solid #EAEDED', borderRadius:'12px', padding:'20px', transition: 'box-shadow 0.2s' },
  reviewHeader: { display:'flex', gap:'12px', alignItems:'center', marginBottom:'12px' },
  reviewAvatar: { width:'44px', height:'44px', borderRadius:'50%', background:'linear-gradient(135deg, #C0392B, #E74C3C)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', fontSize:'18px' },
  reviewName: { fontWeight:'700', fontSize:'15px', color: '#2C3E50', margin:'0 0 2px' },
  reviewStars: { fontSize:'13px', color: '#F39C12', letterSpacing: '1px', margin:0 },
  reviewComment: { fontSize:'14px', color:'#5C6A79', margin:0, lineHeight:'1.6' },
  
  reviewForm: { background:'#F8F9F9', borderRadius:'16px', padding:'24px', border: '1px solid #EAEDED' },
  formTitle: { fontSize:'18px', fontWeight:'800', marginBottom:'16px', color:'#2C3E50' },
  starSelect: { display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' },
  reviewInput: { marginBottom:'12px' },
  reviewTextarea: { height:'100px', resize:'vertical', marginBottom:'16px' },
  reviewSubmitBtn: { padding:'12px 24px', borderRadius:'10px', fontSize:'14px', fontWeight:'700' },
  reviewSuccess: { background:'#EAFAF1', color:'#27AE60', padding:'20px', borderRadius:'12px', textAlign:'center', fontWeight:'700', border: '1px solid #A9DFBF' },
  
  /* Similar Books */
  similarGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'20px' },
  similarCard: { background:'white', borderRadius:'16px', overflow: 'hidden', border: '1px solid #EAEDED', cursor:'pointer', display:'flex', flexDirection: 'column' },
  similarImgBox: { height:'200px', background:'#F8F9F9', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', borderBottom: '1px solid #EAEDED' },
  similarImg: { width:'100%', height:'100%', objectFit:'cover', transition: 'transform 0.3s' },
  similarInfo: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' },
  similarTitle: { fontSize:'15px', fontWeight:'700', color:'#2C3E50', margin:'0 0 4px', lineHeight: '1.3' },
  similarAuthor: { fontSize:'12px', color:'#7F8C8D', margin:'0 0 12px', fontWeight: '500' },
  similarPrice: { fontSize:'16px', fontWeight:'800', color:'#C0392B', margin: 0 },
  similarBtn: { padding:'6px 16px', background: '#FDF2E9', color: '#D35400', border: 'none', borderRadius:'20px', cursor:'pointer', fontSize:'12px', fontWeight: '700', transition: 'all 0.2s' },
};

export default BookDetail;