function renderCart() {
  const items = Cart.read();
  const hasItems = document.getElementById('cart-has-items');
  const empty = document.getElementById('cart-empty');
  const rows = document.getElementById('cart-rows');

  if (items.length === 0) {
    hasItems.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  hasItems.style.display = 'block';
  empty.style.display = 'none';

  rows.innerHTML = items.map(i => `
    <tr data-slug="${i.slug}">
      <td>
        <div class="cart-item-info">
          <img src="${i.image}" alt="${i.name}">
          <div>
            <div class="name">${i.name}</div>
            <div class="material"><a href="product.html?slug=${i.slug}">View product</a></div>
          </div>
        </div>
      </td>
      <td>${formatPrice(i.price)}</td>
      <td>
        <div class="qty-inline">
          <button type="button" data-qty-minus>−</button>
          <input type="text" value="${i.qty}" readonly>
          <button type="button" data-qty-plus>+</button>
        </div>
      </td>
      <td>${formatPrice(i.price * i.qty)}</td>
      <td><button type="button" class="remove-link" data-remove>Remove</button></td>
    </tr>`).join('');

  document.getElementById('cart-subtotal').textContent = formatPrice(Cart.total());
  document.getElementById('cart-total').textContent = formatPrice(Cart.total());
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();

  document.getElementById('cart-rows').addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (!row) return;
    const slug = row.dataset.slug;
    const item = Cart.read().find(i => i.slug === slug);
    if (!item) return;

    if (e.target.matches('[data-qty-plus]')) Cart.updateQty(slug, item.qty + 1);
    if (e.target.matches('[data-qty-minus]')) Cart.updateQty(slug, item.qty - 1);
    if (e.target.matches('[data-remove]')) Cart.remove(slug);

    renderCart();
  });
});
