/* Checkout: address, delivery, payment (demo — no payment is taken) */
(() => {
  const { $, $$, esc, icons } = LB;
  const root = $('.js-co');
  const EXPRESS = 149;
  const saved = LB.get('address', {});
  let delivery = 'standard', pay = 'upi';

  const steps = n => `<div class="steps-bar">${['Bag', 'Address & Payment', 'Confirmed'].map((s, i) => `<span class="${i <= n ? 'is-on' : ''} ${i < n ? 'is-done' : ''}"><i>${i < n ? '✓' : i + 1}</i>${s}</span>`).join('')}</div>`;
  const totals = () => { const t = LB.totals(); t.express = delivery === 'express' ? EXPRESS : 0; t.total += t.express; return t; };
  const field = (name, label, attrs = '', full) => `<label class="field" ${full ? 'style="grid-column:1/-1"' : ''}><span>${label}</span><input name="${name}" value="${esc(saved[name] || '')}" ${attrs}></label>`;

  const render = () => {
    const cart = LB.cart();
    if (!cart.length) {
      root.innerHTML = `${steps(0)}<section class="success"><h1>Your bag is empty</h1><p class="muted">Add a few pieces before checking out.</p><a href="shop.html" class="btn btn--dark">Continue Shopping</a></section>`;
      return;
    }
    const t = totals();
    const sd = new Date(); sd.setDate(sd.getDate() + 6);
    const ed = new Date(); ed.setDate(ed.getDate() + 2);
    const fmt = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    root.innerHTML = `${steps(1)}
    <form class="co js-form" novalidate>
      <div>
        <div class="co__block">
          <h3>Contact <small>We'll send order updates on WhatsApp &amp; email</small></h3>
          <div class="form__row">
            ${field('name', 'Full name', 'required autocomplete="name"')}
            ${field('phone', 'Mobile number', 'required inputmode="numeric" maxlength="10" pattern="[6-9][0-9]{9}" placeholder="10-digit mobile" autocomplete="tel-national"')}
            ${field('email', 'Email', 'type="email" required autocomplete="email"', true)}
          </div>
        </div>
        <div class="co__block">
          <h3>Delivery Address</h3>
          <div class="form__row">
            ${field('line1', 'House / flat, building', 'required autocomplete="address-line1"', true)}
            ${field('line2', 'Area, street, landmark', 'autocomplete="address-line2"', true)}
            ${field('pin', 'PIN code', 'required inputmode="numeric" maxlength="6" pattern="[1-9][0-9]{5}" autocomplete="postal-code"')}
            ${field('city', 'City', 'required autocomplete="address-level2"')}
            <label class="field" style="grid-column:1/-1"><span>State</span><select name="state" required><option value="">Select state</option>${LB.states.map(s => `<option ${saved.state === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
          </div>
          <label class="check"><input type="checkbox" name="save" checked> Save this address for next time</label>
        </div>
        <div class="co__block">
          <h3>Delivery Method</h3>
          <div class="paylist">
            <div class="payopt ${delivery === 'standard' ? 'is-on' : ''}"><label><input type="radio" name="delivery" value="standard" ${delivery === 'standard' ? 'checked' : ''}><span>Standard delivery<br><small>Arrives by ${fmt(sd)}</small></span><b>${t.ship ? LB.money(t.ship) : 'FREE'}</b></label></div>
            <div class="payopt ${delivery === 'express' ? 'is-on' : ''}"><label><input type="radio" name="delivery" value="express" ${delivery === 'express' ? 'checked' : ''}><span>Express delivery<br><small>Arrives by ${fmt(ed)} · metro cities</small></span><b>+${LB.money(EXPRESS)}</b></label></div>
          </div>
        </div>
        <div class="co__block">
          <h3>Payment <small>Demo store — no payment is taken</small></h3>
          <div class="paylist">
            ${[
              ['upi', 'UPI', 'Google Pay, PhonePe, Paytm & more', `<label class="field"><span>UPI ID</span><input name="upi" placeholder="yourname@okbank" pattern="[\\w.\\-]{2,}@[a-zA-Z]{2,}"></label>`],
              ['card', 'Credit / Debit Card', 'Visa, Mastercard, RuPay', `<label class="field"><span>Card number</span><input name="card" inputmode="numeric" maxlength="19" placeholder="1234 5678 9012 3456" pattern="[0-9 ]{15,19}"></label><div class="form__row"><label class="field"><span>Expiry</span><input name="exp" placeholder="MM/YY" maxlength="5" pattern="(0[1-9]|1[0-2])/[0-9]{2}"></label><label class="field"><span>CVV</span><input name="cvv" inputmode="numeric" maxlength="4" placeholder="•••" pattern="[0-9]{3,4}"></label></div>`],
              ['netbanking', 'Net Banking', 'All major Indian banks', `<label class="field"><span>Bank</span><select name="bank"><option value="">Choose your bank</option>${['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank', 'Yes Bank'].map(b => `<option>${b}</option>`).join('')}</select></label>`],
              ['cod', 'Cash on Delivery', 'Pay in cash or UPI when it arrives', `<p class="muted" style="font-size:14px">Please keep ${LB.money(t.total)} ready at delivery.</p>`],
            ].map(([v, l, s, body]) => `<div class="payopt ${pay === v ? 'is-on' : ''}"><label><input type="radio" name="pay" value="${v}" ${pay === v ? 'checked' : ''}><span>${l}<br><small>${s}</small></span></label><div class="payopt__body">${body}</div></div>`).join('')}
          </div>
        </div>
      </div>
      <div>
        ${LB.summaryHTML(t, {
          coupons: false,
          extra: `<h3>In your bag</h3><ul class="mini-items">${cart.map(l => { const p = LB.byId(l.id); return p ? `<li><img src="${p.images[0]}" alt=""><span>${esc(p.name)}<small>${l.colour} · ${l.size} · Qty ${l.qty}</small></span><b>${LB.money(p.price * l.qty)}</b></li>` : ''; }).join('')}</ul><a href="cart.html" class="link-u" style="justify-self:start">Edit bag${t.coupon ? '' : ' · apply coupon'}</a>`,
          cta: `<button class="btn btn--dark btn--block" type="submit">Place Order · ${LB.money(t.total)}</button><p class="demo-note">This is a demo checkout. No real payment will be processed.</p>`,
        })}
      </div>
    </form>`;
  };

  root.addEventListener('change', e => {
    if (e.target.name === 'delivery') { delivery = e.target.value; keep(render); }
    if (e.target.name === 'pay') { pay = e.target.value; keep(render); }
  });
  // re-render without losing what the customer typed
  const keep = fn => {
    const f = $('.js-form'); if (!f) return fn();
    const data = Object.fromEntries(new FormData(f));
    Object.assign(saved, data);
    const card = { upi: data.upi, card: data.card, exp: data.exp, cvv: data.cvv, bank: data.bank };
    fn();
    Object.entries(card).forEach(([k, v]) => { const el = $(`[name="${k}"]`); if (el && v) el.value = v; });
  };

  root.addEventListener('input', e => {
    if (e.target.name === 'card') e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
    if (e.target.name === 'exp') e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(?=\d)/, '$1/');
    if (['phone', 'pin', 'cvv'].includes(e.target.name)) e.target.value = e.target.value.replace(/\D/g, '');
    e.target.classList.remove('is-invalid');
  });

  root.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const need = $$('.co__block [required]', f);
    const payBox = $('.payopt.is-on .payopt__body', f);
    if (pay !== 'cod') $$('input, select', payBox).forEach(el => need.push(Object.assign(el, { required: true })));
    $$('.is-invalid', f).forEach(el => el.classList.remove('is-invalid'));
    const bad = need.filter(el => !el.value.trim() || !el.checkValidity());
    if (bad.length) {
      bad.forEach(el => el.classList.add('is-invalid'));
      bad[0].focus(); bad[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      LB.toast(`Please check ${bad.length === 1 ? 'the highlighted field' : `${bad.length} highlighted fields`}`);
      return;
    }
    const data = Object.fromEntries(new FormData(f));
    if (data.save) LB.set('address', { name: data.name, phone: data.phone, email: data.email, line1: data.line1, line2: data.line2, pin: data.pin, city: data.city, state: data.state });

    const t = totals();
    const btn = $('button[type="submit"]', f);
    btn.disabled = true; btn.textContent = 'Placing your order…';
    setTimeout(() => {
      const id = 'LB' + Date.now().toString().slice(-8);
      const eta = new Date(); eta.setDate(eta.getDate() + (delivery === 'express' ? 2 : 6));
      const order = { id, date: new Date().toISOString(), eta: eta.toISOString(), items: LB.cart(), total: t.total, pay, delivery, city: data.city };
      LB.set('orders', [order, ...LB.get('orders', [])]);
      if (!LB.get('user')) LB.set('user', { name: data.name, email: data.email });
      LB.clearCart(); LB.set('coupon', ''); LB.set('gift', false);
      root.innerHTML = `${steps(3)}<section class="success">
        <div class="success__tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
        <p class="eyebrow">Order ${id}</p>
        <h1>Thank you, ${esc(data.name.split(' ')[0])}!</h1>
        <p class="muted" style="max-width:520px">Your little bundle is being lovingly packed. We'll message you on ${esc(data.phone)} when it ships. Expected delivery by <b>${eta.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</b>.</p>
        <p><b>${LB.money(t.total)}</b> · ${{ upi: 'UPI', card: 'Card', netbanking: 'Net Banking', cod: 'Cash on Delivery' }[pay]}</p>
        <div class="hero__ctas" style="justify-content:center"><a href="shop.html" class="btn btn--dark">Continue Shopping</a><a href="account.html#orders" class="link-u">View my orders</a></div>
        <p class="demo-note">Demo order — no payment was taken.</p>
      </section>`;
      scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  });

  document.addEventListener('lb:change', () => { if ($('.js-form')) keep(render); });
  render();
})();
