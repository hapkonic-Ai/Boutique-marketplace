/* =========================================================
   Little Bloom Atelier — shared layout, store & interactions
   Loaded on every page after data.js
   ========================================================= */
(() => {
  const LB = window.LB;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const page = document.body.dataset.page || '';
  Object.assign(LB, { $, $$, lerp, clamp, reduced, fine, page });

  /* ---------- Storage (safe: works in private mode too) ---------- */
  const mem = {};
  LB.get = (k, d) => { try { const v = localStorage.getItem('lb:' + k); return v ? JSON.parse(v) : d; } catch { return k in mem ? mem[k] : d; } };
  LB.set = (k, v) => { mem[k] = v; try { localStorage.setItem('lb:' + k, JSON.stringify(v)); } catch {} };

  /* ---------- Money & currency ---------- */
  const RATES = { INR: [1, '₹'], USD: [0.012, '$'], AED: [0.044, 'AED '], GBP: [0.0095, '£'] };
  LB.currency = LB.get('currency', 'INR');
  LB.money = n => {
    const [rate, sym] = RATES[LB.currency] || RATES.INR;
    if (LB.currency === 'INR') return '₹' + Math.round(n).toLocaleString('en-IN');
    return sym + (n * rate).toFixed(2);
  };

  LB.byId = id => LB.products.find(p => p.id === id);
  LB.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  LB.param = k => new URLSearchParams(location.search).get(k);

  /* ---------- Cart & wishlist ---------- */
  LB.cart = () => LB.get('cart', []);
  LB.wish = () => LB.get('wish', []);
  const emit = () => document.dispatchEvent(new CustomEvent('lb:change'));

  LB.addToCart = (id, size, qty = 1, colour) => {
    const p = LB.byId(id); if (!p) return;
    size = size || p.sizes[0];
    colour = colour || p.colours[0].name;
    const cart = LB.cart();
    const line = cart.find(l => l.id === id && l.size === size && l.colour === colour);
    line ? (line.qty = Math.min(10, line.qty + qty)) : cart.push({ id, size, colour, qty });
    LB.set('cart', cart); emit();
    LB.toast(`Added to bag — ${p.name} (${size})`, 'View bag', () => LB.openCart());
  };
  LB.updateLine = (i, patch) => {
    const cart = LB.cart();
    if (!cart[i]) return;
    Object.assign(cart[i], patch);
    if (cart[i].qty <= 0) cart.splice(i, 1);
    LB.set('cart', cart); emit();
  };
  LB.removeLine = i => { const c = LB.cart(); c.splice(i, 1); LB.set('cart', c); emit(); };
  LB.clearCart = () => { LB.set('cart', []); emit(); };
  LB.toggleWish = id => {
    const w = LB.wish(), i = w.indexOf(id);
    i > -1 ? w.splice(i, 1) : w.unshift(id);
    LB.set('wish', w); emit();
    LB.toast(i > -1 ? 'Removed from wishlist' : 'Saved to wishlist ♡', i > -1 ? '' : 'View', () => (location.href = 'wishlist.html'));
    return i === -1;
  };
  LB.inWish = id => LB.wish().includes(id);

  LB.totals = (cart = LB.cart(), coupon = LB.get('coupon', ''), gift = LB.get('gift', false)) => {
    let mrp = 0, price = 0, count = 0;
    cart.forEach(l => { const p = LB.byId(l.id); if (!p) return; mrp += p.mrp * l.qty; price += p.price * l.qty; count += l.qty; });
    const c = LB.coupons[coupon];
    let couponOff = 0;
    if (c && price >= c.min) couponOff = c.type === 'pct' ? Math.round(price * c.value / 100) : c.value;
    const ship = price === 0 || price >= LB.freeShipAt ? 0 : LB.shipFee;
    const giftFee = gift && price ? LB.giftWrap : 0;
    return { mrp, price, count, mrpOff: mrp - price, couponOff, coupon: c ? coupon : '', ship, giftFee, total: Math.max(0, price - couponOff + ship + giftFee) };
  };

  /* ---------- Price summary (bag & checkout) ---------- */
  LB.summaryHTML = (t, { cta = '', coupons = true, extra = '' } = {}) => `
    <aside class="summary">
      ${coupons ? `<h3>Coupons</h3>
      <form class="coupon js-coupon"><input placeholder="Enter coupon code" value="${t.coupon}" aria-label="Coupon code"><button>${t.coupon ? 'Remove' : 'Apply'}</button></form>
      <div class="coupon-list">${Object.entries(LB.coupons).map(([code, c]) => `<button type="button" class="${t.coupon === code ? 'is-on' : ''}" data-coupon="${code}"><span><b>${code}</b><br>${c.label}</span><span>${t.coupon === code ? 'Applied ✓' : 'Apply'}</span></button>`).join('')}</div>
      <label class="check"><input type="checkbox" class="js-gift" ${LB.get('gift', false) ? 'checked' : ''}> Add keepsake gift wrap &amp; handwritten note (${LB.money(LB.giftWrap)})</label>` : ''}
      ${extra}
      <h3>Price Details (${t.count} ${t.count === 1 ? 'item' : 'items'})</h3>
      <div class="summary__rows">
        <p><span>Total MRP</span><span>${LB.money(t.mrp)}</span></p>
        <p class="save"><span>Discount on MRP</span><span>−${LB.money(t.mrpOff)}</span></p>
        ${t.couponOff ? `<p class="save"><span>Coupon (${t.coupon})</span><span>−${LB.money(t.couponOff)}</span></p>` : ''}
        ${t.giftFee ? `<p><span>Gift wrap</span><span>${LB.money(t.giftFee)}</span></p>` : ''}
        <p><span>Shipping</span><span>${t.ship ? LB.money(t.ship) : '<b class="save">FREE</b>'}</span></p>
        ${t.express ? `<p><span>Express delivery</span><span>${LB.money(t.express)}</span></p>` : ''}
      </div>
      <div class="summary__total"><span>Total Amount</span><span>${LB.money(t.total)}</span></div>
      ${t.mrpOff + t.couponOff ? `<p class="summary__saved">You save ${LB.money(t.mrpOff + t.couponOff)} on this order ✿</p>` : ''}
      ${cta}
      <div class="secure"><span>UPI</span><span>Cards</span><span>Net Banking</span><span>COD</span></div>
    </aside>`;

  /* ---------- Icons ---------- */
  const ico = (d, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" ${extra}>${d}</svg>`;
  LB.icons = {
    search: ico('<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'),
    user: ico('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
    heart: ico('<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9Z"/>'),
    bag: ico('<path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
    close: ico('<path d="M6 6l12 12M18 6 6 18"/>'),
    star: ico('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>', 'class="ico-fill"'),
    truck: ico('<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>'),
    hand: ico('<path d="M8 13V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7-2.5 0-4-1.2-5.5-3.5L3.8 14a1.5 1.5 0 0 1 2.5-1.6L8 15"/>'),
    cod: ico('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>'),
    returns: ico('<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/>'),
    filter: ico('<path d="M4 6h16M7 12h10M10 18h4"/>'),
    sort: ico('<path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4"/>'),
    minus: ico('<path d="M5 12h14"/>'), plus: ico('<path d="M12 5v14M5 12h14"/>'),
    chev: ico('<path d="m9 6 6 6-6 6"/>'),
    tag: ico('<path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
  };

  /* ---------- Product card ---------- */
  LB.card = (p, { eager = false, quick = true } = {}) => {
    const ld = eager ? 'eager' : 'lazy';
    const url = `product.html?id=${p.id}`;
    return `
    <article class="pcard" data-id="${p.id}" data-col="${p.collection}">
      <div class="pcard__media">
        <a href="${url}" class="pcard__link" aria-label="${LB.esc(p.name)}" data-cursor="View">
          <img class="pcard__img" src="${p.images[0]}" alt="${LB.esc(p.name)}" loading="${ld}" decoding="async">
          ${p.images[1] ? `<img class="pcard__img pcard__img--alt" src="${p.images[1]}" alt="" loading="${ld}" decoding="async">` : ''}
        </a>
        ${p.badge ? `<span class="pcard__badge pcard__badge--${p.badge.toLowerCase()}">${p.badge}</span>` : ''}
        <button class="pcard__wish ${LB.inWish(p.id) ? 'is-on' : ''}" data-wish="${p.id}" aria-label="Save to wishlist">${LB.icons.heart}</button>
        <span class="pcard__rating">${p.rating} ${LB.icons.star} <i>| ${p.reviews}</i></span>
        ${quick ? `<div class="pcard__quick"><p>Quick add</p><div>${p.sizes.map(s => `<button data-quick="${p.id}" data-size="${s}">${s}</button>`).join('')}</div></div>` : ''}
      </div>
      <a href="${url}" class="pcard__info">
        <h3>${LB.esc(p.name)}</h3>
        <small>${LB.collections[p.collection].name} · ${p.craft}</small>
        <p class="pcard__price"><b>${LB.money(p.price)}</b><s>${LB.money(p.mrp)}</s><em>(${p.discount}% off)</em></p>
      </a>
      <div class="pcard__dots">${p.colours.map(c => `<i title="${c.name}" style="background:${c.hex}"></i>`).join('')}</div>
    </article>`;
  };

  document.addEventListener('click', e => {
    const w = e.target.closest('[data-wish]');
    if (w) { e.preventDefault(); const on = LB.toggleWish(w.dataset.wish); $$(`[data-wish="${w.dataset.wish}"]`).forEach(b => b.classList.toggle('is-on', on)); }
    const q = e.target.closest('[data-quick]');
    if (q) { e.preventDefault(); LB.addToCart(q.dataset.quick, q.dataset.size); }
  });

  /* ---------- Layout: header, menus, footer ---------- */
  const cats = [...new Set(LB.products.map(p => p.category))];
  const nav = [
    ['shop.html', 'Shop', true], ['bespoke.html', 'Made-to-Order'], ['our-world.html', 'Our World'], ['the-maker.html', 'The Maker'],
  ];
  const isActive = href => location.pathname.replace(/\/$/, '/index').split('/').pop().replace('.html', '') === href.replace('.html', '');

  const headerHTML = `
  <div class="announce"><div class="announce__track">${Array(2).fill(`
    <span>Free shipping across India on orders above ₹2,999</span><span>✿</span>
    <span>Use code <b>BLOOM10</b> for 10% off your first order</span><span>✿</span>
    <span>Cash on Delivery &amp; UPI available</span><span>✿</span>
    <span>Handcrafted in small batches</span><span>✿</span>`).join('')}</div></div>
  <header class="header">
    <nav class="header__nav" aria-label="Main">
      <button class="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
      <ul class="header__links">
        ${nav.map(([h, t, mega]) => `<li ${mega ? 'class="has-mega"' : ''}><a href="${h}" class="link-u ${isActive(h) ? 'is-active' : ''}">${t}</a></li>`).join('')}
      </ul>
    </nav>
    <a href="index.html" class="header__logo" aria-label="Little Bloom Atelier home">Little<em>Bloom</em></a>
    <div class="header__actions">
      <select class="currency" aria-label="Currency">${Object.keys(RATES).map(c => `<option ${c === LB.currency ? 'selected' : ''}>${c}</option>`).join('')}</select>
      <button class="icon-btn js-search-open" aria-label="Search">${LB.icons.search}</button>
      <a href="account.html" class="icon-btn hide-sm" aria-label="Account">${LB.icons.user}</a>
      <a href="wishlist.html" class="icon-btn" aria-label="Wishlist">${LB.icons.heart}<sup class="js-wish-count"></sup></a>
      <button class="icon-btn js-cart-open" aria-label="Bag">${LB.icons.bag}<sup class="js-cart-count"></sup></button>
    </div>
    <div class="mega" aria-hidden="true">
      <div class="mega__inner">
        <div class="mega__col"><h5>Shop by Category</h5>${cats.map(c => `<a href="shop.html?category=${encodeURIComponent(c)}">${c}</a>`).join('')}<a href="shop.html" class="mega__all">View everything →</a></div>
        <div class="mega__col"><h5>Collections</h5>${Object.entries(LB.collections).map(([k, c]) => `<a href="shop.html?collection=${k}">${c.name}</a>`).join('')}<a href="shop.html?sort=new">New Arrivals</a><a href="shop.html?sort=popular">Bestsellers</a><a href="bespoke.html">Made-to-Order</a></div>
        <div class="mega__col"><h5>Shop by Age</h5>
          <a href="shop.html?age=0-3M,3-6M,6-12M">Baby · 0–12 months</a><a href="shop.html?age=1-2Y,2-3Y">Toddler · 1–3 years</a>
          <a href="shop.html?age=3-4Y,4-5Y">Little · 3–5 years</a><a href="shop.html?age=5-6Y,6-7Y,7-8Y">Big · 5–8 years</a>
          <h5 class="mega__gap">Occasion</h5><a href="shop.html?occasion=Party">Party</a><a href="shop.html?occasion=Festive">Festive</a><a href="shop.html?occasion=Photoshoot">Photoshoot</a>
        </div>
        ${Object.entries(LB.collections).slice(0, 2).map(([k, c]) => `
        <a class="mega__card" href="shop.html?collection=${k}"><img src="${c.image}" alt="" loading="lazy"><span>${c.title}</span></a>`).join('')}
      </div>
    </div>
  </header>
  <div class="menu" aria-hidden="true">
    <div class="menu__bg"></div>
    <ul class="menu__list">
      ${[['shop.html', 'Shop'], ['bespoke.html', 'Made-to-Order'], ['our-world.html', 'Our World'], ['the-maker.html', 'The Maker']].map(([h, t], i) => `<li><a href="${h}"><small>0${i + 1}</small>${t}</a></li>`).join('')}
    </ul>
    <div class="menu__cats">${cats.map(c => `<a href="shop.html?category=${encodeURIComponent(c)}">${c}</a>`).join('')}</div>
    <div class="menu__foot"><a href="account.html">Account</a><a href="wishlist.html">Wishlist</a><a href="care.html">Customer Care</a></div>
  </div>
  <div class="search" aria-hidden="true">
    <div class="search__panel">
      <form class="search__form" action="shop.html">
        ${LB.icons.search}<input name="q" type="search" placeholder="Search frocks, bonnets, sleepwear…" autocomplete="off" aria-label="Search">
        <button type="button" class="icon-btn js-search-close" aria-label="Close search">${LB.icons.close}</button>
      </form>
      <div class="search__suggest"><p class="eyebrow">Popular searches</p><div class="chips">${['Smocked frock', 'Bonnet', 'Sleepsuit', 'Kurta set', 'Quilt', 'Gift box'].map(s => `<a class="chip" href="shop.html?q=${encodeURIComponent(s)}">${s}</a>`).join('')}</div></div>
      <div class="search__results"></div>
    </div>
    <div class="search__overlay js-search-close"></div>
  </div>
  <aside class="cart" aria-hidden="true" aria-label="Shopping bag">
    <div class="cart__overlay js-cart-close"></div>
    <div class="cart__panel">
      <div class="cart__head"><h3>Your Bag <span class="js-cart-count-text"></span></h3><button class="icon-btn js-cart-close" aria-label="Close bag">${LB.icons.close}</button></div>
      <div class="cart__ship"></div>
      <ul class="cart__items"></ul>
      <div class="cart__foot">
        <p><span>Subtotal</span><b class="js-drawer-total"></b></p>
        <small class="cart__note">Inclusive of all taxes · Shipping &amp; coupons at checkout</small>
        <a href="checkout.html" class="btn btn--dark btn--full">Checkout</a>
        <a href="cart.html" class="btn btn--line btn--full">View Bag</a>
      </div>
    </div>
  </aside>
  <div class="toasts" aria-live="polite"></div>`;

  const footerHTML = `
  <footer class="footer">
    <div class="footer__top">
      <div class="footer__news">
        <h3>Letters from the atelier</h3>
        <p>New drops, festive previews &amp; behind-the-stitch stories.</p>
        <form class="footer__form" data-demo-form="Thank you — you're on the list ✿"><input type="email" placeholder="Email address" aria-label="Email" required><button class="btn btn--sm btn--rose" type="submit">Subscribe</button></form>
      </div>
      <div class="footer__perks">
        <span>${LB.icons.truck} Free shipping above ₹2,999</span><span>${LB.icons.cod} COD &amp; UPI</span><span>${LB.icons.returns} 7-day easy returns</span><span>${LB.icons.hand} Handmade in India</span>
      </div>
    </div>
    <div class="footer__cols">
      <div><h5>Shop</h5>${cats.slice(0, 6).map(c => `<a href="shop.html?category=${encodeURIComponent(c)}">${c}</a>`).join('')}</div>
      <div><h5>Collections</h5>${Object.entries(LB.collections).map(([k, c]) => `<a href="shop.html?collection=${k}">${c.name}</a>`).join('')}<a href="shop.html?sort=new">New Arrivals</a><a href="bespoke.html">Made-to-Order</a></div>
      <div><h5>The House</h5><a href="our-world.html">Our World</a><a href="the-maker.html">The Maker</a><a href="care.html#size-guide">Size Guide</a><a href="care.html#shipping">Shipping &amp; Returns</a><a href="care.html#faq">FAQ</a><a href="care.html#contact">Contact</a></div>
      <div><h5>Visit the Studio</h5><p>Studio address<br>City, State – PIN code</p><p>Tue – Sun 11am – 7pm<br>Monday closed</p><p>WhatsApp: +91 XXXXX XXXXX</p></div>
    </div>
    <div class="footer__big">Little<em>Bloom</em></div>
    <div class="footer__base">
      <p>© ${new Date().getFullYear()} Little Bloom Atelier · Made in India</p>
      <p><a href="policies.html#privacy">Privacy Policy</a> · <a href="policies.html#terms">Terms &amp; Conditions</a></p>
      <button class="link-u js-top">Back to top ↑</button>
    </div>
  </footer>`;

  const headerSlot = $('[data-header]'), footerSlot = $('[data-footer]');
  if (headerSlot) headerSlot.outerHTML = headerHTML;
  if (footerSlot) footerSlot.outerHTML = footerHTML;
  document.body.insertAdjacentHTML('afterbegin', '<div class="cursor" aria-hidden="true"><span class="cursor__label"></span></div><div class="scroll-progress" aria-hidden="true"></div>');

  /* ---------- Counts ---------- */
  const renderCounts = () => {
    const n = LB.cart().reduce((a, l) => a + l.qty, 0), w = LB.wish().length;
    $$('.js-cart-count').forEach(el => (el.textContent = n || ''));
    $$('.js-wish-count').forEach(el => (el.textContent = w || ''));
    const t = $('.js-cart-count-text'); if (t) t.textContent = n ? `(${n})` : '';
  };

  /* ---------- Cart drawer ---------- */
  const drawer = $('.cart');
  const renderDrawer = () => {
    const cart = LB.cart(), t = LB.totals();
    const left = LB.freeShipAt - t.price;
    $('.cart__ship', drawer).innerHTML = cart.length ? `
      <p>${left > 0 ? `You're <b>${LB.money(left)}</b> away from free shipping` : 'Yay! You get <b>free shipping</b> ✿'}</p>
      <div class="bar"><i style="width:${clamp(t.price / LB.freeShipAt * 100, 0, 100)}%"></i></div>` : '';
    $('.cart__items', drawer).innerHTML = cart.length ? cart.map((l, i) => {
      const p = LB.byId(l.id); if (!p) return '';
      return `<li class="cart__item">
        <a href="product.html?id=${p.id}"><img src="${p.images[0]}" alt=""></a>
        <div><h6><a href="product.html?id=${p.id}">${p.name}</a></h6><small>${l.colour} · ${l.size}</small>
          <div class="qty qty--sm"><button data-dq="${i}" data-d="-1" aria-label="Decrease">${LB.icons.minus}</button><span>${l.qty}</span><button data-dq="${i}" data-d="1" aria-label="Increase">${LB.icons.plus}</button></div></div>
        <div class="cart__right"><b>${LB.money(p.price * l.qty)}</b><button class="link-u" data-dr="${i}">Remove</button></div>
      </li>`;
    }).join('') : `<li class="cart__empty"><p>Your bag is empty — for now.</p><a href="shop.html" class="btn btn--dark">Start Shopping</a></li>`;
    $('.js-drawer-total').textContent = LB.money(t.price);
    $('.cart__foot', drawer).hidden = !cart.length;
  };
  drawer.addEventListener('click', e => {
    const q = e.target.closest('[data-dq]');
    if (q) { const i = +q.dataset.dq; LB.updateLine(i, { qty: LB.cart()[i].qty + +q.dataset.d }); }
    const r = e.target.closest('[data-dr]');
    if (r) LB.removeLine(+r.dataset.dr);
  });
  LB.openCart = () => { renderDrawer(); document.body.classList.add('cart-open'); drawer.setAttribute('aria-hidden', 'false'); };
  const closeCart = () => { document.body.classList.remove('cart-open'); drawer.setAttribute('aria-hidden', 'true'); };
  $$('.js-cart-open').forEach(b => b.addEventListener('click', LB.openCart));
  $$('.js-cart-close').forEach(b => b.addEventListener('click', closeCart));

  document.addEventListener('lb:change', () => { renderCounts(); if (document.body.classList.contains('cart-open')) renderDrawer(); });
  renderCounts();

  /* ---------- Toasts ---------- */
  LB.toast = (msg, action = '', fn) => {
    const box = $('.toasts'); if (!box) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span>${msg}</span>${action ? `<button>${action}</button>` : ''}`;
    if (action) t.querySelector('button').onclick = () => { fn && fn(); t.remove(); };
    box.append(t);
    setTimeout(() => t.classList.add('out'), 3200);
    setTimeout(() => t.remove(), 3700);
  };

  /* ---------- Menu ---------- */
  const burger = $('.burger'), menu = $('.menu');
  LB.closeMenu = () => { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true'); };
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open); menu.setAttribute('aria-hidden', !open);
  });

  /* ---------- Mega menu ---------- */
  const mega = $('.mega'), megaLi = $('.has-mega');
  let megaT;
  const megaOpen = on => { clearTimeout(megaT); megaT = setTimeout(() => { document.body.classList.toggle('mega-open', on); mega.setAttribute('aria-hidden', !on); }, on ? 80 : 160); };
  if (fine) {
    megaLi.addEventListener('mouseenter', () => megaOpen(true));
    megaLi.addEventListener('mouseleave', () => megaOpen(false));
    mega.addEventListener('mouseenter', () => megaOpen(true));
    mega.addEventListener('mouseleave', () => megaOpen(false));
  }

  /* ---------- Search ---------- */
  const search = $('.search'), sInput = $('.search input');
  const openSearch = () => { document.body.classList.add('search-open'); search.setAttribute('aria-hidden', 'false'); setTimeout(() => sInput.focus(), 300); };
  const closeSearch = () => { document.body.classList.remove('search-open'); search.setAttribute('aria-hidden', 'true'); };
  $$('.js-search-open').forEach(b => b.addEventListener('click', openSearch));
  $$('.js-search-close').forEach(b => b.addEventListener('click', closeSearch));
  LB.match = (p, q) => {
    const hay = [p.name, p.category, p.fabric, p.craft, p.occasion, LB.collections[p.collection].name, ...p.colours.map(c => c.name)].join(' ').toLowerCase();
    return q.toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w.replace(/s$/, '')));
  };
  sInput.addEventListener('input', () => {
    const q = sInput.value.trim();
    const res = q ? LB.products.filter(p => LB.match(p, q)).slice(0, 6) : [];
    $('.search__results').innerHTML = q ? (res.length ? `
      <p class="eyebrow">${res.length} result${res.length > 1 ? 's' : ''}</p>
      <div class="search__grid">${res.map(p => `<a href="product.html?id=${p.id}" class="search__item"><img src="${p.images[0]}" alt=""><span>${p.name}</span><b>${LB.money(p.price)}</b></a>`).join('')}</div>
      <a class="link-u" href="shop.html?q=${encodeURIComponent(q)}">See all results</a>` : `<p class="search__none">Nothing found for “${LB.esc(q)}”. Try “frock” or “bonnet”.</p>`) : '';
  });

  addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCart(); LB.closeMenu(); closeSearch(); LB.closeModal && LB.closeModal(); }
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });

  /* ---------- Currency ---------- */
  $('.currency').addEventListener('change', e => { LB.set('currency', e.target.value); location.reload(); });

  /* ---------- Media placeholders (eager: never stuck in sliders) ---------- */
  LB.initMedia = (root = document) => {
    $$('.media[data-src]:not([data-ready])', root).forEach(m => {
      m.dataset.ready = 1;
      m.dataset.label = m.dataset.src.split('/').pop();
      const imgs = [m.dataset.src, m.dataset.src2].filter(Boolean).map((src, i) => {
        const img = new Image();
        img.alt = m.dataset.alt || '';
        img.decoding = 'async';
        if (i === 0) img.onload = () => m.classList.add('is-loaded');
        img.onerror = () => img.remove();
        img.src = src;
        return img;
      });
      m.prepend(...imgs);
    });
  };

  /* ---------- Split headings ---------- */
  LB.split = (root = document) => $$('.split:not([data-split])', root).forEach(el => {
    el.dataset.split = 1;
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(' ');
          const w = document.createElement('span');
          w.className = 'word';
          w.innerHTML = `<span style="--i:${i++}">${part}</span>`;
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el);
  });

  /* ---------- Reveal on scroll ---------- */
  const countUp = el => {
    const to = +el.dataset.to, t0 = performance.now();
    const tick = t => {
      const p = clamp((t - t0) / 2000, 0, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))).toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const t = e.target;
    [...(t._lbSelf ? [t] : []), ...(t._lbKids || [])].forEach(x => {
      x.classList.add('in');
      if (x.matches('.js-count')) countUp(x);
    });
    io.unobserve(t);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
  LB.reveal = (root = document) => $$('.reveal-up, .reveal-clip, .split, .js-count', root).forEach(el => {
    if (el.closest('[data-hold]')) return; // e.g. hero waits for loader
    // a fully clipped element never reports as intersecting, so watch its parent instead
    const target = el.matches('.reveal-clip') ? el.parentElement : el;
    if (target === el) el._lbSelf = true; else (target._lbKids = target._lbKids || []).push(el);
    io.observe(target);
  });

  /* ---------- Scroll loop: header, progress, parallax ---------- */
  const header = $('.header'), progress = $('.scroll-progress');
  const hero = $('.hero');
  let lastY = scrollY;
  LB.onScroll = [];
  const onScroll = () => {
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    const overHero = hero && y < hero.offsetTop + hero.offsetHeight - header.offsetHeight;
    header.classList.toggle('is-transparent', !!overHero);
    header.classList.toggle('is-solid', !overHero);
    const busy = /menu-open|mega-open|search-open/.test(document.body.className);
    header.classList.toggle('is-hidden', y > lastY && y > vh * 0.8 && !busy);
    lastY = y;
    if (!reduced) $$('.parallax, .parallax-strong').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.setProperty('--py', `${-p * r.height * (el.classList.contains('parallax-strong') ? 0.16 : 0.07)}px`);
    });
    LB.onScroll.forEach(fn => fn(y, vh));
  };
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(() => { onScroll(); ticking = false; }); ticking = true; } }, { passive: true });
  addEventListener('resize', onScroll);

  /* ---------- Anchors & back to top ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#') return e.preventDefault();
    const target = $(id); if (!target) return;
    e.preventDefault(); LB.closeMenu();
    scrollTo({ top: target.getBoundingClientRect().top + scrollY - 90, behavior: reduced ? 'auto' : 'smooth' });
  });
  $$('.js-top').forEach(b => b.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' })));

  /* ---------- Cursor ---------- */
  if (fine && !reduced) {
    const cursor = $('.cursor'), label = $('.cursor__label');
    let mx = -100, my = -100, cx = mx, cy = my;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    const loop = () => { cx = lerp(cx, mx, 0.2); cy = lerp(cy, my, 0.2); cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('mouseover', e => {
      const big = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, input, select, label, textarea');
      if (big && big.dataset.cursor && (!link || link === big || link.contains(big))) { label.textContent = big.dataset.cursor; cursor.className = 'cursor is-big'; }
      else if (link) cursor.className = 'cursor is-link';
      else cursor.className = 'cursor';
    });
  } else $('.cursor').remove();

  /* ---------- Magnetic buttons ---------- */
  LB.magnetic = (root = document) => {
    if (!fine || reduced) return;
    $$('.magnetic', root).forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => (btn.style.transform = ''));
    });
  };

  /* ---------- Accordions ---------- */
  document.addEventListener('click', e => {
    const h = e.target.closest('.acc__head');
    if (!h) return;
    const item = h.parentElement, open = item.classList.toggle('is-open');
    h.setAttribute('aria-expanded', open);
  });

  /* ---------- Demo forms (newsletter, enquiry, contact) ---------- */
  document.addEventListener('submit', e => {
    const f = e.target.closest('[data-demo-form]');
    if (!f) return;
    e.preventDefault();
    const bad = $$('[required]', f).find(el => (el.type === 'checkbox' ? !el.checked : !el.value.trim() || !el.checkValidity()));
    $$('.is-invalid', f).forEach(el => el.classList.remove('is-invalid'));
    if (bad) { bad.classList.add('is-invalid'); bad.focus(); LB.toast('Please complete the highlighted field'); return; }
    LB.toast(f.dataset.demoForm || 'Thank you!');
    const done = f.querySelector('.form-done');
    if (done) { done.hidden = false; done.textContent = f.dataset.demoForm; }
    f.reset();
  });

  /* ---------- Modal ---------- */
  LB.modal = html => {
    LB.closeModal();
    document.body.insertAdjacentHTML('beforeend', `<div class="modal" role="dialog" aria-modal="true"><div class="modal__overlay"></div><div class="modal__box"><button class="icon-btn modal__x" aria-label="Close">${LB.icons.close}</button>${html}</div></div>`);
    const m = $('.modal');
    requestAnimationFrame(() => m.classList.add('is-open'));
    m.addEventListener('click', e => { if (e.target.closest('.modal__x, .modal__overlay')) LB.closeModal(); });
    document.body.classList.add('modal-open');
  };
  LB.closeModal = () => { const m = $('.modal'); if (m) m.remove(); document.body.classList.remove('modal-open'); };

  LB.sizeGuide = () => LB.modal(`
    <h3 class="h3">Size Guide</h3><p class="muted">Measurements in inches. Between sizes? Size up — our seams can be let out as they grow.</p>
    <div class="table-wrap"><table class="table"><thead><tr><th>Age</th><th>Height</th><th>Chest</th><th>Waist</th><th>Frock length</th></tr></thead><tbody>
    ${[['0-3M', '21–24', '16', '16', '13'], ['3-6M', '24–26', '17', '17', '14'], ['6-12M', '26–30', '18', '18', '15'], ['1-2Y', '30–34', '19.5', '19', '17'], ['2-3Y', '34–38', '20.5', '19.5', '19'], ['3-4Y', '38–41', '21.5', '20', '21'], ['4-5Y', '41–44', '22.5', '20.5', '23'], ['5-6Y', '44–46', '23.5', '21', '25'], ['6-7Y', '46–48', '24.5', '21.5', '27'], ['7-8Y', '48–50', '25.5', '22', '29']]
      .map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);

  /* ---------- Recently viewed ---------- */
  LB.pushRecent = id => { const r = LB.get('recent', []).filter(x => x !== id); r.unshift(id); LB.set('recent', r.slice(0, 12)); };

  /* ---------- Boot ---------- */
  LB.boot = () => {
    LB.initMedia(); LB.split(); LB.reveal(); LB.magnetic(); onScroll();
  };
  document.addEventListener('DOMContentLoaded', () => { if (!LB.manualBoot) LB.boot(); });
})();
