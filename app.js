// ============================================================
// VELOUR — E-Commerce App
// Backend: Supabase | Payment: Razorpay
// ============================================================

// ===== CONFIGURATION =====
// ⚠️  Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = 'https://ewprdlxdtkirjxxjsrhq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3cHJkbHhkdGtpcmp4eGpzcmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNDg1ODYsImV4cCI6MjA5MTgyNDU4Nn0.OtCDIooSBHDtU6SKg9-scq9uFO1mbJuV0bbxTbsFNWw'; // 🔑 Paste your anon key from Supabase → Settings → API
const RAZORPAY_KEY_ID = 'rzp_test_Scsuz4AqYFCKWO';     // 🔑 Paste your Razorpay test key here

// ===== STATE =====

let sb = null;

if (typeof supabase !== "undefined") {
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
let cart = JSON.parse(localStorage.getItem('velour_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('velour_wishlist') || '[]');
let currentUser = null;
let allProducts = [];
let currentCategory = 'all';
let heroSlideIndex = 0;

// ===== DEMO PRODUCTS (fallback if Supabase not configured) =====
const demoProducts = [
  { id: 1, name: 'Oversized Linen Blazer', brand: 'VELOUR STUDIO', category: 'women', price: 4999, original_price: 6999, image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', sizes: ['XS','S','M','L','XL'], badge: 'New', description: 'A relaxed oversized blazer crafted from premium linen. Perfect for both professional and casual settings.' },
  { id: 2, name: 'Silk Wrap Midi Dress', brand: 'VELOUR STUDIO', category: 'women', price: 5499, original_price: null, image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', sizes: ['XS','S','M','L'], badge: null, description: 'Luxurious silk wrap dress with a flattering silhouette and fluid drape.' },
  { id: 3, name: 'High-Waist Cigarette Trousers', brand: 'VELOUR STUDIO', category: 'women', price: 3299, original_price: 4599, image_url: 'https://images.unsplash.com/photo-1638396637969-956ca903df87?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8SGlnaC1XYWlzdCUyMENpZ2FyZXR0ZSUyMFRyb3VzZXJzfGVufDB8fDB8fHww', sizes: ['XS','S','M','L','XL'], badge: 'Sale', description: 'Tailored cigarette trousers with a high waist cut for a sleek, modern look.' },
  { id: 4, name: 'Cotton Turtleneck', brand: 'VELOUR BASICS', category: 'women', price: 1799, original_price: null, image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80', sizes: ['XS','S','M','L','XL'], badge: null, description: 'A wardrobe essential — soft cotton turtleneck in a classic relaxed fit.' },
  { id: 5, name: 'Structured Wool Coat', brand: 'VELOUR STUDIO', category: 'men', price: 8999, original_price: 12999, image_url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80', sizes: ['S','M','L','XL','XXL'], badge: 'Sale', description: 'Double-breasted wool coat with structured shoulders and clean, minimal lines.' },
  { id: 6, name: 'Slim-Fit Oxford Shirt', brand: 'VELOUR BASICS', category: 'men', price: 2499, original_price: null, image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', sizes: ['S','M','L','XL'], badge: 'New', description: 'Classic Oxford shirt in a slim, contemporary fit. Made from 100% cotton.' },
  { id: 7, name: 'Tapered Chino Pants', brand: 'VELOUR BASICS', category: 'men', price: 2999, original_price: null, image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', sizes: ['28','30','32','34','36'], badge: null, description: 'Versatile tapered chinos crafted from stretch-cotton blend for all-day comfort.' },
  { id: 8, name: 'Merino Crewneck Sweater', brand: 'VELOUR STUDIO', category: 'men', price: 4299, original_price: 5999, image_url: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&q=80', sizes: ['S','M','L','XL'], badge: 'Sale', description: 'Ultra-soft merino wool crewneck sweater, ideal for layering.' },
  { id: 9, name: 'Leather Tote Bag', brand: 'VELOUR ACCESSORIES', category: 'accessories', price: 6999, original_price: null, image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', sizes: ['One Size'], badge: 'New', description: 'Full-grain leather tote with suede interior lining. Spacious and structured.' },
  { id: 10, name: 'Silk Scarf', brand: 'VELOUR ACCESSORIES', category: 'accessories', price: 2199, original_price: 2999, image_url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80', sizes: ['One Size'], badge: 'Sale', description: 'Hand-rolled pure silk scarf with an exclusive abstract print.' },
  { id: 11, name: 'Minimalist Watch', brand: 'VELOUR ACCESSORIES', category: 'accessories', price: 9999, original_price: null, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', sizes: ['One Size'], badge: null, description: 'Swiss quartz movement with a genuine leather strap. Understated elegance.' },
  { id: 12, name: 'Modern fit shorts', brand: 'VELOUR BASICS', category: 'sale', price: 1199, original_price: 2499, image_url: 'https://images.unsplash.com/photo-1651694558313-fdfc4ee862ba?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', sizes: ['XS','S','M','L','XL'], badge: 'Sale', description: 'Lightweight linen-blend shorts perfect for warm weather. Major markdown.' },
];
async function loadProducts() {
  try {
    const { data, error } = await sb.from('products').select('*');

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) throw error;

    if (data && data.length > 0) {
      allProducts = data;
      renderProducts(allProducts);
    } else {
      console.warn("No data found");
    }

  } catch (err) {
    console.error("FETCH FAILED:", err);
  }
}
// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  initLoader();
  initNavbar();
  initSideMenu();
  initSearch();
  initCart();
  initHero();
  await loadProducts();
  await checkAuthSession();
  updateBadges();
});

// ===== LOADER =====
function initLoader() {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2200);
}

// ===== NAVBAR =====
function initNavbar() {
  document.getElementById('userBtn').addEventListener('click', () => {
    if (currentUser) {
      showToast(`Signed in as ${currentUser.email}`, 'success');
    } else {
      openModal('authModal');
    }
  });

  document.getElementById('loginLink').addEventListener('click', (e) => {
    e.preventDefault();
    closeAllSidePanels();
    openModal('authModal');
  });

  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('wishlistBtn').addEventListener('click', openWishlistView);
  document.getElementById('shopNowBtn').addEventListener('click', () => {
    document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
  });

  // Banner sale button
  document.querySelectorAll('[data-category]').forEach(el => {
    if (el.tagName === 'BUTTON') {
      el.addEventListener('click', () => filterByCategory(el.dataset.category));
    }
  });

  // Window scroll for navbar
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    nav.style.background = window.scrollY > 50
      ? 'rgba(14, 12, 10, 0.98)'
      : 'rgba(14, 12, 10, 0.92)';
  });
}

// ===== SIDE MENU =====
function initSideMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const sideMenu = document.getElementById('sideMenu');
  const closeMenu = document.getElementById('closeMenu');
  const overlay = document.getElementById('menuOverlay');

  menuBtn.addEventListener('click', () => {
    sideMenu.classList.add('open');
    overlay.classList.add('show');
  });

  const closeFn = () => {
    sideMenu.classList.remove('open');
    overlay.classList.remove('show');
  };
  closeMenu.addEventListener('click', closeFn);
  overlay.addEventListener('click', closeFn);

  // Category navigation
  document.querySelectorAll('.side-nav a[data-category]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.side-nav a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      filterByCategory(link.dataset.category);
      closeFn();
    });
  });

  // Category cards
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => filterByCategory(card.dataset.category));
  });
}

// ===== SEARCH =====
function initSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const closeSearch = document.getElementById('closeSearch');
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput');

  searchBtn.addEventListener('click', () => {
    overlay.classList.add('open');
    setTimeout(() => input.focus(), 300);
  });
  closeSearch.addEventListener('click', () => overlay.classList.remove('open'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      overlay.classList.remove('open');
      closeAllModals();
    }
  });

  let searchTimer;
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => performSearch(input.value.trim()), 300);
  });
}

function performSearch(query) {
  const resultsEl = document.getElementById('searchResults');
  if (!query) { resultsEl.innerHTML = ''; return; }

  const results = allProducts.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 5);

  if (!results.length) {
    resultsEl.innerHTML = `<p style="color:var(--text3);font-size:13px;">No results found for "${query}"</p>`;
    return;
  }

  resultsEl.innerHTML = results.map(p => `
    <div class="search-result-item" onclick="openQuickView(${p.id}); document.getElementById('searchOverlay').classList.remove('open')">
      <img src="${p.image_url}" alt="${p.name}" class="search-result-thumb"/>
      <div class="search-result-info">
        <h4>${p.name}</h4>
        <p>₹${p.price.toLocaleString()}</p>
      </div>
    </div>
  `).join('');
}

// ===== PRODUCTS =====
function filterByCategory(category) {
  currentCategory = category;
  const titleMap = {
    all: 'New Arrivals',
    women: "Women's Collection",
    men: "Men's Collection",
    accessories: 'Accessories',
    sale: 'Sale Items'
  };
  document.getElementById('sectionTitle').textContent = titleMap[category] || 'Collection';
  document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });

  const filtered = category === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === category);

  renderProducts(filtered);
}

function sortProducts(products) {
  const sort = document.getElementById('sortSelect').value;
  const sorted = [...products];
  if (sort === 'price-low') sorted.sort((a, b) => a.price - b.price);
  else if (sort === 'price-high') sorted.sort((a, b) => b.price - a.price);
  else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
}

document.getElementById('sortSelect').addEventListener('change', () => {
  const filtered = currentCategory === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === currentCategory);
  renderProducts(filtered);
});

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  const loading = document.getElementById('loadingProducts');
  const empty = document.getElementById('noProducts');

  loading.classList.add('hidden');
  grid.innerHTML = '';

  const sorted = sortProducts(products);

  if (!sorted.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  sorted.forEach((product, i) => {
    const inWishlist = wishlist.some(w => w.id === product.id);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${i * 0.05}s`;

    const discount = product.original_price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

    card.innerHTML = `
      <div class="product-img-wrap">
        <img src="${product.image_url}" alt="${product.name}" loading="lazy"/>
        ${product.badge ? `<div class="product-badge ${product.badge.toLowerCase() === 'sale' ? 'sale' : ''}">${product.badge}</div>` : ''}
        <div class="product-actions">
          <button class="action-btn ${inWishlist ? 'wishlisted' : ''}" onclick="toggleWishlist(event, ${product.id})" title="Wishlist">
            <svg viewBox="0 0 24 24" fill="${inWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button class="action-btn" onclick="openQuickView(${product.id})" title="Quick View">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brand || 'VELOUR'}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-price">
          <span class="price-current">₹${product.price.toLocaleString()}</span>
          ${product.original_price ? `<span class="price-original">₹${product.original_price.toLocaleString()}</span>` : ''}
          ${discount ? `<span class="product-badge sale" style="position:static;font-size:10px;">-${discount}%</span>` : ''}
        </div>
        ${product.sizes ? `
          <div class="product-sizes">
            ${product.sizes.slice(0, 4).map(s => `<span class="size-dot">${s}</span>`).join('')}
            ${product.sizes.length > 4 ? '<span class="size-dot">+</span>' : ''}
          </div>` : ''}
      </div>
      <button class="add-to-cart-btn" onclick="quickAddToCart(event, ${product.id})">Add to Cart</button>
    `;

    card.querySelector('.product-img-wrap').addEventListener('click', () => openQuickView(product.id));
    card.querySelector('.product-name').addEventListener('click', () => openQuickView(product.id));
    grid.appendChild(card);
  });
}

// ===== QUICK VIEW =====
let selectedSize = null;
function openQuickView(productId) {
  selectedSize = null;
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  document.getElementById('quickViewContent').innerHTML = `
    <div class="quick-view-grid">
      <img src="${product.image_url}" alt="${product.name}" class="quick-view-img"/>
      <div class="quick-view-info">
        <div class="qv-brand">${product.brand || 'VELOUR'}</div>
        <h2 class="qv-name">${product.name}</h2>
        <div class="qv-price">
          <span class="qv-current">₹${product.price.toLocaleString()}</span>
          ${product.original_price ? `<span class="qv-original">₹${product.original_price.toLocaleString()}</span>` : ''}
          ${discount ? `<span class="product-badge sale" style="position:static;font-size:11px;">-${discount}% OFF</span>` : ''}
        </div>
        <p class="qv-desc">${product.description || 'Premium quality piece crafted with exceptional attention to detail.'}</p>
        ${product.sizes ? `
          <span class="qv-label">Select Size</span>
          <div class="qv-sizes">
            ${product.sizes.map(s => `
              <button class="qv-size-btn" onclick="selectSize(this, '${s}')">${s}</button>
            `).join('')}
          </div>` : ''}
        <button class="btn-primary" onclick="addToCartFromModal(${product.id})" style="margin-top:0.5rem;">
          Add to Cart
        </button>
        <button class="btn-secondary" onclick="toggleWishlist(event, ${product.id})" style="margin-top:0.75rem; width:100%;">
          ${wishlist.some(w => w.id === product.id) ? '♥ In Wishlist' : '♡ Add to Wishlist'}
        </button>
      </div>
    </div>
  `;

  openModal('quickViewModal');
}

function selectSize(btn, size) {
  document.querySelectorAll('.qv-size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedSize = size;
}

function addToCartFromModal(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const sizes = product.sizes || [];
  if (sizes.length > 1 && !selectedSize) {
    showToast('Please select a size', 'error');
    return;
  }
  addToCart(product, selectedSize || (sizes[0] || 'One Size'));
  closeAllModals();
  openCart();
}

function quickAddToCart(e, productId) {
  e.stopPropagation();
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const sizes = product.sizes || [];
  if (sizes.length > 1) {
    openQuickView(productId);
    return;
  }
  addToCart(product, sizes[0] || 'One Size');
}

// ===== CART =====
function initCart() {
  document.getElementById('closeCart').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  document.getElementById('continueShopping').addEventListener('click', closeCart);
  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
}

function openCart() {
  renderCart();
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('show');
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('show');
}

function addToCart(product, size) {
  const key = `${product.id}-${size}`;
  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size,
      qty: 1
    });
  }

  saveCart();
  updateBadges();
  showToast(`${product.name} added to cart`, 'success');
}

function removeFromCart(key) {
  cart = cart.filter(item => item.key !== key);
  saveCart();
  updateBadges();
  renderCart();
}

function updateQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  renderCart();
  updateBadges();
}

function saveCart() {
  localStorage.setItem('velour_cart', JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  const emptyEl = document.getElementById('emptyCart');

  if (!cart.length) {
    itemsEl.innerHTML = '';
    footer.classList.add('hidden');
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';
  footer.classList.remove('hidden');
  document.getElementById('cartTotal').textContent = `₹${getCartTotal().toLocaleString()}`;

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image_url}" alt="${item.name}" class="cart-item-img"/>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>Size: ${item.size}</p>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQty('${item.key}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.key}', 1)">+</button>
        </div>
      </div>
      <div>
        <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString()}</div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.key}')">✕</button>
      </div>
    </div>
  `).join('');
}

// ===== WISHLIST =====
function toggleWishlist(e, productId) {
  e.stopPropagation();
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const idx = wishlist.findIndex(w => w.id === productId);
  if (idx >= 0) {
    wishlist.splice(idx, 1);
    showToast('Removed from wishlist');
  } else {
    wishlist.push(product);
    showToast(`${product.name} added to wishlist ♥`, 'success');
  }

  localStorage.setItem('velour_wishlist', JSON.stringify(wishlist));
  updateBadges();
  // Re-render to update button states
  const filtered = currentCategory === 'all' ? allProducts : allProducts.filter(p => p.category === currentCategory);
  renderProducts(filtered);
}

function openWishlistView() {
  if (!wishlist.length) {
    showToast('Your wishlist is empty', 'error');
    return;
  }
  showToast(`You have ${wishlist.length} item${wishlist.length > 1 ? 's' : ''} in your wishlist`);
}

// ===== BADGE UPDATE =====
function updateBadges() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartBadge').textContent = totalItems;
  document.getElementById('wishlistBadge').textContent = wishlist.length;
}

// ===== CHECKOUT =====
function openCheckout() {
  if (!cart.length) return;
  closeCart();

  // Pre-fill if user logged in
  if (currentUser) {
    document.getElementById('chkEmail').value = currentUser.email || '';
    document.getElementById('chkName').value = currentUser.user_metadata?.name || '';
  }

  // Render order summary
  const summaryEl = document.getElementById('orderSummaryItems');
  summaryEl.innerHTML = cart.map(item => `
    <div class="order-item">
      <span class="order-item-name">${item.name} × ${item.qty} <small style="color:var(--text3)">(${item.size})</small></span>
      <span class="order-item-price">₹${(item.price * item.qty).toLocaleString()}</span>
    </div>
  `).join('');

  const shipping = getCartTotal() >= 999 ? 0 : 99;
  if (shipping > 0) {
    summaryEl.innerHTML += `<div class="order-item"><span class="order-item-name">Shipping</span><span class="order-item-price">₹${shipping}</span></div>`;
  }
  document.getElementById('orderTotal').textContent = `₹${(getCartTotal() + shipping).toLocaleString()}`;

  openModal('checkoutModal');

  document.getElementById('payNowBtn').addEventListener('click', initiatePayment, { once: true });
  document.getElementById('closeCheckout').addEventListener('click', () => closeModal('checkoutModal'));
}

// ===== RAZORPAY PAYMENT =====
async function initiatePayment() {
  const name = document.getElementById('chkName').value.trim();
  const email = document.getElementById('chkEmail').value.trim();
  const phone = document.getElementById('chkPhone').value.trim();
  const address = document.getElementById('chkAddress').value.trim();
  const city = document.getElementById('chkCity').value.trim();
  const pincode = document.getElementById('chkPincode').value.trim();
  const state = document.getElementById('chkState').value.trim();

  const msg = document.getElementById('checkoutMsg');

  if (!name || !email || !phone || !address || !city || !pincode || !state) {
    msg.textContent = 'Please fill in all required fields.';
    msg.className = 'checkout-msg error';
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    msg.textContent = 'Please enter a valid 10-digit phone number.';
    msg.className = 'checkout-msg error';
    return;
  }

  const shipping = getCartTotal() >= 999 ? 0 : 99;
  const totalAmount = getCartTotal() + shipping;

  // In production: create order on your server, get order_id from Razorpay
  // Here we simulate client-side for demo purposes
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: totalAmount * 100, // in paise
    currency: 'INR',
    name: 'VELOUR',
    description: `Order for ${cart.length} item(s)`,
    image: 'https://via.placeholder.com/150x40/0e0c0a/c9a87c?text=VELOUR',
    // order_id: 'order_xxxx', // from your backend
    prefill: { name, email, contact: phone },
    notes: { address: `${address}, ${city}, ${state} - ${pincode}` },
    theme: { color: '#c9a87c' },
    handler: async function(response) {
      await onPaymentSuccess(response, { name, email, phone, address, city, pincode, state, totalAmount });
    },
    modal: {
      ondismiss: () => {
        msg.textContent = 'Payment cancelled. You can try again.';
        msg.className = 'checkout-msg error';
        // Re-attach listener
        document.getElementById('payNowBtn').addEventListener('click', initiatePayment, { once: true });
      }
    }
  };

  try {
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function(response) {
      msg.textContent = `Payment failed: ${response.error.description}`;
      msg.className = 'checkout-msg error';
      document.getElementById('payNowBtn').addEventListener('click', initiatePayment, { once: true });
    });
    rzp.open();
  } catch (err) {
    msg.textContent = 'Razorpay not configured. Please add your API key.';
    msg.className = 'checkout-msg error';
    // Demo mode: simulate success
    setTimeout(() => simulateDemoSuccess({ name, email, totalAmount }), 800);
  }
}

async function onPaymentSuccess(razorpayResponse, orderData) {
  const orderId = razorpayResponse.razorpay_payment_id || `DEMO-${Date.now()}`;

  // Save order to Supabase
  if (SUPABASE_URL !== 'https://YOUR_PROJECT.supabase.co') {
    try {
      const { error } = await sb.from('orders').insert({
        payment_id: razorpayResponse.razorpay_payment_id,
        customer_name: orderData.name,
        customer_email: orderData.email,
        customer_phone: orderData.phone,
        shipping_address: `${orderData.address}, ${orderData.city}, ${orderData.state} - ${orderData.pincode}`,
        items: JSON.stringify(cart),
        total_amount: orderData.totalAmount,
        status: 'confirmed',
        user_id: currentUser?.id || null,
      });
      if (error) console.warn('Order save error:', error);
    } catch (e) {
      console.warn('Supabase order save failed:', e);
    }
  }

  // Clear cart & show success
  cart = [];
  saveCart();
  updateBadges();
  closeModal('checkoutModal');

  document.getElementById('successOrderId').textContent = orderId;
  openModal('successModal');
  document.getElementById('closeSuccess').addEventListener('click', () => closeModal('successModal'), { once: true });
}

function simulateDemoSuccess(data) {
  const orderId = `VELOUR-${Date.now()}`;
  cart = [];
  saveCart();
  updateBadges();
  closeModal('checkoutModal');
  document.getElementById('successOrderId').textContent = orderId;
  openModal('successModal');
  document.getElementById('closeSuccess').addEventListener('click', () => closeModal('successModal'), { once: true });
}

// ===== AUTH =====
async function checkAuthSession() {
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session?.user) currentUser = session.user;
  } catch (e) {
    // Supabase not configured
  }
}

// Auth tab switching
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    document.getElementById('loginForm').classList.toggle('hidden', target !== 'login');
    document.getElementById('registerForm').classList.toggle('hidden', target !== 'register');
  });
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const msg = document.getElementById('loginMsg');

  if (!email || !password) {
    msg.textContent = 'Please enter email and password.';
    msg.className = 'auth-msg error';
    return;
  }

  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    currentUser = data.user;
    msg.textContent = 'Signed in successfully!';
    msg.className = 'auth-msg success';
    setTimeout(() => closeModal('authModal'), 1200);
    showToast('Welcome back!', 'success');
  } catch (err) {
    msg.textContent = err.message || 'Login failed. Please try again.';
    msg.className = 'auth-msg error';
  }
});

document.getElementById('registerBtn').addEventListener('click', async () => {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const msg = document.getElementById('registerMsg');

  if (!name || !email || !password) {
    msg.textContent = 'Please fill in all fields.';
    msg.className = 'auth-msg error';
    return;
  }
  if (password.length < 6) {
    msg.textContent = 'Password must be at least 6 characters.';
    msg.className = 'auth-msg error';
    return;
  }

  try {
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { name } }
    });
    if (error) throw error;
    msg.textContent = 'Account created! Please check your email to verify.';
    msg.className = 'auth-msg success';
    showToast('Account created successfully!', 'success');
  } catch (err) {
    msg.textContent = err.message || 'Registration failed.';
    msg.className = 'auth-msg error';
  }
});

document.getElementById('closeAuth').addEventListener('click', () => closeModal('authModal'));

// ===== HERO SLIDER =====
function initHero() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');

  function goToSlide(index) {
    slides[heroSlideIndex].classList.remove('active');
    dots[heroSlideIndex].classList.remove('active');
    heroSlideIndex = index;
    slides[heroSlideIndex].classList.add('active');
    dots[heroSlideIndex].classList.add('active');
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.slide)));
  });

  setInterval(() => {
    goToSlide((heroSlideIndex + 1) % slides.length);
  }, 6000);
}

// ===== MODAL HELPERS =====
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

function closeAllModals() {
  document.querySelectorAll('.modal.open').forEach(m => {
    m.classList.remove('open');
  });
  document.body.style.overflow = '';
}

function closeAllSidePanels() {
  document.getElementById('sideMenu').classList.remove('open');
  document.getElementById('menuOverlay').classList.remove('show');
}

document.getElementById('closeQuickView').addEventListener('click', () => closeModal('quickViewModal'));

// Close modals on backdrop click
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal.id);
  });
});

// ===== TOAST =====
let toastTimer;
function showToast(message, type = '') {
  clearTimeout(toastTimer);
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== NEWSLETTER =====
document.querySelector('.newsletter-form button').addEventListener('click', () => {
  const input = document.querySelector('.newsletter-form input');
  if (input.value.includes('@')) {
    showToast('Subscribed! Welcome to VELOUR.', 'success');
    input.value = '';
  } else {
    showToast('Please enter a valid email.', 'error');
  }
});
loadProducts();