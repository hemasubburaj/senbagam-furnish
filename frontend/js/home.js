/* ---------- hero slider ---------- */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsWrap = document.querySelector('[data-hero-dots]');
  if (!slides.length) return;
  let active = 0;

  slides.forEach((s, i) => {
    const dot = document.createElement('button');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => show(i));
    dotsWrap.appendChild(dot);
  });

  function show(i) {
    slides[active].classList.remove('active');
    dotsWrap.children[active].classList.remove('active');
    active = i;
    slides[active].classList.add('active');
    dotsWrap.children[active].classList.add('active');
  }

  setInterval(() => show((active + 1) % slides.length), 5000);
}

/* ---------- featured products ---------- */
async function renderFeatured() {
  const el = document.querySelector('[data-featured-products]');
  if (!el) return;
  try {
    const products = await api('/products?featured=1');
    el.innerHTML = products.map(productCardHtml).join('');
  } catch {
    el.innerHTML = '<p class="lede">Could not load products right now.</p>';
  }
  initScrollReveal();
}

/* ---------- categories ---------- */
async function renderCategoryStrip() {
  const el = document.querySelector('[data-category-strip]');
  if (!el) return;
  try {
    const products = await api('/products');
    const counts = {};
    products.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    el.innerHTML = Object.entries(counts).map(([cat, count]) => `
      <a class="cat-card" data-count="${count} pieces" href="products.html?category=${encodeURIComponent(cat)}">
        <h3>${cat}</h3>
      </a>`).join('');
  } catch { /* silently skip */ }
  initScrollReveal();
}

/* ---------- testimonials ---------- */
async function renderTestimonials() {
  const el = document.querySelector('[data-testimonials]');
  if (!el) return;
  try {
    const items = await api('/testimonials');
    el.innerHTML = items.map(t => `
      <div class="testimonial-card">
        <div class="testimonial-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
        <p class="testimonial-quote">"${t.quote}"</p>
        <div class="testimonial-name">${t.name}</div>
        <div class="testimonial-role">${t.role}</div>
      </div>`).join('');
  } catch { /* silently skip */ }
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  renderFeatured();
  renderCategoryStrip();
  renderTestimonials();
});

/* ---------- categories ---------- */
async function renderCategoryStrip() {
  const el = document.querySelector('[data-category-strip]');
  if (!el) return;
  try {
    const products = await api('/products');
    const counts = {};
    const images = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
      if (!images[p.category]) images[p.category] = p.image; // first product's image represents the category
    });
    el.innerHTML = Object.entries(counts).map(([cat, count]) => `
      <a class="cat-card" data-count="${count} pieces" href="products.html?category=${encodeURIComponent(cat)}">
        <img class="cat-card-img" src="${images[cat]}" alt="${cat}" loading="lazy">
        <h3>${cat}</h3>
      </a>`).join('');
  } catch { /* silently skip */ }
  initScrollReveal();
}