// ===== CART PAGE =====
async function renderCart(app) {
  if (!currentUser) { showToast('Please login first'); navigate('login'); return; }
  let cart = { items: [], total: 0 };
  try { cart = await api('/api/products/cart/items'); } catch(e) {}

  if (cart.items.length === 0) {
    app.innerHTML = `<div class="cart-page"><div class="container" style="text-align:center;padding:120px 0">
      <h2 style="margin-bottom:16px">Your Cart is Empty</h2>
      <p style="color:var(--text3);margin-bottom:32px">Explore our premium grooming products</p>
      <button class="btn btn-primary" data-page="shop">Browse Shop</button>
    </div></div>${renderFooter()}`;
    return;
  }

  app.innerHTML = `<div class="cart-page"><div class="container">
    <h2 style="margin-bottom:32px">Shopping Cart (${cart.items.length})</h2>
    <div class="cart-layout">
      <div>${cart.items.map(it => `<div class="cart-item" id="cart-item-${it.id}">
        <div class="item-img">${imgOrPh(it.image, it.name)}</div>
        <div class="item-info">
          <h3>${it.name}</h3>
          <div class="cat">${it.category}</div>
          <div class="qty-control">
            <button onclick="updateCartQty(${it.id},${it.quantity-1})">−</button>
            <span>${it.quantity}</span>
            <button onclick="updateCartQty(${it.id},${it.quantity+1})">+</button>
          </div>
        </div>
        <div style="text-align:right">
          <div class="item-price">$${(it.price*it.quantity).toFixed(2)}</div>
          <button class="remove-btn" onclick="removeCartItem(${it.id})">Remove</button>
        </div>
      </div>`).join('')}</div>
      <div class="cart-summary">
        <h3>Order Summary</h3>
        <div class="summary-row"><span class="lbl">Subtotal</span><span class="val">$${cart.total.toFixed(2)}</span></div>
        <div class="summary-row"><span class="lbl">Shipping</span><span class="val">Free</span></div>
        <div class="summary-total"><span>Total</span><span>$${cart.total.toFixed(2)}</span></div>
        <button class="btn btn-primary" style="width:100%;margin-top:16px" data-page="checkout">Proceed to Checkout</button>
        <button class="btn btn-outline" style="width:100%;margin-top:8px" data-page="shop">Continue Shopping</button>
      </div>
    </div>
  </div></div>${renderFooter()}`;
}

async function updateCartQty(id, qty) {
  try {
    await api('/api/products/cart/' + id, { method: 'PUT', body: { quantity: qty } });
    renderCart(document.getElementById('app'));
  } catch(e) { showToast(e.message); }
}
async function removeCartItem(id) {
  try {
    await api('/api/products/cart/' + id, { method: 'DELETE' });
    showToast('Removed from cart');
    renderCart(document.getElementById('app'));
  } catch(e) { showToast(e.message); }
}

// ===== CHECKOUT PAGE =====
async function renderCheckout(app) {
  if (!currentUser) { navigate('login'); return; }
  let cart = { items: [], total: 0 };
  try { cart = await api('/api/products/cart/items'); } catch(e) {}
  const fee = 2.50;
  const total = cart.total + fee;

  app.innerHTML = `<div class="booking-page"><div class="container">
    <h2 style="color:var(--gold);font-size:1.8rem;margin-bottom:8px">Secure Checkout</h2>
    <p style="color:var(--text3);margin-bottom:32px">Confirm your order and provide payment information below.</p>
    <div class="checkout-layout">
      <div class="payment-card">
        <h3>🔒 Payment Method</h3>
        <div class="payment-methods">
          <div class="payment-method active">💳 Credit Card</div>
          <div class="payment-method" onclick="showToast('Apple Pay coming soon')">🍎 Apple Pay</div>
        </div>
        <div class="form-group"><label>Cardholder Name</label><input class="form-input" placeholder="Your name" id="card-name"></div>
        <div class="form-group"><label>Card Number</label><input class="form-input" placeholder="1234 5678 9012 3456" id="card-num" maxlength="19"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div class="form-group"><label>Expiry Date</label><input class="form-input" placeholder="MM/YY" id="card-exp"></div>
          <div class="form-group"><label>CVV</label><input class="form-input" placeholder="123" id="card-cvv" maxlength="3"></div>
        </div>
        <div class="remember-row"><input type="checkbox"><label>Save card for future orders at IRON & GOLD.</label></div>
      </div>
      <div>
        <div class="appointment-card">
          <div class="card-header"><div><div class="apt-badge">Order Summary</div><div class="studio-name">Iron & Gold Shop</div></div></div>
          <div class="card-body">
            ${cart.items.map(it => `<div class="cost-row"><span>${it.name} x${it.quantity}</span><span>$${(it.price*it.quantity).toFixed(2)}</span></div>`).join('')}
            <div class="cost-row"><span>Shipping</span><span>Free</span></div>
            <div class="cost-row"><span>Processing Fee</span><span>$${fee.toFixed(2)}</span></div>
            <div class="total-row"><span>Total</span><span>$${total.toFixed(2)}</span></div>
            <button class="confirm-btn" onclick="placeOrder()">✓ Confirm & Pay $${total.toFixed(2)}</button>
            <p class="checkout-disclaimer">By clicking "Confirm & Pay", you agree to our terms of service.</p>
          </div>
        </div>
        <div class="security-badges"><span>🛡 PCI Secure</span><span>🔒 SSL Encrypted</span></div>
      </div>
    </div>
  </div></div>${renderFooter()}`;
}

async function placeOrder() {
  try {
    const data = await api('/api/products/cart/checkout', { method: 'POST', body: { shipping_address: 'Default' } });
    showToast('Order placed! Order #' + data.orderId);
    navigate('home');
  } catch(e) { showToast(e.message); }
}
