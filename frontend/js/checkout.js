const UPI_ID = 'yourupiid@okhdfcbank'; // <-- CHANGE THIS to your real UPI ID (e.g. 9876543210@okicici)

function renderOrderSummary() {
  const items = Cart.read();
  const linesEl = document.getElementById('order-lines');
  linesEl.innerHTML = items.map(i => `
    <div class="order-line"><span>${i.name} × ${i.qty}</span><span>${formatPrice(i.price * i.qty)}</span></div>
  `).join('');
  document.getElementById('order-total').textContent = formatPrice(Cart.total());
}

function showSuccess(order, customerName, customerEmail) {
  Cart.clear();
  document.getElementById('checkout-form-wrap').style.display = 'none';
  document.getElementById('checkout-success').style.display = 'block';
  document.getElementById('success-name').textContent = customerName;
  document.getElementById('success-id').textContent = order.orderId;
  document.getElementById('success-email').textContent = customerEmail;
}

function updateUpiBox() {
  const selected = document.querySelector('input[name="payment_method"]:checked').value;
  const upiBox = document.getElementById('upi-box');
  document.getElementById('option-cod').classList.toggle('selected', selected === 'COD');
  document.getElementById('option-upi').classList.toggle('selected', selected === 'UPI');

  if (selected === 'UPI') {
    const amount = Cart.total().toFixed(2);
    const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent('Senbagam Furniture')}&am=${amount}&cu=INR`;
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
    document.getElementById('upi-qr-img').src = qrImgUrl;
    document.getElementById('upi-id-display').textContent = UPI_ID;
    upiBox.style.display = 'block';
  } else {
    upiBox.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (Cart.read().length === 0) {
    window.location.href = 'cart.html';
    return;
  }
  renderOrderSummary();
  updateUpiBox();

  document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
    radio.addEventListener('change', updateUpiBox);
  });

  document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('checkout-error');
    errorEl.textContent = '';

    const payload = {
      customer_name: document.getElementById('customer_name').value.trim(),
      customer_email: document.getElementById('customer_email').value.trim(),
      customer_phone: document.getElementById('customer_phone').value.trim(),
      address: document.getElementById('address').value.trim(),
      payment_method: document.querySelector('input[name="payment_method"]:checked').value,
      items: Cart.read().map(i => ({ slug: i.slug, qty: i.qty }))
    };

    const btn = document.getElementById('place-order-btn');
    btn.disabled = true;
    btn.textContent = 'Placing order…';

    try {
      const order = await api('/orders', { method: 'POST', body: JSON.stringify(payload) });
      showSuccess(order, payload.customer_name, payload.customer_email);
    } catch (err) {
      errorEl.textContent = err.message || 'Could not place order.';
      btn.disabled = false;
      btn.textContent = 'Place order';
    }
  });
});
