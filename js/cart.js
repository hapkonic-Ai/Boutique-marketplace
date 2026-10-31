/* Bag page: lines, coupons, gift wrap, price breakdown */
(() => {
  const { $, $$, esc, icons } = LB;
  const root = $('.js-bag');

  const render = () => {
    const cart = LB.cart(), t = LB.totals();
    if (!cart.length) {
      root.innerHTML = `<section class="success" style="padding-top:20px"><h1>Your bag is empty</h1><p class="muted">Let's find something lovely for your little one.</p>
        <div class="hero__ctas" style="justify-content:center"><a href="shop.html" class="btn btn--dark">Start Shopping</a>${LB.wish().length ? '<a href="wishlist.html" class="link-u">View wishlist</a>' : ''}</div></section>`;
      return;
    }
    const left = LB.freeShipAt - t.price;
    root.innerHTML = `<div class="bag">
      <div>
        <div class="bag__ship">${left > 0 ? `Add <b>${LB.money(left)}</b> more for <b>free shipping</b>` : '✿ Your order ships <b>free</b>'}<div class="bar"><i style="width:${Math.min(100, t.price / LB.freeShipAt * 100)}%"></i></div></div>
        <ul class="bag__list">${cart.map((l, i) => {
          const p = LB.byId(l.id); if (!p) return '';
          return `<li class="bline">
            <a href="product.html?id=${p.id}"><img src="${p.images[0]}" alt=""></a>
            <div class="bline__info">
              <small>${LB.collections[p.collection].name}</small>
              <h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
              <small>Colour: ${l.colour}</small>
              <div class="bline__opts">
                <label>Size <select data-line="${i}" data-k="size">${p.sizes.map(s => `<option ${s === l.size ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
                <label>Qty <select data-line="${i}" data-k="qty">${Array.from({ length: 10 }, (_, k) => `<option ${k + 1 === l.qty ? 'selected' : ''}>${k + 1}</option>`).join('')}</select></label>
              </div>
              <div class="bline__acts"><button data-rm="${i}">Remove</button><button data-mv="${i}">Move to wishlist</button></div>
            </div>
            <div class="bline__price"><b>${LB.money(p.price * l.qty)}</b><s>${LB.money(p.mrp * l.qty)}</s><em>${p.discount}% off</em></div>
          </li>`;
        }).join('')}</ul>
        <p class="muted" style="margin-top:18px;font-size:13px">Easy 7-day returns on unworn pieces · Delivery in 3–7 days across India</p>
      </div>
      ${LB.summaryHTML(t, { cta: '<a href="checkout.html" class="btn btn--dark btn--block">Place Order</a>' })}
    </div>`;
  };

  root.addEventListener('change', e => {
    const s = e.target.closest('[data-line]');
    if (s) LB.updateLine(+s.dataset.line, { [s.dataset.k]: s.dataset.k === 'qty' ? +s.value : s.value });
    if (e.target.closest('.js-gift')) { LB.set('gift', e.target.checked); render(); }
  });
  root.addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]');
    if (rm) { LB.removeLine(+rm.dataset.rm); LB.toast('Removed from bag'); }
    const mv = e.target.closest('[data-mv]');
    if (mv) { const l = LB.cart()[+mv.dataset.mv]; if (!LB.inWish(l.id)) LB.toggleWish(l.id); LB.removeLine(+mv.dataset.mv); }
    const c = e.target.closest('[data-coupon]');
    if (c) applyCoupon(LB.get('coupon', '') === c.dataset.coupon ? '' : c.dataset.coupon);
  });
  root.addEventListener('submit', e => {
    if (!e.target.closest('.js-coupon')) return;
    e.preventDefault();
    applyCoupon(LB.get('coupon', '') ? '' : $('.js-coupon input').value.trim().toUpperCase());
  });

  const applyCoupon = code => {
    if (!code) { LB.set('coupon', ''); LB.toast('Coupon removed'); return render(); }
    const c = LB.coupons[code];
    if (!c) return LB.toast('That coupon code isn\'t valid');
    if (LB.totals().price < c.min) return LB.toast(`${code} needs a minimum order of ${LB.money(c.min)}`);
    LB.set('coupon', code); LB.toast(`${code} applied — ${c.label}`); render();
  };

  document.addEventListener('lb:change', render);
  render();

  const inBag = LB.cart().map(l => l.id);
  const recs = LB.products.filter(p => !inBag.includes(p.id)).sort((a, b) => b.pop - a.pop).slice(0, 8);
  $('.js-recs').innerHTML = `<section class="rel"><div class="section-head"><h2 class="h2">You May Also Like</h2><a href="shop.html" class="link-u">Shop all</a></div><div class="rel__row">${recs.map(p => LB.card(p, { eager: true })).join('')}</div></section>`;
})();
