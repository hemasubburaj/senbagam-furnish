const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('track-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('track-error');
    const resultEl = document.getElementById('order-result');
    errorEl.textContent = '';
    resultEl.style.display = 'none';

    const orderId = document.getElementById('track-order-id').value.trim();
    const email = document.getElementById('track-email').value.trim();

    const btn = document.getElementById('track-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Looking up…';

    try {
      const order = await api(`/orders/${encodeURIComponent(orderId)}?email=${encodeURIComponent(email)}`);
      renderOrder(order);
      resultEl.style.display = 'block';
    } catch (err) {
      errorEl.textContent = err.message || 'Could not find that order.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Track order';
    }
  });
});

function renderOrder(order) {
  document.getElementById('res-id').textContent = order.id;
  document.getElementById('res-date').textContent = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('res-total').textContent = formatPrice(order.total);

  const pill = document.getElementById('res-status-pill');
  pill.textContent = order.status;

  document.getElementById('res-items').innerHTML = order.items.map(i => `
    <div class="order-line"><span>${i.name} × ${i.qty}</span><span>${formatPrice(i.price * i.qty)}</span></div>
  `).join('');

  const track = document.getElementById('status-track');
  if (order.status === 'cancelled') {
    track.classList.add('cancelled');
    track.querySelectorAll('.status-step').forEach(s => s.classList.remove('done'));
    pill.style.background = '#F5D9D9';
    pill.style.color = '#B23A3A';
  } else {
    track.classList.remove('cancelled');
    const currentIndex = STATUS_STEPS.indexOf(order.status);
    track.querySelectorAll('.status-step').forEach((step, i) => {
      step.classList.toggle('done', i <= currentIndex);
    });
  }
}