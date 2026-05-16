// ===== HAIRCUTS PAGE =====
async function renderHaircuts(app) {
  let haircuts = [];
  try { haircuts = await api('/api/haircuts'); } catch(e) {}

  app.innerHTML = `
  <div class="page-header"><div class="bg"></div><div class="container">
    <div class="section-label">Curated Style Guide</div>
    <h1>The Modern Manifesto</h1>
    <p style="color:var(--text3);margin-top:8px">Meticulously crafted styles for the modern gentleman. Choose your look, define your legacy.</p>
  </div></div>
  <section style="padding-top:0"><div class="container">
    <div class="filter-bar">
      <div class="filters"><span>Filter by:</span>
        <button class="filter-btn active" onclick="filterHaircuts('all',this)">All Styles</button>
        <button class="filter-btn" onclick="filterHaircuts('short',this)">Short Length</button>
        <button class="filter-btn" onclick="filterHaircuts('mid',this)">Mid Length</button>
        <button class="filter-btn" onclick="filterHaircuts('long',this)">Long Length</button>
      </div>
      <select class="filter-select" id="hair-type-filter" onchange="filterHaircutsByType(this.value)">
        <option value="all">Hair Type: All</option>
        <option value="straight">Straight</option>
        <option value="wavy">Wavy</option>
        <option value="curly">Curly</option>
      </select>
    </div>
    <div class="haircuts-grid" id="haircuts-grid">
      ${haircuts.map(h => haircutCard(h)).join('')}
    </div>
  </div></section>
  <section class="cta-section">
    <div class="container">
      <h2 style="color:var(--gold)">Ready for an Upgrade?</h2>
      <p>Book your appointment with one of our master stylists and experience the Iron & Gold standard of grooming.</p>
      <div class="cta-actions">
        <button class="btn btn-primary" data-page="booking">Book Online Now</button>
        <button class="btn btn-outline" data-page="shop">Our Services</button>
      </div>
    </div>
  </section>
  ${renderFooter()}`;
}

function haircutCard(h) {
  const badge = h.is_signature ? `<span class="badge">Signature</span>` : '';
  const tags = (h.tags||[]).map(t => `<span class="tag">${t}</span>`).join('');
  return `<div class="haircut-card" data-length="${h.length_category}" data-type="${h.hair_type}">
    <div class="card-img">${badge}${imgOrPh(h.image, h.name)}</div>
    <div class="card-body">
      <h3>${h.name}</h3>
      <p>${h.description}</p>
      ${tags ? `<div class="tags">${tags}</div>` : ''}
      <button class="request-btn" data-page="booking">Request This Style</button>
    </div>
  </div>`;
}

function filterHaircuts(len, btn) {
  document.querySelectorAll('.filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.haircut-card').forEach(c => {
    c.style.display = (len === 'all' || c.dataset.length === len) ? '' : 'none';
  });
}
function filterHaircutsByType(type) {
  document.querySelectorAll('.haircut-card').forEach(c => {
    c.style.display = (type === 'all' || c.dataset.type === type || c.dataset.type === 'all') ? '' : 'none';
  });
}

// ===== SHOP PAGE =====
async function renderShop(app) {
  let products = [];
  try { products = await api('/api/products'); } catch(e) {}

  app.innerHTML = `
  <section class="shop-header" style="padding-bottom:0"><div class="container">
    <h1>Premium Grooming</h1>
    <p>The same meticulous craftsmanship we bring to our chairs, bottled for your daily ritual. Explore our curated range of professional hair and beard essentials.</p>
    <div class="shop-controls">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Search products..." id="shop-search" oninput="searchProducts()">
      </div>
      <div class="category-filters">
        <button class="filter-btn active" onclick="filterProducts('all',this)">All Products</button>
        <button class="filter-btn" onclick="filterProducts('pomades',this)">Pomades</button>
        <button class="filter-btn" onclick="filterProducts('beard_oils',this)">Beard Oils</button>
        <button class="filter-btn" onclick="filterProducts('shampoos',this)">Shampoos</button>
      </div>
    </div>
  </div></section>
  <section style="padding-top:24px"><div class="container">
    <div class="products-grid" id="products-grid">
      ${products.map(p => productCard(p)).join('')}
    </div>
  </div></section>
  ${renderFooter()}`;

  window._allProducts = products;
}

function productCard(p) {
  const bs = p.is_bestseller ? `<span class="bestseller">Best Seller</span>` : '';
  return `<div class="product-card" data-cat="${p.category}" data-name="${p.name.toLowerCase()}">
    <div class="card-img">${bs}${imgOrPh(p.image, p.name)}</div>
    <div class="card-body">
      <div class="card-top"><h3>${p.name}</h3><span class="price">$${p.price.toFixed(2)}</span></div>
      <div class="rating"><span class="stars">${stars(p.rating)}</span>(${p.reviews_count})</div>
      <p class="desc">${p.description}</p>
      <button class="add-cart-btn" onclick="addToCart(${p.id})">🛒 Add to Cart</button>
    </div>
  </div>`;
}

function filterProducts(cat, btn) {
  document.querySelectorAll('.category-filters .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.product-card').forEach(c => {
    c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
  });
}
function searchProducts() {
  const q = document.getElementById('shop-search').value.toLowerCase();
  document.querySelectorAll('.product-card').forEach(c => {
    c.style.display = c.dataset.name.includes(q) ? '' : 'none';
  });
}

async function addToCart(pid) {
  if (!currentUser) { showToast('Please login first'); navigate('login'); return; }
  try {
    await api('/api/products/cart', { method: 'POST', body: { product_id: pid } });
    showToast('Added to cart!');
  } catch(e) { showToast(e.message); }
}
