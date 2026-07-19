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

    const customerName = document.getElementById('customer_name').value.trim();
    const customerEmail = document.getElementById('customer_email').value.trim();
    const customerPhone = document.getElementById('customer_phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const items = Cart.read().map(i => ({ slug: i.slug, qty: i.qty }));

    const btn = document.getElementById('place-order-btn');
    btn.disabled = true;
    btn.textContent = 'Starting payment…';

    try {
      const paymentOrder = await api('/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({ items })
      });

      const rzp = new Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Senbagam Furniture',
        description: 'Order payment',
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        theme: { color: '#23301F' },
        handler: async function (response) {
          btn.textContent = 'Confirming order…';
          try {
            const order = await api('/payment/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                address,
                items
              })
            });
            showSuccess(order, customerName, customerEmail);
          } catch (err) {
            errorEl.textContent = err.message || 'Payment succeeded but order confirmation failed. Contact us with your payment ID: ' + response.razorpay_payment_id;
            btn.disabled = false;
            btn.textContent = 'Place order';
          }
        },
        modal: {
          ondismiss: function () {
            btn.disabled = false;
            btn.textContent = 'Place order';
          }
        }
      });

      rzp.on('payment.failed', function (response) {
        errorEl.textContent = 'Payment failed: ' + response.error.description;
        btn.disabled = false;
        btn.textContent = 'Place order';
      });

      rzp.open();
    } catch (err) {
      errorEl.textContent = err.message || 'Could not start payment.';
      btn.disabled = false;
      btn.textContent = 'Place order';
    }
  });
});