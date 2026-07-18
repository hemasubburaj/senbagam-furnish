function renderOrderSummary() {
  const items = Cart.read();
  const linesEl = document.getElementById('order-lines');
  linesEl.innerHTML = items.map(i => `
    <div class="order-line"><span>${i.name} × ${i.qty}</span><span>${formatPrice(i.price * i.qty)}</span></div>
  `).join('');
  document.getElementById('order-total').textContent = formatPrice(Cart.total());
}

document.addEventListener('DOMContentLoaded', () => {
  if (Cart.read().length === 0) {
    window.location.href = 'cart.html';
    return;
  }
  renderOrderSummary();

  document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('checkout-error');
    errorEl.textContent = '';

    
      const payload = {
  customer_name: document.getElementById('customer_name').value.trim(),
  customer_email: document.getElementById('customer_email').value.trim(),
  customer_phone: document.getElementById('customer_phone').value.trim(),
  address: document.getElementById('address').value.trim(),
  items: Cart.read().map(i => ({ slug: i.slug, qty: i.qty }))
};

    const btn = document.getElementById('place-order-btn');
    btn.disabled = true;
    btn.textContent = 'Placing order…';

    try {
      const order = await api('/orders', { method: 'POST', body: JSON.stringify(payload) });
      Cart.clear();
      document.getElementById('checkout-form-wrap').style.display = 'none';
      document.getElementById('checkout-success').style.display = 'block';
      document.getElementById('success-name').textContent = payload.customer_name;
      document.getElementById('success-id').textContent = order.orderId;
      document.getElementById('success-email').textContent = payload.customer_email;
    } catch (err) {
      errorEl.textContent = err.message;
      btn.disabled = false;
      btn.textContent = 'Place order';
    }
  });
});
