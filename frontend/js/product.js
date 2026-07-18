let currentProduct = null;
let qty = 1;

// combo state
let comboCategoryProducts = {};   // category -> [products]
let comboSelections = {};          // slotLabel -> product object

function setQty(n) {
  qty = Math.max(1, n);
  document.getElementById('pd-qty-value').value = qty;
}

async function loadProduct() {
  const slug = new URLSearchParams(location.search).get('slug');
  const loading = document.getElementById('pd-loading');
  const content = document.getElementById('pd-content');
  const notfound = document.getElementById('pd-notfound');

  if (!slug) { loading.style.display = 'none'; notfound.style.display = 'block'; return; }

  try {
    currentProduct = await api(`/products/${encodeURIComponent(slug)}`);
    const p = currentProduct;
    document.getElementById('pd-image').src = p.image;
    document.getElementById('pd-image').alt = p.name;
    document.getElementById('pd-category').textContent = p.category;
    document.getElementById('pd-name').textContent = p.name;
    document.getElementById('pd-material').textContent = p.material;
    document.getElementById('pd-stock').textContent = p.stock > 0 ? `${p.stock} in stock` : 'Out of stock';
    document.getElementById('pd-price').textContent = formatPrice(p.price);
    document.getElementById('pd-compare').textContent = p.compare_at_price ? formatPrice(p.compare_at_price) : '';
    document.getElementById('pd-description').textContent = p.description;
    document.title = `${p.name} — Senbagam Furniture`;

    loading.style.display = 'none';
    content.style.display = 'grid';

    if (Array.isArray(p.comboItems) && p.comboItems.length > 0) {
      // combo product: hide the plain qty/add-to-cart, show the swap builder instead
      document.querySelector('.pd-actions').style.display = 'none';
      await initComboBuilder(p.comboItems);
    }
  } catch {
    loading.style.display = 'none';
    notfound.style.display = 'block';
  }
}

/* ---------- combo customizer ---------- */
async function initComboBuilder(slots) {
  const builder = document.getElementById('combo-builder');
  const slotsEl = document.getElementById('combo-slots');
  builder.style.display = 'block';

  // fetch each distinct option type once (e.g. "Cot", "Wardrobe", "Sofa" —
  // NOT the broad Bedroom/Living Room/Pooja category, so a Cot slot only
  // ever offers other cots, never a wardrobe)
  const types = [...new Set(slots.map(s => s.optionType))];
  await Promise.all(types.map(async (t) => {
    if (!comboCategoryProducts[t]) {
      comboCategoryProducts[t] = await api(`/products?type=${encodeURIComponent(t)}`);
    }
  }));

  slotsEl.innerHTML = slots.map((slot, i) => `
    <div class="combo-slot" data-slot="${slot.slotLabel}">
      <span class="combo-slot-label">${slot.slotLabel}</span>
      <select class="combo-slot-select" data-slot-select="${i}"></select>
      <span class="combo-slot-price" data-slot-price="${i}"></span>
    </div>`).join('');

  slots.forEach((slot, i) => {
    const options = comboCategoryProducts[slot.optionType] || [];
    const select = slotsEl.querySelector(`[data-slot-select="${i}"]`);
    select.innerHTML = options.map(opt =>
      `<option value="${opt.slug}" ${opt.slug === slot.defaultSlug ? 'selected' : ''}>${opt.name} — ${formatPrice(opt.price)}</option>`
    ).join('');

    const defaultProduct = options.find(o => o.slug === slot.defaultSlug) || options[0];
    comboSelections[slot.slotLabel] = defaultProduct;
    updateSlotPrice(i, defaultProduct);

    select.addEventListener('change', () => {
      const chosen = options.find(o => o.slug === select.value);
      comboSelections[slot.slotLabel] = chosen;
      updateSlotPrice(i, chosen);
      updateComboTotal();
    });
  });

  updateComboTotal();
}

function updateSlotPrice(index, product) {
  const el = document.querySelector(`[data-slot-price="${index}"]`);
  if (el && product) el.textContent = formatPrice(product.price);
}

function updateComboTotal() {
  const total = Object.values(comboSelections).reduce((sum, p) => sum + (p ? p.price : 0), 0);
  document.getElementById('combo-total').textContent = formatPrice(total);
}

document.addEventListener('DOMContentLoaded', () => {
  loadProduct();

  document.getElementById('pd-qty-minus').addEventListener('click', () => setQty(qty - 1));
  document.getElementById('pd-qty-plus').addEventListener('click', () => setQty(qty + 1));
  document.getElementById('pd-add-btn').addEventListener('click', () => {
    if (!currentProduct) return;
    Cart.add(currentProduct.slug, currentProduct.name, currentProduct.price, currentProduct.image, qty);
    const msg = document.getElementById('pd-added-msg');
    msg.textContent = `Added ${qty} × ${currentProduct.name} to your cart.`;
    setTimeout(() => { msg.textContent = ''; }, 2500);
  });

  document.getElementById('combo-add-btn').addEventListener('click', () => {
    Object.values(comboSelections).forEach(product => {
      if (product) Cart.add(product.slug, product.name, product.price, product.image, 1);
    });
    const msg = document.getElementById('combo-added-msg');
    msg.textContent = `Added your customized ${currentProduct.name} to the cart (${Object.keys(comboSelections).length} items).`;
    setTimeout(() => { msg.textContent = ''; }, 3000);
  });
});
