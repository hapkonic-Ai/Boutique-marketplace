/* Home page: loader, hero video, sliders, collection grids, lookbook, marquee */
(() => {
  const { $, $$, lerp, clamp, reduced } = LB;
  const I = 'assets/images/';

  const slides = {
    meadow: [['meadow-slide-1', 'blush', "Picnic in Nani's garden"], ['meadow-slide-2', 'butter', 'Smocked by hand'], ['meadow-slide-3', 'sage', 'Little wildflower bonnets'], ['meadow-slide-4', 'blush', 'Made for twirling'], ['meadow-slide-5', 'butter', 'Golden hour, summer holidays']],
    cloud: [['cloud-slide-1', 'sky', 'Daydreams in powder blue'], ['cloud-slide-2', 'blush', 'Softest mulmul, softest naps'], ['cloud-slide-3', 'sky', 'Stitched little stars'], ['cloud-slide-4', 'butter', 'Moon & cloud embroidery'], ['cloud-slide-5', 'sky', 'Sweet dreams, little one']],
  };

  /* ---------- Render ---------- */
  $$('[data-slides]').forEach(el => {
    const list = slides[el.dataset.slides];
    el.innerHTML = `<div class="slider__track">${list.map(([f, tone, cap]) => `
      <figure class="slide" data-cursor="Drag"><div class="media" data-src="${I}${f}.jpg" data-tone="${tone}"></div><figcaption class="slide__cap">${cap}</figcaption></figure>`).join('')}</div>
      <div class="slider__ui"><button class="slider__btn" data-dir="-1" aria-label="Previous">←</button><span class="slider__count"><b>01</b> / ${String(list.length).padStart(2, '0')}</span><button class="slider__btn" data-dir="1" aria-label="Next">→</button>
      <div class="slider__bar"><i></i></div></div>`;
  });

  $$('[data-grid]').forEach(el => {
    const list = LB.products.filter(p => p.collection === el.dataset.grid).sort((a, b) => b.pop - a.pop).slice(0, 8);
    el.innerHTML = list.map(p => LB.card(p)).join('');
    $$('.pcard', el).forEach((c, i) => { c.classList.add('reveal-up'); c.style.setProperty('--d', `${(i % 4) * 0.08}s`); });
  });

  const cats = [...new Set(LB.products.map(p => p.category))];
  $('[data-catstrip]').innerHTML = cats.map((c, i) => {
    const list = LB.products.filter(p => p.category === c);
    const img = list.sort((a, b) => b.pop - a.pop)[0].images[0];
    return `<a href="shop.html?category=${encodeURIComponent(c)}" class="catcard reveal-up" style="--d:${i * 0.05}s" data-cursor="Shop">
      <span class="catcard__img"><img src="${img}" alt="" loading="lazy"></span><b>${c}</b><small>${list.length} ${list.length === 1 ? 'style' : 'styles'}</small></a>`;
  }).join('');

  $('[data-swatches]').innerHTML = [['Gulabi', '#f2c6b8'], ['Haldi', '#f3e3b5'], ['Pista', '#b5c2a8'], ['Neel', '#cfdde6'], ['Lavender', '#d6cde4'], ['Kesari', '#e09a85']]
    .map(([n, c], i) => `<li class="swatch reveal-up" style="--d:${i * 0.07}s"><span style="background:${c}"></span><small>${n}</small></li>`).join('');

  $('[data-worlds]').innerHTML = Object.entries(LB.collections).map(([k, c], i) => `
    <a href="shop.html?collection=${k}" class="world reveal-up" style="--d:${i * 0.1}s" data-cursor="Enter">
      <div class="media media--tall" data-src="${c.image}" data-tone="${['blush', 'sky', 'sage'][i]}"></div>
      <h3 class="h3">${c.name}</h3><p>${c.line}</p><span class="link-u">Shop ${c.name}</span></a>`).join('');

  const insta = LB.insta.map((src, i) => `<div class="media" data-src="${src}" data-tone="${['blush', 'sky', 'butter', 'sage'][i % 4]}"></div>`).join('');
  $('[data-marquee] .marquee__track').innerHTML = insta + insta;

  /* ---------- Loader → hero reveal ---------- */
  const loader = $('.loader'), countEl = $('.js-loader-count'), hero = $('.hero');
  let shown = 0;
  const t0 = performance.now();
  const finish = () => {
    loader.classList.add('done');
    document.body.classList.remove('is-loading');
    hero.removeAttribute('data-hold');
    $$('.reveal-up, .split', hero).forEach((el, i) => { el.style.setProperty('--d', `${0.3 + i * 0.12}s`); setTimeout(() => el.classList.add('in'), 300); });
    setTimeout(() => loader.remove(), 1400);
  };
  const run = () => {
    const el = performance.now() - t0;
    shown = lerp(shown, document.readyState === 'complete' ? 100 : Math.min(90, el / 16), 0.09);
    countEl.textContent = Math.round(shown);
    if ((shown > 99.5 && el > 1000) || el > 4500) { countEl.textContent = 100; finish(); } else requestAnimationFrame(run);
  };
  reduced ? finish() : requestAnimationFrame(run);

  /* ---------- Hero video ---------- */
  const video = $('.hero__video'), btn = $('.hero__sound');
  const ready = () => video.classList.add('is-ready');
  video.addEventListener('loadeddata', ready);
  if (video.readyState >= 2) ready();
  btn.addEventListener('click', () => {
    if (video.paused) { video.play(); btn.textContent = 'Pause'; } else { video.pause(); btn.textContent = 'Play'; }
  });
  if (reduced) { video.pause(); btn.textContent = 'Play'; }

  const heroMedia = $('.hero__media'), hg = $('.hgallery'), hgTrack = $('.hgallery__track');
  LB.onScroll.push((y, vh) => {
    if (!reduced && y < vh) heroMedia.style.setProperty('--hs', 1 + (y / vh) * 0.1);
    if (innerWidth > 860) {
      const r = hg.getBoundingClientRect(), total = hg.offsetHeight - vh;
      const p = clamp(-r.top / total, 0, 1);
      hgTrack.style.transform = `translate3d(${-p * (hgTrack.scrollWidth - innerWidth)}px,0,0)`;
    }
  });

  /* ---------- Draggable sliders ---------- */
  $$('[data-slider]').forEach(slider => {
    const track = $('.slider__track', slider), list = $$('.slide', track);
    const counter = $('.slider__count b', slider), bar = $('.slider__bar i', slider);
    let x = 0, target = 0, startX = 0, startT = 0, dragging = false, moved = 0;
    const maxX = () => -(track.scrollWidth - slider.clientWidth);
    const step = () => list[0].offsetWidth + 20;
    const tick = () => {
      x = lerp(x, target, 0.1);
      track.style.transform = `translate3d(${x}px,0,0)`;
      const idx = clamp(Math.round(-x / step()), 0, list.length - 1);
      counter.textContent = String(idx + 1).padStart(2, '0');
      bar.style.transform = `scaleX(${maxX() ? clamp(x / maxX(), 0, 1) : 0})`;
      requestAnimationFrame(tick);
    };
    tick();
    const snap = () => { const i = clamp(Math.round(-target / step()), 0, list.length - 1); target = clamp(-i * step(), maxX(), 0); };
    track.addEventListener('pointerdown', e => { dragging = true; moved = 0; startX = e.clientX; startT = target; slider.classList.add('is-drag'); track.setPointerCapture(e.pointerId); });
    track.addEventListener('pointermove', e => { if (!dragging) return; moved = e.clientX - startX; target = clamp(startT + moved * 1.3, maxX() - 80, 80); });
    const end = () => { if (!dragging) return; dragging = false; slider.classList.remove('is-drag'); snap(); };
    track.addEventListener('pointerup', end); track.addEventListener('pointercancel', end);
    $$('.slider__btn', slider).forEach(b => b.addEventListener('click', () => { target = clamp(target - +b.dataset.dir * step(), maxX(), 0); snap(); }));
    addEventListener('resize', snap);
  });
})();
