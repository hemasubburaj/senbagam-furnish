let allCategories = [];
let currentCategory = new URLSearchParams(location.search).get('category') || '';
let currentQuery = '';
let searchDebounce;

async function loadCategories() {
  try {
    allCategories = await api('/products/categories');
  } catch { allCategories = []; }
  const bar = document.querySelector('[data-filter-bar]');
  allCategories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-chip' + (cat === currentCategory ? ' active' : '');
    btn.textContent = cat;
    btn.dataset.filter = cat;
    bar.appendChild(btn);
  });
  if (!currentCategory) bar.querySelector('.filter-chip').classList.add('active');

  bar.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentCategory = chip.dataset.filter;
    loadProducts();
  });
}

async function loadProducts() {
  const list = document.querySelector('[data-product-list]');
  const empty = document.getElementById('empty-state');
  const params = new URLSearchParams();
  if (currentCategory) params.set('category', currentCategory);
  if (currentQuery) params.set('q', currentQuery);

  try {
    const products = await api(`/products?${params.toString()}`);
    list.innerHTML = products.map(productCardHtml).join('');
    empty.style.display = products.length === 0 ? 'block' : 'none';
  } catch {
    list.innerHTML = '<p class="lede">Could not load products right now.</p>';
  }
  initScrollReveal();
}

document.addEventListener('DOMContentLoaded', () => {
  loadCategories().then(loadProducts);
  document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      currentQuery = e.target.value.trim();
      loadProducts();
    }, 250);
  });
});
