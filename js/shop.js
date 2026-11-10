/* Shop listing: faceted filters, sort, URL state, load more */
(() => {
  const { $, $$, esc } = LB;
  const PAGE = 12;
  const SIZE_ORDER = ['0-3M', '3-6M', '0-6M', '6-12M', '1-2Y', '2-3Y', '2-4Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', 'One Size'];
  const prices = LB.products.map(p => p.price);
  const PMIN = Math.floor(Math.min(...prices) / 100) * 100, PMAX = Math.ceil(Math.max(...prices) / 100) * 100;

  // facet key → how to read values from a product, and display label
  const FACETS = [
    { key: 'category', label: 'Categories', get: p => [p.category] },
    { key: 'collection', label: 'Collection', get: p => [p.collection], name: v => LB.collections[v].name },
    { key: 'age', label: 'Age / Size', get: p => p.sizes, type: 'size', order: SIZE_ORDER },
    { key: 'colour', label: 'Colour', get: p => p.colours.map(c => c.name), type: 'colour' },
    { key: 'price', label: 'Price', type: 'range' },
    { key: 'craft', label: 'Craft', get: p => [p.craft] },
    { key: 'fabric', label: 'Fabric', get: p => [p.fabric] },
    { key: 'occasion', label: 'Occasion', get: p => [p.occasion] },
    { key: 'discount', label: 'Discount', type: 'radio', options: [[10, '10% and above'], [15, '15% and above'], [20, '20% and above']] },
    { key: 'rating', label: 'Customer Rating', type: 'radio', options: [[4.5, '4.5★ & above'], [4, '4★ & above']] },
  ];
  const hexOf = {};
  LB.products.forEach(p => p.colours.forEach(c => (hexOf[c.name] = c.hex)));

  /* ---------- State from URL ---------- */
  const qs = new URLSearchParams(location.search);
  const list = k => (qs.get(k) ? qs.get(k).split(',').filter(Boolean) : []);
  const state = {
    category: list('category'), collection: list('collection'), age: list('age'), colour: list('colour'),
    craft: list('craft'), fabric: list('fabric'), occasion: list('occasion'),
    discount: +qs.get('discount') || 0, rating: +qs.get('rating') || 0,
    price: qs.get('price') ? qs.get('price').split('-').map(Number) : [PMIN, PMAX],
    q: qs.get('q') || '', sort: qs.get('sort') || 'recommended',
  };
  let shown = PAGE;
  let cols = LB.get('cols', 3);
  const closed = new Set(LB.get('fclosed', ['craft', 'fabric', 'occasion', 'discount', 'rating']));

  /* ---------- Filtering ---------- */
  const passes = (p, skip) => FACETS.every(f => {
    if (f.key === skip) return true;
    if (f.type === 'range') return p.price >= state.price[0] && p.price <= state.price[1];
    if (f.type === 'radio') return f.key === 'discount' ? p.discount >= state.discount : p.rating >= state.rating;
    const sel = state[f.key];
    return !sel.length || f.get(p).some(v => sel.includes(v));
  }) && (!state.q || LB.match(p, state.q));

  const sorters = {
    recommended: (a, b) => b.pop - a.pop,
    new: (a, b) => (b.isNew - a.isNew) || (b.pop - a.pop),
    popular: (a, b) => b.reviews - a.reviews,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    discount: (a, b) => b.discount - a.discount,
    rating: (a, b) => b.rating - a.rating,
  };

  /* ---------- Facets UI ---------- */
  const renderFacets = () => {
    $('.js-facets').innerHTML = FACETS.map(f => {
      let body = '';
      if (f.type === 'range') {
        const [lo, hi] = state.price;
        body = `<div class="price-range">
          <div class="price-range__slider"><div class="price-range__track"><i style="left:${(lo - PMIN) / (PMAX - PMIN) * 100}%;right:${100 - (hi - PMIN) / (PMAX - PMIN) * 100}%"></i></div>
            <input type="range" min="${PMIN}" max="${PMAX}" step="100" value="${lo}" data-range="0" aria-label="Minimum price">
            <input type="range" min="${PMIN}" max="${PMAX}" step="100" value="${hi}" data-range="1" aria-label="Maximum price"></div>
          <div class="price-range__vals"><span>${LB.money(lo)}</span><span>${LB.money(hi)}</span></div></div>`;
      } else if (f.type === 'radio') {
        body = f.options.map(([v, l]) => `<label class="check"><input type="radio" name="${f.key}" value="${v}" ${state[f.key] === v ? 'checked' : ''} data-radio="${f.key}"><span>${l}</span><small>${LB.products.filter(p => passes(p, f.key) && (f.key === 'discount' ? p.discount >= v : p.rating >= v)).length}</small></label>`).join('')
          + (state[f.key] ? `<button class="fmore" data-radio-clear="${f.key}">Clear</button>` : '');
      } else {
        const base = LB.products.filter(p => passes(p, f.key));
        const all = [...new Set(LB.products.flatMap(f.get))];
        if (f.order) all.sort((a, b) => f.order.indexOf(a) - f.order.indexOf(b)); else all.sort();
        const count = v => base.filter(p => f.get(p).includes(v)).length;
        const name = v => (f.name ? f.name(v) : v);
        if (f.type === 'colour') body = `<div class="fcolours">${all.map(v => `<label class="fcolour"><input type="checkbox" data-f="${f.key}" value="${esc(v)}" ${state[f.key].includes(v) ? 'checked' : ''}><i style="background:${hexOf[v]}"></i><span>${v}</span><small>${count(v)}</small></label>`).join('')}</div>`;
        else if (f.type === 'size') body = `<div class="fsizes">${all.map(v => `<label class="fsize"><input type="checkbox" data-f="${f.key}" value="${esc(v)}" ${state[f.key].includes(v) ? 'checked' : ''}><span>${v}</span></label>`).join('')}</div>`;
        else body = all.map(v => { const n = count(v); return `<label class="check ${n ? '' : 'is-zero'}"><input type="checkbox" data-f="${f.key}" value="${esc(v)}" ${state[f.key].includes(v) ? 'checked' : ''}><span>${name(v)}</span><small>${n}</small></label>`; }).join('');
      }
      return `<div class="fgroup ${closed.has(f.key) ? 'is-closed' : ''}" data-group="${f.key}"><button type="button" aria-expanded="${!closed.has(f.key)}">${f.label}</button><div class="fgroup__body">${body}</div></div>`;
    }).join('');
  };

  /* ---------- Results ---------- */
  const activeChips = () => {
    const chips = [];
    FACETS.forEach(f => {
      if (f.type === 'range') { if (state.price[0] > PMIN || state.price[1] < PMAX) chips.push(['price', '', `${LB.money(state.price[0])} – ${LB.money(state.price[1])}`]); }
      else if (f.type === 'radio') { if (state[f.key]) chips.push([f.key, '', f.options.find(o => o[0] === state[f.key])[1]]); }
      else state[f.key].forEach(v => chips.push([f.key, v, f.name ? f.name(v) : v]));
    });
    if (state.q) chips.push(['q', '', `“${state.q}”`]);
    return chips;
  };

  const render = () => {
    const res = LB.products.filter(p => passes(p)).sort(sorters[state.sort]);
    const chips = activeChips();

    // heading
    const coll = state.collection.length === 1 && LB.collections[state.collection[0]];
    const title = state.q ? `Results for “${state.q}”` : coll ? coll.title : state.category.length === 1 ? state.category[0] : state.sort === 'new' ? 'New Arrivals' : 'Shop All';
    $('.js-title').textContent = title;
    $('.js-crumb').textContent = title;
    document.title = `${title} — House of Tarigai`;
    $('.js-sub').textContent = coll ? coll.line : 'Heirloom pieces, handcrafted in small batches.';
    $('.js-banner').innerHTML = coll ? `<div class="shop-banner"><img src="${coll.banner}" alt=""><p class="eyebrow" style="color:#fff">Collection</p><h2>${coll.title}</h2><p>${coll.line}</p></div>` : '';

    $('.js-results').innerHTML = `<b>${res.length}</b> ${res.length === 1 ? 'piece' : 'pieces'}`;
    $('.js-fcount').textContent = chips.length ? `(${chips.length})` : '';
    $('.js-applied').innerHTML = chips.length ? chips.map(([k, v, l]) => `<button class="chip" data-remove="${k}" data-val="${esc(v)}">${esc(l)} ${LB.icons.close}</button>`).join('') + '<button class="chip chip--clear js-clear">Clear all</button>' : '';

    const grid = $('.js-grid');
    grid.style.setProperty('--cols', cols);
    grid.innerHTML = res.length ? res.slice(0, shown).map(p => LB.card(p)).join('')
      : `<div class="empty" style="grid-column:1/-1"><h3>No pieces match these filters</h3><p class="muted">Try removing a filter or two.</p><button class="btn btn--dark js-clear">Clear filters</button></div>`;
    $$('.pcard', grid).forEach((c, i) => { c.style.animation = `fade-up .6s ${(i % PAGE) * 0.03}s both`; });

    $('.js-more').innerHTML = res.length > shown ? `<p>Showing ${shown} of ${res.length}</p><div class="bar"><i style="width:${shown / res.length * 100}%"></i></div><button class="btn btn--line js-loadmore">Load more</button>`
      : res.length > PAGE ? `<p>You've seen all ${res.length} pieces ✿</p>` : '';
    $$('.js-sort').forEach(s => (s.value = state.sort));
    $$('.density button').forEach(b => b.classList.toggle('is-on', +b.dataset.cols === cols));
    $('.js-apply').textContent = `Show ${res.length} results`;

    // URL
    const p = new URLSearchParams();
    ['category', 'collection', 'age', 'colour', 'craft', 'fabric', 'occasion'].forEach(k => state[k].length && p.set(k, state[k].join(',')));
    if (state.discount) p.set('discount', state.discount);
    if (state.rating) p.set('rating', state.rating);
    if (state.price[0] > PMIN || state.price[1] < PMAX) p.set('price', state.price.join('-'));
    if (state.q) p.set('q', state.q);
    if (state.sort !== 'recommended') p.set('sort', state.sort);
    history.replaceState(null, '', `${location.pathname}${p.toString() ? '?' + p.toString().replace(/%2C/g, ',') : ''}`);
  };

  const update = () => { shown = PAGE; renderFacets(); render(); };

  /* ---------- Quick category chips ---------- */
  const cats = [...new Set(LB.products.map(p => p.category))];
  const renderQ = () => {
    $('.js-qcats').innerHTML = `<button class="chip ${state.category.length ? '' : 'chip--on'}" data-qcat="">All</button>` +
      cats.map(c => `<button class="chip ${state.category.length === 1 && state.category[0] === c ? 'chip--on' : ''}" data-qcat="${esc(c)}">${c}</button>`).join('');
  };

  /* ---------- Events ---------- */
  const facets = $('.js-facets');
  facets.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.f) {
      const arr = state[t.dataset.f];
      t.checked ? arr.push(t.value) : arr.splice(arr.indexOf(t.value), 1);
      renderQ(); update();
    }
    if (t.dataset.radio) { state[t.dataset.radio] = +t.value; update(); }
    if (t.dataset.range) update();
  });
  facets.addEventListener('input', e => {
    const t = e.target;
    if (!t.dataset.range) return;
    const [a, b] = $$('[data-range]', facets).map(i => +i.value);
    state.price = [Math.min(a, b), Math.max(a, b)];
    const tr = $('.price-range__track i', facets);
    tr.style.left = `${(state.price[0] - PMIN) / (PMAX - PMIN) * 100}%`;
    tr.style.right = `${100 - (state.price[1] - PMIN) / (PMAX - PMIN) * 100}%`;
    $('.price-range__vals', facets).innerHTML = `<span>${LB.money(state.price[0])}</span><span>${LB.money(state.price[1])}</span>`;
  });
  facets.addEventListener('click', e => {
    const g = e.target.closest('.fgroup > button');
    if (g) {
      const grp = g.parentElement, k = grp.dataset.group;
      grp.classList.toggle('is-closed') ? closed.add(k) : closed.delete(k);
      g.setAttribute('aria-expanded', !grp.classList.contains('is-closed'));
      LB.set('fclosed', [...closed]);
    }
    const rc = e.target.closest('[data-radio-clear]');
    if (rc) { state[rc.dataset.radioClear] = 0; update(); }
  });

  const clearAll = () => {
    ['category', 'collection', 'age', 'colour', 'craft', 'fabric', 'occasion'].forEach(k => (state[k] = []));
    state.discount = 0; state.rating = 0; state.price = [PMIN, PMAX]; state.q = '';
    renderQ(); update();
  };
  document.addEventListener('click', e => {
    if (e.target.closest('.js-clear')) clearAll();
    const rm = e.target.closest('[data-remove]');
    if (rm) {
      const k = rm.dataset.remove, v = rm.dataset.val;
      if (k === 'price') state.price = [PMIN, PMAX];
      else if (k === 'q') state.q = '';
      else if (k === 'discount' || k === 'rating') state[k] = 0;
      else state[k] = state[k].filter(x => x !== v);
      renderQ(); update();
    }
    const qc = e.target.closest('[data-qcat]');
    if (qc) { state.category = qc.dataset.qcat ? [qc.dataset.qcat] : []; renderQ(); update(); }
    if (e.target.closest('.js-loadmore')) { shown += PAGE; render(); }
    const d = e.target.closest('[data-cols]');
    if (d) { cols = +d.dataset.cols; LB.set('cols', cols); render(); }
    if (e.target.closest('.js-filters-open')) document.body.classList.add('filters-open');
    if (e.target.closest('.js-filters-close, .js-apply')) document.body.classList.remove('filters-open');
  });

  const desktopSort = $('.js-sort');
  $$('.js-sort')[1].innerHTML = desktopSort.innerHTML;
  $$('.js-sort').forEach(s => s.addEventListener('change', () => { state.sort = s.value; shown = PAGE; render(); }));

  renderQ(); renderFacets(); render();
})();
