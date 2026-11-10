/* =========================================================
   House of Tarigai — catalogue & site data
   Demo data: prices, ratings and stock are placeholders.
   ========================================================= */
window.LB = window.LB || {};

(() => {
  const I = 'assets/images/';
  const P = 'assets/images/products/';

  const AGES = ['0-3M', '3-6M', '6-12M', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y'];
  const KIDS = AGES.slice(3);
  const BABY = AGES.slice(0, 6);
  const ONE = ['One Size'];

  const C = {
    peach: { name: 'Peach', hex: '#f4c9b8' }, ivory: { name: 'Ivory', hex: '#f7efe0' },
    cream: { name: 'Cream', hex: '#fbf0dc' }, pink: { name: 'Gulabi Pink', hex: '#f2c6c0' },
    rose: { name: 'Rose', hex: '#e8a9a0' }, haldi: { name: 'Haldi Yellow', hex: '#f3e3b5' },
    pista: { name: 'Pista Green', hex: '#b5c2a8' }, sky: { name: 'Powder Blue', hex: '#cfdde6' },
    lavender: { name: 'Lavender', hex: '#d6cde4' }, coral: { name: 'Coral', hex: '#e09a85' },
    oat: { name: 'Oat', hex: '#e7d9c2' }, grey: { name: 'Mist Grey', hex: '#c9ccd1' },
  };

  // id, name, collection, category, price, mrp, colours, sizes, fabric, craft, occasion, images, extras
  const raw = [
    ['rosebud-chikankari-frock', 'Rosebud Chikankari Frock', 'meadow', 'Frocks', 3490, 4290, ['ivory', 'peach'], KIDS, 'Mulmul Cotton', 'Hand Smocked', 'Party',
      [P + 'rosebud-chikankari-frock-1.jpg', P + 'rosebud-chikankari-frock-2.jpg', I + 'closer-1.jpg', I + 'closer-detail.jpg'], { badge: 'Bestseller', rating: 4.8, reviews: 214, pop: 98 }],
    ['genda-mulmul-romper', 'Genda Mulmul Romper', 'meadow', 'Rompers & Jhablas', 2290, 2690, ['haldi', 'ivory'], BABY, 'Mulmul Cotton', 'Embroidered', 'Everyday',
      [P + 'genda-mulmul-romper-1.jpg', P + 'genda-mulmul-romper-2.jpg', I + 'meadow-slide-1.jpg'], { rating: 4.6, reviews: 88, pop: 80 }],
    ['daisy-chain-bonnet', 'Daisy Chain Bonnet', 'meadow', 'Bonnets & Bows', 1190, 1390, ['ivory', 'pista'], ['0-6M', '6-12M', '1-2Y', '2-4Y'], 'Cotton Eyelet', 'Hand Smocked', 'Everyday',
      [P + 'daisy-chain-bonnet-1.jpg', P + 'daisy-chain-bonnet-2.jpg', I + 'meadow-slide-3.jpg'], { rating: 4.7, reviews: 132, pop: 85 }],
    ['gulmohar-block-print-frock', 'Gulmohar Block-Print Frock', 'meadow', 'Frocks', 2990, 3990, ['coral', 'cream'], KIDS, 'Organic Cotton', 'Block Print', 'Everyday',
      [P + 'gulmohar-block-print-frock-1.jpg', P + 'gulmohar-block-print-frock-2.jpg', I + 'insta-6.jpg'], { badge: 'New', isNew: true, rating: 4.5, reviews: 41, pop: 70 }],
    ['pista-smocked-jhabla', 'Pista Smocked Jhabla', 'meadow', 'Rompers & Jhablas', 1490, 1890, ['pista', 'ivory'], BABY, 'Mulmul Cotton', 'Hand Smocked', 'Everyday',
      [P + 'pista-smocked-jhabla-1.jpg', P + 'pista-smocked-jhabla-2.jpg', I + 'look-4.jpg'], { rating: 4.4, reviews: 57, pop: 62 }],
    ['honeybee-kurta-set', 'Honeybee Kurta Set', 'meadow', 'Kurta Sets', 2790, 3290, ['haldi', 'oat'], KIDS, 'Organic Cotton', 'Chikankari', 'Festive',
      [P + 'honeybee-kurta-set-1.jpg', P + 'honeybee-kurta-set-2.jpg', I + 'look-3.jpg'], { rating: 4.6, reviews: 73, pop: 76 }],
    ['wildflower-tiered-frock', 'Wildflower Tiered Frock', 'meadow', 'Frocks', 3190, 3790, ['peach', 'pink'], KIDS, 'Cotton Eyelet', 'Embroidered', 'Photoshoot',
      [I + 'meadow-slide-1.jpg', I + 'meadow-slide-5.jpg', I + 'insta-6.jpg'], { rating: 4.7, reviews: 96, pop: 88 }],
    ['golden-hour-maxi-frock', 'Golden Hour Maxi Frock', 'meadow', 'Frocks', 3690, 4590, ['peach', 'rose'], KIDS, 'Mulmul Cotton', 'Hand Smocked', 'Party',
      [I + 'meadow-slide-5.jpg', I + 'meadow-slide-4.jpg', I + 'meadow-slide-2.jpg'], { badge: 'Limited', rating: 4.9, reviews: 64, pop: 90 }],

    ['nimbus-mulmul-jhabla-set', 'Nimbus Mulmul Jhabla Set', 'cloud', 'Rompers & Jhablas', 1990, 2390, ['sky', 'ivory'], BABY, 'Mulmul Cotton', 'Embroidered', 'Everyday',
      [P + 'nimbus-mulmul-jhabla-set-1.jpg', P + 'nimbus-mulmul-jhabla-set-2.jpg', I + 'cloud-slide-1.jpg'], { badge: 'New', isNew: true, rating: 4.6, reviews: 38, pop: 72 }],
    ['starlight-sleepsuit', 'Starlight Sleepsuit', 'cloud', 'Sleepwear', 1690, 1990, ['lavender', 'cream'], BABY, 'Organic Cotton', 'Embroidered', 'Nightwear',
      [P + 'starlight-sleepsuit-1.jpg', P + 'starlight-sleepsuit-2.jpg', I + 'cloud-slide-5.jpg'], { rating: 4.8, reviews: 156, pop: 94 }],
    ['kantha-moon-quilt', 'Kantha Moon Quilt', 'cloud', 'Nursery', 3990, 4990, ['cream'], ONE, 'Kantha Cotton', 'Kantha', 'Nightwear',
      [P + 'kantha-moon-quilt-1.jpg', P + 'kantha-moon-quilt-2.jpg', I + 'cloud-slide-4.jpg'], { badge: 'Heirloom', rating: 4.9, reviews: 89, pop: 91 }],
    ['little-cloud-bonnet', 'Little Cloud Bonnet', 'cloud', 'Bonnets & Bows', 1190, 1390, ['pink', 'ivory'], ['0-6M', '6-12M', '1-2Y', '2-4Y'], 'Cotton Eyelet', 'Hand Smocked', 'Photoshoot',
      [P + 'little-cloud-bonnet-1.jpg', P + 'little-cloud-bonnet-2.jpg', I + 'cat-accessories.jpg'], { rating: 4.5, reviews: 47, pop: 60 }],
    ['monsoon-pinafore', 'Monsoon Pinafore', 'cloud', 'Frocks', 2490, 2990, ['grey', 'ivory'], KIDS, 'Linen Blend', 'Embroidered', 'Everyday',
      [P + 'monsoon-pinafore-1.jpg', P + 'monsoon-pinafore-2.jpg', I + 'look-1.jpg'], { rating: 4.3, reviews: 29, pop: 55 }],
    ['raindrop-mojaris', 'Raindrop Mojaris', 'cloud', 'Footwear', 1290, 1590, ['pista', 'ivory'], ['0-6M', '6-12M', '1-2Y', '2-3Y', '3-4Y'], 'Cotton Canvas', 'Embroidered', 'Festive',
      [P + 'raindrop-mojaris-1.jpg', P + 'raindrop-mojaris-2.jpg'], { rating: 4.2, reviews: 22, pop: 48 }],
    ['moonbeam-swaddle', 'Moonbeam Mulmul Swaddle', 'cloud', 'Nursery', 1490, 1790, ['cream', 'sky'], ONE, 'Mulmul Cotton', 'Embroidered', 'Nightwear',
      [I + 'cloud-slide-3.jpg', I + 'cloud-slide-2.jpg', I + 'cloud-slide-4.jpg'], { rating: 4.7, reviews: 112, pop: 83 }],
    ['dreamy-cloud-maxi', 'Dreamy Cloud Maxi Frock', 'cloud', 'Frocks', 3290, 3890, ['sky', 'ivory'], KIDS, 'Mulmul Cotton', 'Hand Smocked', 'Party',
      [I + 'world-cloud.jpg', I + 'cloud-slide-1.jpg', I + 'cloud-slide-3.jpg'], { badge: 'New', isNew: true, rating: 4.8, reviews: 19, pop: 74 }],

    ['fawn-tiered-frock', 'Fawn Tiered Frock', 'woodland', 'Frocks', 3390, 3990, ['ivory', 'pista'], KIDS, 'Cotton Eyelet', 'Embroidered', 'Photoshoot',
      [I + 'world-woodland.jpg', I + 'look-1.jpg', I + 'look-4.jpg'], { badge: 'New', isNew: true, rating: 4.9, reviews: 27, pop: 87 }],
    ['bunny-garden-smock', 'Bunny Garden Smock Dress', 'woodland', 'Frocks', 2890, 3490, ['ivory', 'rose'], KIDS, 'Mulmul Cotton', 'Hand Smocked', 'Everyday',
      [I + 'insta-7.jpg', I + 'insta-9.jpg', I + 'look-2.jpg'], { rating: 4.6, reviews: 61, pop: 78 }],
    ['explorer-eyelet-frock', 'Explorer Eyelet Frock', 'woodland', 'Frocks', 2690, 3190, ['cream', 'peach'], KIDS, 'Cotton Eyelet', 'Embroidered', 'Everyday',
      [I + 'bleed-explorer.jpg', I + 'insta-10.jpg', I + 'look-3.jpg'], { rating: 4.5, reviews: 34, pop: 66 }],
    ['rose-garden-frock', 'Rose Garden Frock', 'woodland', 'Frocks', 3090, 3690, ['ivory', 'pink'], KIDS, 'Organic Cotton', 'Chikankari', 'Festive',
      [I + 'look-2.jpg', I + 'cat-dresses.jpg', I + 'closer-detail.jpg'], { badge: 'Bestseller', rating: 4.8, reviews: 143, pop: 95 }],
    ['cottage-bench-frock', 'Cottage Bench Frock', 'woodland', 'Frocks', 2790, 3290, ['ivory', 'oat'], KIDS, 'Linen Blend', 'Block Print', 'Everyday',
      [I + 'look-3.jpg', I + 'insta-3.jpg', I + 'world-meadow.jpg'], { rating: 4.4, reviews: 31, pop: 58 }],
    ['ivory-picnic-frock', 'Ivory Picnic Frock', 'woodland', 'Frocks', 2990, 3490, ['ivory', 'cream'], KIDS, 'Cotton Eyelet', 'Hand Smocked', 'Photoshoot',
      [I + 'world-meadow.jpg', I + 'look-1.jpg', I + 'hero-poster.jpg'], { rating: 4.7, reviews: 52, pop: 79 }],

    ['heirloom-bow-set', 'Heirloom Bow Set (3 pcs)', 'meadow', 'Bonnets & Bows', 790, 990, ['pink', 'pista', 'ivory'], ONE, 'Cotton Eyelet', 'Embroidered', 'Everyday',
      [I + 'cat-accessories.jpg', I + 'meadow-slide-3.jpg'], { rating: 4.6, reviews: 201, pop: 89 }],
    ['wicker-potli-basket', 'Wicker Potli Basket', 'cloud', 'Accessories', 1390, 1690, ['oat'], ONE, 'Natural Cane', 'Handwoven', 'Photoshoot',
      [I + 'cloud-slide-2.jpg', I + 'insta-8.jpg'], { rating: 4.3, reviews: 18, pop: 45 }],
    ['keepsake-gift-box', 'Keepsake Gift Box', 'woodland', 'Accessories', 4990, 5990, ['cream'], ONE, 'Mulmul Cotton', 'Hand Smocked', 'Festive',
      [I + 'closer-detail.jpg', I + 'origin-studio.jpg', I + 'heritage.jpg'], { badge: 'Gift', rating: 4.9, reviews: 44, pop: 82 }],
  ];

  const descs = {
    'Frocks': 'A twirl-ready frock cut generously through the skirt, finished by hand with tiny stitches you can feel. Soft against the skin, breathable through Indian summers, and made to be passed down.',
    'Rompers & Jhablas': 'An easy, breathable everyday piece with snap buttons for quick changes. Pre-washed for extra softness from the very first wear.',
    'Kurta Sets': 'A two-piece kurta and pyjama set for festive mornings and family gatherings, finished with delicate hand embroidery.',
    'Sleepwear': 'Feather-light sleepwear that keeps little ones cool through the night. Embroidered with tiny stars for sweet dreams.',
    'Nursery': 'A nursery heirloom, layered and stitched by hand. Gets softer with every wash and every year.',
    'Bonnets & Bows': 'A sweet finishing touch, sun-friendly and soft, with ties that stay put through every adventure.',
    'Footwear': 'Soft-soled, hand-embroidered first shoes that let little feet move naturally.',
    'Accessories': 'A small treasure for tiny hands — and a keepsake for grown-ups.',
  };

  LB.products = raw.map(([id, name, collection, category, price, mrp, colours, sizes, fabric, craft, occasion, images, x]) => ({
    id, name, collection, category, price, mrp, sizes, fabric, craft, occasion, images,
    colours: colours.map(c => C[c]),
    discount: Math.round((1 - price / mrp) * 100),
    badge: x.badge || '', isNew: !!x.isNew, rating: x.rating, reviews: x.reviews, pop: x.pop,
    inStock: true,
    desc: descs[category],
  }));

  LB.collections = {
    meadow: { name: 'Meadow', title: 'The Meadow Collection', line: 'Wildflowers, smocking & summer-holiday picnics.', image: I + 'world-meadow.jpg', banner: I + 'meadow-slide-5.jpg' },
    cloud: { name: 'Cloud', title: 'The Cloud Collection', line: 'Dreamy pastels for naps & daydreams.', image: I + 'world-cloud.jpg', banner: I + 'cloud-slide-4.jpg' },
    woodland: { name: 'Woodland', title: 'The Woodland Collection', line: 'Fairy-tale frocks for little forest explorers.', image: I + 'world-woodland.jpg', banner: I + 'world-woodland.jpg' },
  };

  LB.ages = AGES;
  LB.coupons = {
    TARIGAI10: { label: '10% off your order', type: 'pct', value: 10, min: 0 },
    FIRST500: { label: '₹500 off orders above ₹3,999', type: 'flat', value: 500, min: 3999 },
    TWIRL15: { label: '15% off orders above ₹6,999', type: 'pct', value: 15, min: 6999 },
  };
  LB.freeShipAt = 2999;
  LB.shipFee = 99;
  LB.giftWrap = 99;
  LB.states = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

  LB.insta = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `${I}insta-${i}.jpg`);
})();
