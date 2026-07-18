// ---------------------------------------------------------
// Furnish — shared front-end logic
// ---------------------------------------------------------
const API_BASE = "https://senbagam-furnish.onrender.com/api";
const CART_KEY = "furnish_cart_v1";

/* ---------- API helper ---------- */
async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

/* ---------- cart (localStorage) ---------- */
const Cart = {
  read() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  },
  write(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartBadge();
  },
  add(slug, name, price, image, qty = 1) {
    const items = Cart.read();
    const existing = items.find(i => i.slug === slug);
    if (existing) existing.qty += qty;
    else items.push({ slug, name, price, image, qty });
    Cart.write(items);
  },
  updateQty(slug, qty) {
    let items = Cart.read();
    if (qty <= 0) items = items.filter(i => i.slug !== slug);
    else items = items.map(i => i.slug === slug ? { ...i, qty } : i);
    Cart.write(items);
  },
  remove(slug) {
    Cart.write(Cart.read().filter(i => i.slug !== slug));
  },
  clear() { Cart.write([]); },
  total() {
    return Cart.read().reduce((sum, i) => sum + i.price * i.qty, 0);
  },
  count() {
    return Cart.read().reduce((sum, i) => sum + i.qty, 0);
  }
};

function updateCartBadge() {
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = Cart.count();
  });
}

/* ---------- nav mobile toggle ---------- */
function initNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display = open ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = 'var(--nav-h)';
    links.style.left = 0;
    links.style.right = 0;
    links.style.background = 'var(--linen)';
    links.style.padding = '20px 28px';
    links.style.borderBottom = '1px solid var(--line)';
  });
}

/* ---------- material rail (fills marquee content) ---------- */
function initMaterialRail() {
  const track = document.querySelector('[data-material-rail]');
  if (!track) return;
  const materials = ['Solid Mahogany', 'Brass Vilakku', 'Cotton Bed Spread', 'Engineered Wood Wardrobe', 'Fabric Sofa', 'Foam Mattress', 'Solid Teakwood', 'Brass Pooja Items'];
  const loopContent = materials.concat(materials).map(m => `<span>${m}</span>`).join('');
  track.innerHTML = loopContent;
}

/* ---------- scroll reveal (Intersection Observer) ---------- */
function initScrollReveal() {
  const targets = document.querySelectorAll('.product-card, .cat-card');
  if (!('IntersectionObserver' in window) || targets.length === 0) {
    targets.forEach(t => t.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(t => observer.observe(t));
}

/* ---------- newsletter form (footer, present on every page) ---------- */
function initNewsletterForm() {
  const form = document.querySelector('[data-newsletter-form]');
  if (!form) return;
  const msg = form.querySelector('.form-msg');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value.trim();
    msg.textContent = '';
    msg.className = 'form-msg';
    try {
      const data = await api('/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
      msg.textContent = data.message;
      msg.classList.add('ok');
      form.reset();
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add('err');
    }
  });
}

/* ---------- price formatting (INR) ---------- */
function formatPrice(n) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

/* ---------- product card renderer (used on home + products page) ---------- */
function productCardHtml(p) {
  const hasSale = p.compare_at_price && p.compare_at_price > p.price;
  return `
  <article class="product-card">
    <div class="product-media">
      ${hasSale ? `<span class="product-tag">Save ${formatPrice(p.compare_at_price - p.price)}</span>` : ''}
      <a href="product.html?slug=${p.slug}"><img src="${p.image}" alt="${p.name}" loading="lazy"></a>
      <div class="product-quick">
        <button type="button" title="Add to cart" data-add-to-cart='${JSON.stringify({ slug: p.slug, name: p.name, price: p.price, image: p.image })}'>+</button>
        <a href="product.html?slug=${p.slug}" title="View details" style="width:36px;height:36px;border-radius:50%;background:var(--white);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;">→</a>
      </div>
    </div>
    <div class="product-body">
      <div class="product-cat">${p.category} · ${p.material}</div>
      <h3 class="product-name"><a href="product.html?slug=${p.slug}">${p.name}</a></h3>
      <div class="product-price">
        <span class="price-now">${formatPrice(p.price)}</span>
        ${hasSale ? `<span class="price-was">${formatPrice(p.compare_at_price)}</span>` : ''}
      </div>
    </div>
  </article>`;
}

/* delegate add-to-cart clicks anywhere on the page */
function initAddToCartDelegation() {
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    const { slug, name, price, image } = JSON.parse(btn.dataset.addToCart);
    Cart.add(slug, name, price, image, 1);
    btn.textContent = '✓';
    setTimeout(() => { btn.textContent = '+'; }, 900);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMaterialRail();
  updateCartBadge();
  initNewsletterForm();
  initAddToCartDelegation();
  initScrollReveal();
});
