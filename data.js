// =============================================
// ДАННЫЕ МЕНЮ — редактируются через админку
// =============================================
const MENU_DATA_KEY = 'uyutniy_menu';
const CART_KEY = 'uyutniy_cart';

const DEFAULT_MENU = {
  categories: [
    { id: 'zakuski', name: '🥗 Закуски', emoji: '🥗' },
    { id: 'main', name: '🍖 Основные блюда', emoji: '🍖' },
    { id: 'desserts', name: '🍰 Десерты', emoji: '🍰' },
    { id: 'drinks', name: '🍷 Напитки', emoji: '🍷' }
  ],
  items: [
    { id: 1, category: 'zakuski', name: 'Брускетта с томатами', desc: 'Хрустящий багет, свежие томаты, чеснок, базилик, оливковое масло', price: 450, image: 'images/брускетта.jpg' },
    { id: 2, category: 'zakuski', name: 'Сырная тарелка', desc: 'Пармезан, дорблю, камамбер, грецкие орехи, виноград', price: 750, image: 'images/сырная-тарелка.jpg' },
    { id: 3, category: 'main', name: 'Стейк Рибай 300г', desc: 'Мраморная говядина, травы, соус песто, картофель фри', price: 1850, image: 'images/стейк-рибай.jpg' },
    { id: 4, category: 'main', name: 'Филе миньон с трюфелем', desc: 'Вырезка, трюфельный соус, овощи гриль, картофельное пюре', price: 2200, image: 'images/филе-миньон.jpg' },
    { id: 5, category: 'main', name: 'Лосось на гриле', desc: 'Свежий лосось, лимон, укроп, овощи, рис басмати', price: 1450, image: 'images/лосось-гриль.jpg' },
    { id: 6, category: 'main', name: 'Паста Карбонара', desc: 'Спагетти, панчетта, яичный желток, пармезан, перец', price: 890, image: 'images/паста-карбонара.jpg' },
    { id: 7, category: 'desserts', name: 'Тирамису', desc: 'Классический итальянский десерт с кофе и маскарпоне', price: 450, image: 'images/тирамису.jpg' },
    { id: 8, category: 'desserts', name: 'Нью-Йорк чизкейк', desc: 'Сливочный чизкейк с ягодным соусом', price: 490, image: 'images/чизкейк.jpg' },
    { id: 9, category: 'desserts', name: 'Медовик', desc: 'Традиционный медовик с сливочным кремом', price: 390, image: 'images/медовик.jpg' },
    { id: 10, category: 'drinks', name: 'Вино красное (бокал)', desc: 'Каберне Совиньон, Мерло, Пино Нуар', price: 450, image: '' },
    { id: 11, category: 'drinks', name: 'Вино белое (бокал)', desc: 'Шардоне, Совиньон Блан, Рислинг', price: 450, image: '' },
    { id: 12, category: 'drinks', name: 'Крафтовое пиво', desc: 'IPA, Stout, Wheat Beer (0.5л)', price: 350, image: '' },
    { id: 13, category: 'drinks', name: 'Авторские коктейли', desc: 'Мохито, Космополитан, Олд Фэшн', price: 550, image: '' }
  ]
};

function getMenu() {
  try {
    const stored = localStorage.getItem(MENU_DATA_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_MENU;
  } catch { return DEFAULT_MENU; }
}

function saveMenu(data) {
  localStorage.setItem(MENU_DATA_KEY, JSON.stringify(data));
}

// Корзина
function getCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(itemId) {
  const menu = getMenu();
  const item = menu.items.find(i => i.id == itemId);
  if (!item) return;
  const cart = getCart();
  const existing = cart.find(c => c.id == itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
  }
  saveCart(cart);
  showCartNotification(item.name);
}

function removeFromCart(itemId) {
  const cart = getCart().filter(c => c.id != itemId);
  saveCart(cart);
}

function updateQty(itemId, delta) {
  const cart = getCart();
  const item = cart.find(c => c.id == itemId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = getCartCount();
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

function showCartNotification(name) {
  const existing = document.getElementById('cart-notify');
  if (existing) existing.remove();
  const n = document.createElement('div');
  n.id = 'cart-notify';
  n.innerHTML = `✅ «${name}» добавлен в корзину`;
  n.style.cssText = `position:fixed;bottom:80px;right:20px;background:#667eea;color:white;padding:12px 20px;border-radius:10px;font-size:14px;z-index:9999;box-shadow:0 4px 15px rgba(0,0,0,0.2);animation:slideIn 0.3s ease`;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 2500);
}

document.addEventListener('DOMContentLoaded', updateCartBadge);
