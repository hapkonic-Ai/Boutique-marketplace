/* Product detail page */
(() => {
  const { $, $$, esc, icons } = LB;
  const root = $('.js-pdp');
  const p = LB.byId(LB.param('id'));

  if (!p) {
    root.innerHTML = `<section class="success"><h1>We couldn't find that piece</h1><p class="muted">It may have sold out or moved.</p><a href="shop.html" class="btn btn--dark">Back to the shop</a></section>`;
    return;
  }

  document.title = `${p.name} — Little Bloom Atelier`;
  LB.pushRecent(p.id);
  const coll = LB.collections[p.collection];
  let img = 0, colour = p.colours[0].name, size = p.sizes.length === 1 ? p.sizes[0] : '', qty = 1;

  const accordion = (title, html, open) => `<div class="acc__item ${open ? 'is-open' : ''}"><button class="acc__head" aria-expanded="${!!open}">${title}</button><div class="acc__body"><div><div>${html}</div></div></div></div>`;
  const row = (title, list) => list.length ? `<section class="rel"><div class="section-head"><h2 class="h2">${title}</h2><a href="shop.html" class="link-u">Shop all</a></div><div class="rel__row">${list.map(x => LB.card(x, { eager: true })).join('')}</div></section>` : '';

  root.innerHTML = `
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span><a href="shop.html">Shop</a></span><span><a href="shop.html?category=${encodeURIComponent(p.category)}">${p.category}</a></span><span>${esc(p.name)}</span></nav>
    <section class="pdp">
      <div class="gallery">
        <div class="gallery__thumbs">${p.images.map((src, i) => `<button data-img="${i}" aria-label="View image ${i + 1}"><img src="${src}" alt=""></button>`).join('')}</div>
        <div class="gallery__main">
          <div class="gallery__track">${p.images.map((src, i) => `<img src="${src}" alt="${esc(p.name)} — image ${i + 1}" ${i ? 'loading="lazy"' : ''}>`).join('')}</div>
          ${p.images.length > 1 ? `<button class="gallery__nav gallery__nav--prev" data-step="-1" aria-label="Previous image">${icons.chev}</button><button class="gallery__nav gallery__nav--next" data-step="1" aria-label="Next image">${icons.chev}</button>` : ''}
          <div class="gallery__dots">${p.images.map(() => '<i></i>').join('')}</div>
          ${p.badge ? `<span class="pcard__badge">${p.badge}</span>` : ''}
        </div>
      </div>

      <div class="pinfo">
        <div class="pinfo__top">
          <a href="shop.html?collection=${p.collection}" class="eyebrow">${coll.title}</a>
          <h1>${esc(p.name)}</h1>
          <p class="muted">${p.craft} · ${p.fabric}</p>
          <span class="pinfo__rating"><b>${p.rating} ${icons.star}</b><span class="muted">${p.reviews} ratings</span></span>
        </div>
        <div class="pinfo__price">
          <b>${LB.money(p.price)}</b><s>MRP ${LB.money(p.mrp)}</s><em>(${p.discount}% off)</em>
          <small>Inclusive of all taxes · Free shipping above ${LB.money(LB.freeShipAt)}</small>
        </div>

        <div class="opt">
          <div class="opt__head">Colour <span class="js-colour">${colour}</span></div>
          <div class="colours">${p.colours.map((c, i) => `<button class="${i ? '' : 'is-on'}" data-colour="${c.name}" style="background:${c.hex}" aria-label="${c.name}"></button>`).join('')}</div>
        </div>

        <div class="opt">
          <div class="opt__head">Select Size <button class="js-size-guide">Size Guide</button></div>
          <div class="sizes">${p.sizes.map(s => `<button data-size="${s}" class="${s === size ? 'is-on' : ''}">${s}</button>`).join('')}</div>
        </div>

        <div class="pinfo__buy">
          <div class="qty"><button data-q="-1" aria-label="Decrease quantity">${icons.minus}</button><span class="js-qty">1</span><button data-q="1" aria-label="Increase quantity">${icons.plus}</button></div>
          <button class="btn btn--dark js-add">${icons.bag} Add to Bag</button>
          <button class="wish-btn ${LB.inWish(p.id) ? 'is-on' : ''}" data-wish="${p.id}" aria-label="Save to wishlist">${icons.heart}</button>
        </div>
        <button class="btn btn--line btn--block js-buy">Buy Now</button>

        <div class="pincode">
          <div class="opt__head">Delivery Options</div>
          <form class="js-pin"><input inputmode="numeric" maxlength="6" placeholder="Enter 6-digit PIN code" aria-label="PIN code"><button>Check</button></form>
          <p class="js-pin-msg">Check delivery dates &amp; Cash on Delivery availability.</p>
        </div>

        <div class="offers">
          <h4>Offers for you</h4>
          ${Object.entries(LB.coupons).map(([code, c]) => `<div class="offer">${icons.tag}<span>Use code <b>${code}</b> — ${c.label}</span></div>`).join('')}
        </div>

        <div class="pdp__perks">
          <div class="perk">${icons.hand}Handmade in India</div><div class="perk">${icons.cod}COD available</div>
          <div class="perk">${icons.returns}7-day returns</div><div class="perk">${icons.truck}Ships in 2–4 days</div>
        </div>

        <div class="acc">
          ${accordion('Description', `<p>${p.desc}</p>`, true)}
          ${accordion('Product Details', `<dl class="specs"><dt>Collection</dt><dd>${coll.name}</dd><dt>Category</dt><dd>${p.category}</dd><dt>Craft</dt><dd>${p.craft}</dd><dt>Fabric</dt><dd>${p.fabric}</dd><dt>Occasion</dt><dd>${p.occasion}</dd><dt>Sizes</dt><dd>${p.sizes.join(', ')}</dd><dt>Style code</dt><dd>LB-${p.id.slice(0, 3).toUpperCase()}${p.price}</dd></dl>`)}
          ${accordion('Fabric &amp; Care', `<ul><li>Gentle hand wash in cold water, or machine wash on a delicate cycle inside a laundry bag</li><li>Use a mild, baby-safe detergent</li><li>Dry flat in the shade to protect natural dyes</li><li>Warm iron on the reverse; never iron directly on embroidery</li></ul>`)}
          ${accordion('Shipping &amp; Returns', `<ul><li>Free shipping across India on orders above ${LB.money(LB.freeShipAt)}; ${LB.money(LB.shipFee)} otherwise</li><li>Dispatched in 2–4 working days; made-to-order pieces in 2–3 weeks</li><li>Easy 7-day returns &amp; exchanges on unworn pieces with tags</li><li>Cash on Delivery available on most PIN codes</li></ul>`)}
        </div>
      </div>
    </section>
    <div class="stickybuy"><div><b>${LB.money(p.price)}</b><br><small class="muted">${esc(p.name)}</small></div><button class="btn btn--dark js-add">Add to Bag</button></div>
    ${row('Complete the Look', LB.products.filter(x => x.collection === p.collection && x.id !== p.id).slice(0, 8))}
    ${row('You May Also Like', LB.products.filter(x => x.category === p.category && x.id !== p.id && x.collection !== p.collection).slice(0, 8))}
    ${row('Recently Viewed', LB.get('recent', []).filter(id => id !== p.id).map(LB.byId).filter(Boolean).slice(0, 8))}`;

  /* ---------- Gallery ---------- */
  const main = $('.gallery__main'), track = $('.gallery__track'), shots = $$('img', track);
  const go = i => {
    img = (i + shots.length) % shots.length;
    track.style.transform = `translateX(${-img * 100}%)`;
    shots.forEach((s, k) => s.classList.toggle('is-on', k === img));
    $$('.gallery__thumbs button').forEach((b, k) => b.classList.toggle('is-on', k === img));
    $$('.gallery__dots i').forEach((d, k) => d.classList.toggle('is-on', k === img));
    main.classList.remove('is-zoom');
  };
  go(0);
  $$('.gallery__thumbs button').forEach(b => b.addEventListener('click', () => go(+b.dataset.img)));
  $$('[data-step]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); go(img + +b.dataset.step); }));
  if (LB.fine) {
    main.addEventListener('click', () => main.classList.toggle('is-zoom'));
    main.addEventListener('mousemove', e => {
      const r = main.getBoundingClientRect();
      shots[img].style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`;
    });
    main.addEventListener('mouseleave', () => main.classList.remove('is-zoom'));
  }
  let sx = 0;
  main.addEventListener('touchstart', e => (sx = e.touches[0].clientX), { passive: true });
  main.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(img + (dx < 0 ? 1 : -1)); });

  /* ---------- Options ---------- */
  $$('[data-colour]').forEach(b => b.addEventListener('click', () => {
    colour = b.dataset.colour;
    $$('[data-colour]').forEach(x => x.classList.toggle('is-on', x === b));
    $('.js-colour').textContent = colour;
  }));
  $('.sizes').addEventListener('click', e => {
    const b = e.target.closest('[data-size]'); if (!b) return;
    size = b.dataset.size;
    $$('.sizes button').forEach(x => x.classList.toggle('is-on', x === b));
    $('.sizes').classList.remove('is-error');
  });
  $$('[data-q]').forEach(b => b.addEventListener('click', () => { qty = Math.min(10, Math.max(1, qty + +b.dataset.q)); $('.js-qty').textContent = qty; }));
  $('.js-size-guide').addEventListener('click', LB.sizeGuide);

  const needSize = () => {
    if (size) return false;
    const s = $('.sizes');
    s.classList.remove('is-error'); void s.offsetWidth; s.classList.add('is-error');
    s.scrollIntoView({ behavior: 'smooth', block: 'center' });
    LB.toast('Please select a size');
    return true;
  };
  $$('.js-add').forEach(b => b.addEventListener('click', () => { if (!needSize()) { LB.addToCart(p.id, size, qty, colour); LB.openCart(); } }));
  $('.js-buy').addEventListener('click', () => { if (!needSize()) { LB.addToCart(p.id, size, qty, colour); location.href = 'checkout.html'; } });

  /* ---------- PIN code (demo estimate) ---------- */
  $('.js-pin').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('.js-pin input').value.trim(), msg = $('.js-pin-msg');
    if (!/^[1-9]\d{5}$/.test(v)) { msg.className = 'js-pin-msg'; msg.textContent = 'Please enter a valid 6-digit PIN code.'; return; }
    const metro = /^(11|40|56|60|70|50)/.test(v);
    const d = new Date(); d.setDate(d.getDate() + (metro ? 3 : 5));
    msg.className = 'js-pin-msg ok';
    msg.textContent = `✓ Delivery by ${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · Cash on Delivery available`;
  });

  /* ---------- Sticky buy bar (mobile) ---------- */
  const buy = $('.pinfo__buy'), sticky = $('.stickybuy');
  new IntersectionObserver(([e]) => sticky.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(buy);
})();
