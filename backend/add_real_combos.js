require('dotenv').config();
const connectDB = require('./db/connect');
const Product = require('./models/Product');

const combos = [
  {
    slug: 'combo-1-mahogany-queen',
    name: 'Combo 1 — Mahogany Queen Bedroom Set',
    category: 'Combos',
    material: 'Mahogany / Foam / Brass',
    price: 29999,
    compare_at_price: null,
    image: '/images/combos/combo-1.jpeg',
    featured: true,
    stock: 20,
    description: 'A complete bedroom-to-living-room package: mahogany queen cot with foam mattress, pillows and bed spread, wardrobe, dressing table, kamatchi vilakku and pithalai plate, 4 chairs with a teapoy. Every item below can be swapped for an alternative — the total updates automatically. Includes free delivery within 150 km.',
    comboItems: [
      { slotLabel: 'Cot', optionType: 'Cot', defaultSlug: '1-5-feet-mahogany-queen-size-cot' },
      { slotLabel: 'Mattress', optionType: 'Mattress', defaultSlug: '5-inch-foam-mattress' },
      { slotLabel: 'Pillows', optionType: 'Pillow', defaultSlug: 'pillow-set-of-3' },
      { slotLabel: 'Bed Spread', optionType: 'Bed Spread', defaultSlug: 'bed-spread' },
      { slotLabel: 'Wardrobe', optionType: 'Wardrobe', defaultSlug: '2-door-wardrobe' },
      { slotLabel: 'Dressing Table', optionType: 'Dressing Table', defaultSlug: 'dressing-table-with-storage' },
      { slotLabel: 'Chairs', optionType: 'Chairs', defaultSlug: 'plastic-chair-set-of-4' },
      { slotLabel: 'Teapoy', optionType: 'Teapoy', defaultSlug: 'teapoy' },
      { slotLabel: 'Kamatchi Vilakku', optionType: 'Kamatchi Vilakku', defaultSlug: 'kamatchi-vilakku' },
      { slotLabel: 'Pithalai Plate', optionType: 'Plate', defaultSlug: 'pithalai-plate' }
    ]
  },
  {
    slug: 'combo-2-karikalan',
    name: 'Karikalan Combo 2 — Full Home Set',
    category: 'Combos',
    material: 'Mahogany / Foam / Fabric',
    price: 39999,
    compare_at_price: null,
    image: '/images/combos/karikalan-combo-2.jpeg',
    featured: true,
    stock: 20,
    description: 'Our largest package covering bedroom, living room and pooja needs: mahogany cot, wardrobe, arched dressing table, chain unjal swing, 3-seat sofa, 4 chairs with teapoy, plus kuthu vilakku, kamatchi vilakku and a pithalai plate. Every item below can be swapped for an alternative — the total updates automatically. Free delivery all over Tamil Nadu.',
    comboItems: [
      { slotLabel: 'Cot', optionType: 'Cot', defaultSlug: '1-5-feet-mahogany-cot' },
      { slotLabel: 'Mattress', optionType: 'Mattress', defaultSlug: '2-5-inch-foam-mattress' },
      { slotLabel: 'Pillows', optionType: 'Pillow', defaultSlug: 'pillow-set-of-3' },
      { slotLabel: 'Bed Spread', optionType: 'Bed Spread', defaultSlug: 'bed-spread' },
      { slotLabel: 'Wardrobe', optionType: 'Wardrobe', defaultSlug: '3-door-wardrobe' },
      { slotLabel: 'Dressing Table', optionType: 'Dressing Table', defaultSlug: 'dressing-table-with-arch' },
      { slotLabel: 'Unjal Swing', optionType: 'Swing', defaultSlug: 'unjal-with-chain' },
      { slotLabel: 'Sofa', optionType: 'Sofa', defaultSlug: '3-seater-sofa' },
      { slotLabel: 'Chairs', optionType: 'Chairs', defaultSlug: 'plastic-chair-set-of-4' },
      { slotLabel: 'Teapoy', optionType: 'Teapoy', defaultSlug: 'teapoy' },
      { slotLabel: 'Kuthu Vilakku', optionType: 'Kuthu Vilakku', defaultSlug: 'kuthu-vilakku' },
      { slotLabel: 'Kamatchi Vilakku', optionType: 'Kamatchi Vilakku', defaultSlug: 'kamatchi-vilakku' },
      { slotLabel: 'Pithalai Plate', optionType: 'Plate', defaultSlug: 'pithalai-plate' }
    ]
  },
  {
    slug: 'combo-3-rajarajan',
    name: 'Rajarajan Combo 3 — Bedroom, Living & Pooja Set',
    category: 'Combos',
    material: 'Mahogany / Foam / Brass',
    price: 44999,
    compare_at_price: null,
    image: '/images/combos/combo-3-rajarajan.jpeg',
    featured: true,
    stock: 20,
    description: 'Our most complete home package: mahogany cot, wardrobe with mirrors, arched dressing table, chain unjal, 4 chairs with teapoy, 3-seat sofa, a 6-foot pooja rack, plus kuthu vilakku, kamatchi vilakku and a pithalai plate. Every item below can be swapped for an alternative — the total updates automatically. Free delivery all over Tamil Nadu.',
    comboItems: [
      { slotLabel: 'Cot', optionType: 'Cot', defaultSlug: '1-5-feet-mahogany-cot' },
      { slotLabel: 'Mattress', optionType: 'Mattress', defaultSlug: '5-inch-foam-mattress' },
      { slotLabel: 'Pillows', optionType: 'Pillow', defaultSlug: 'pillow-set-of-3' },
      { slotLabel: 'Bed Spread', optionType: 'Bed Spread', defaultSlug: 'bed-spread' },
      { slotLabel: 'Wardrobe', optionType: 'Wardrobe', defaultSlug: '3-door-wardrobe' },
      { slotLabel: 'Dressing Table', optionType: 'Dressing Table', defaultSlug: 'dressing-table-with-arch' },
      { slotLabel: 'Unjal Swing', optionType: 'Swing', defaultSlug: 'unjal-with-chain' },
      { slotLabel: 'Sofa', optionType: 'Sofa', defaultSlug: '3-seater-sofa' },
      { slotLabel: 'Chairs', optionType: 'Chairs', defaultSlug: 'plastic-chair-set-of-4' },
      { slotLabel: 'Teapoy', optionType: 'Teapoy', defaultSlug: 'teapoy' },
      { slotLabel: 'Pooja Rack', optionType: 'Pooja Rack', defaultSlug: '6-feet-pooja-rack' },
      { slotLabel: 'Kuthu Vilakku', optionType: 'Kuthu Vilakku', defaultSlug: 'kuthu-vilakku' },
      { slotLabel: 'Kamatchi Vilakku', optionType: 'Kamatchi Vilakku', defaultSlug: 'kamatchi-vilakku' },
      { slotLabel: 'Pithalai Plate', optionType: 'Plate', defaultSlug: 'pithalai-plate' }
    ]
  }
];

async function run() {
  await connectDB();
  for (const combo of combos) {
    await Product.findOneAndUpdate(
      { slug: combo.slug },
      combo,
      { upsert: true, new: true }
    );
    console.log(`Upserted: ${combo.name}`);
  }
  console.log('Done — existing products and other combos were not touched.');
  process.exit(0);
}

run().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
