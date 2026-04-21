// =============================================
// КОРЗИНА — модальное окно + оплата
// =============================================

function buildCartModal() {
  if (document.getElementById('cart-modal-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'cart-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" id="cart-modal">
      <div class="modal-header">
        <h2>🛒 Ваш заказ</h2>
        <button class="modal-close" onclick="closeCart()">×</button>
      </div>
      <div id="cart-body"></div>
    </div>
  `;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeCart(); });
  document.body.appendChild(overlay);
}

function openCart() {
  buildCartModal();
  renderCartBody();
  document.getElementById('cart-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const overlay = document.getElementById('cart-modal-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderCartBody() {
  const cart = getCart();
  const body = document.getElementById('cart-body');
  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = `<div class="cart-empty">🍽️<br>Ваша корзина пуста.<br><br><button class="btn btn-primary" onclick="closeCart()" style="border:none;cursor:pointer">Перейти в меню</button></div>`;
    return;
  }

  const itemsHtml = cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <div class="cart-item-name">${item.name}</div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="cartQty(${item.id}, -1)">−</button>
        <span class="qty-num" id="qty-${item.id}">${item.qty}</span>
        <button class="qty-btn" onclick="cartQty(${item.id}, 1)">+</button>
      </div>
      <div class="cart-item-price" id="price-${item.id}">${(item.price * item.qty).toLocaleString('ru')}₽</div>
      <button class="cart-remove" onclick="cartRemove(${item.id})" title="Удалить">🗑</button>
    </div>
  `).join('');

  const total = getCartTotal();

  body.innerHTML = `
    ${itemsHtml}
    <div class="cart-footer">
      <div class="cart-total">Итого: <span>${total.toLocaleString('ru')}₽</span></div>
      <div class="payment-form">
        <h3>💳 Способ оплаты</h3>
        <div class="payment-tabs">
          <button class="pay-tab active" onclick="switchPayTab('card', this)">💳 Карта</button>
          <button class="pay-tab" onclick="switchPayTab('sbp', this)">⚡ СБП</button>
          <button class="pay-tab" onclick="switchPayTab('cash', this)">💵 Наличные</button>
        </div>

        <!-- Карта -->
        <div class="payment-section active" id="pay-card">
          <div class="form-group">
            <label>Номер карты</label>
            <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19" oninput="formatCard(this)">
          </div>
          <div class="form-group">
            <label>Имя на карте</label>
            <input type="text" id="card-name" placeholder="IVAN IVANOV" style="text-transform:uppercase">
          </div>
          <div class="card-row">
            <div class="form-group">
              <label>Срок действия</label>
              <input type="text" id="card-exp" placeholder="ММ/ГГ" maxlength="5" oninput="formatExp(this)">
            </div>
            <div class="form-group">
              <label>CVV</label>
              <input type="password" id="card-cvv" placeholder="•••" maxlength="3">
            </div>
          </div>
          <button class="pay-submit" onclick="submitPayment('card')">Оплатить ${total.toLocaleString('ru')}₽</button>
        </div>

        <!-- СБП -->
        <div class="payment-section" id="pay-sbp">
          <div class="sbp-info">
            <div class="sbp-icon">⚡</div>
            <p>Переведите сумму по номеру телефона через Систему Быстрых Платежей</p>
            <div class="sbp-phone">+7 (495) 123-45-67</div>
            <p style="margin-top:10px;font-size:13px;color:#999">Банк: Сбербанк / Тинькофф / любой банк-участник СБП</p>
          </div>
          <button class="pay-submit" onclick="submitPayment('sbp')">Подтвердить перевод ${total.toLocaleString('ru')}₽</button>
        </div>

        <!-- Наличные -->
        <div class="payment-section" id="pay-cash">
          <div class="cash-info">
            <div class="cash-icon">💵</div>
            <p>Оплата наличными при получении / посещении ресторана.</p>
            <p style="margin-top:10px">Пожалуйста, подготовьте <strong>${total.toLocaleString('ru')}₽</strong></p>
          </div>
          <button class="pay-submit" onclick="submitPayment('cash')">Оформить заказ</button>
        </div>
      </div>
    </div>
  `;
}

function cartQty(id, delta) {
  updateQty(id, delta);
  const cart = getCart();
  const item = cart.find(c => c.id == id);
  if (!item) return;
  const qtyEl = document.getElementById('qty-' + id);
  const priceEl = document.getElementById('price-' + id);
  if (qtyEl) qtyEl.textContent = item.qty;
  if (priceEl) priceEl.textContent = (item.price * item.qty).toLocaleString('ru') + '₽';
  refreshCartTotal();
}

function cartRemove(id) {
  removeFromCart(id);
  const el = document.getElementById('cart-item-' + id);
  if (el) el.remove();
  refreshCartTotal();
  if (getCart().length === 0) renderCartBody();
}

function refreshCartTotal() {
  const total = getCartTotal();
  const totalEl = document.querySelector('.cart-total span');
  if (totalEl) totalEl.textContent = total.toLocaleString('ru') + '₽';
  document.querySelectorAll('.pay-submit').forEach(btn => {
    btn.textContent = btn.textContent.replace(/[\d\s]+₽/, total.toLocaleString('ru') + '₽');
  });
}

function switchPayTab(tab, btn) {
  document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.payment-section').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  const section = document.getElementById('pay-' + tab);
  if (section) section.classList.add('active');
}

function formatCard(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
}

function formatExp(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
  input.value = v;
}

function submitPayment(method) {
  if (method === 'card') {
    const num = document.getElementById('card-number').value.replace(/\s/g, '');
    const name = document.getElementById('card-name').value.trim();
    const exp = document.getElementById('card-exp').value;
    const cvv = document.getElementById('card-cvv').value;
    if (num.length < 16) { alert('Введите корректный номер карты'); return; }
    if (!name) { alert('Введите имя владельца карты'); return; }
    if (exp.length < 5) { alert('Введите срок действия карты'); return; }
    if (cvv.length < 3) { alert('Введите CVV код'); return; }
  }

  const total = getCartTotal();
  const methodNames = { card: 'картой', sbp: 'через СБП', cash: 'наличными' };

  // Clear cart
  saveCart([]);

  // Show success
  const body = document.getElementById('cart-body');
  const orderNum = Math.floor(Math.random() * 9000) + 1000;
  body.innerHTML = `
    <div class="order-success">
      <div class="success-icon">🎉</div>
      <h3>Заказ оформлен!</h3>
      <p>Ваш заказ №${orderNum} на сумму <strong>${total.toLocaleString('ru')}₽</strong><br>принят и будет оплачен ${methodNames[method]}.</p>
      <p style="margin-top:15px;color:#999;font-size:14px">Ожидайте подтверждения по телефону или email</p>
      <button class="btn btn-primary" style="margin-top:25px;border:none;cursor:pointer" onclick="closeCart()">Отлично!</button>
    </div>
  `;
}

// Floating cart button
document.addEventListener('DOMContentLoaded', () => {
  const fc = document.createElement('button');
  fc.className = 'floating-cart';
  fc.innerHTML = `🛒 Корзина <span class="floating-cart-count" id="floating-count">0</span>`;
  fc.onclick = openCart;
  document.body.appendChild(fc);

  // Keyboard close
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  function updateFloating() {
    const count = getCartCount();
    const el = document.getElementById('floating-count');
    if (el) el.textContent = count;
    fc.style.display = count > 0 ? 'flex' : 'none';
  }
  updateFloating();

  // Watch cart changes
  const origSave = saveCart;
  window._cartObservers = window._cartObservers || [];
  window._cartObservers.push(updateFloating);
});

// Override saveCart to notify observers
const _origSaveCart = saveCart;
window.saveCart = function(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  if (window._cartObservers) window._cartObservers.forEach(fn => fn());
};
