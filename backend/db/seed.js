// Seeds the database with:
//  - individual furniture pieces (your exact product list, categorized as
//    Bedroom / Wardrobe / Dressing Table / Living Room / Dining / Pooja)
//    that can be bought on their own, and are also used as the swappable
//    options inside each combo
//  - the 3 real Senbagam combo packages, each with a `comboItems` list
//    describing which individual product fills each "slot" by default
//  - sample testimonials
//
// Run with: npm run seed
require('dotenv').config();
const connectDB = require('./connect');
const Product = require('../models/Product');
const Testimonial = require('../models/Testimonial');
const { generateIcons } = require('./generate-icons');

/* ------------------------------------------------------------------ */
/* Individual products — sold standalone AND used as swap options      */
/* `type` is a narrow grouping (Cot, Wardrobe, Sofa...) used so a combo */
/* slot only ever offers alternatives of the same kind of item.         */
/* ------------------------------------------------------------------ */
const individualProducts = [
  // ---- Bedroom ----
  { slug: '1-5-feet-mahogany-cot', name: '1.5 Feet Mahogany Cot', category: 'Bedroom', type: 'Cot',
    material: 'Mahogany Wood', price: 8999, shape: 'bed',
    desc: '1.5 feet mahogany-finish wooden cot.' },
  { slug: '1-5-feet-mahogany-queen-size-cot', name: '1.5 Feet Mahogany Queen Size Cot', category: 'Bedroom', type: 'Cot',
    material: 'Mahogany Wood', price: 10999, shape: 'bed',
    desc: '1.5 feet mahogany-finish queen size cot with headboard.' },
  { slug: '2-5-inch-foam-mattress', name: '2.5 Inch Foam Mattress', category: 'Bedroom', type: 'Mattress',
    material: 'Foam', price: 3499, shape: 'mattress',
    desc: '2.5 inch foam mattress, standard comfort.' },
  { slug: '5-inch-foam-mattress', name: '5 Inch Foam Mattress', category: 'Bedroom', type: 'Mattress',
    material: 'Foam', price: 5999, shape: 'mattress',
    desc: '5 inch thick foam mattress, extra comfort.' },
  { slug: 'pillow-set-of-3', name: 'Pillow (Set of 3)', category: 'Bedroom', type: 'Pillow',
    material: 'Cotton', price: 899, shape: 'bedding',
    desc: 'Set of 3 soft pillows.' },
  { slug: 'bed-spread', name: 'Bed Spread', category: 'Bedroom', type: 'Bed Spread',
    material: 'Cotton', price: 799, shape: 'fabric',
    desc: 'Printed cotton bed spread.' },

  // ---- Wardrobe ----
  { slug: '3-door-wardrobe', name: '3 Door Wardrobe', category: 'Wardrobe', type: 'Wardrobe',
    material: 'Wood', price: 12999, shape: 'wardrobe', featured: true,
    desc: '3 door wooden wardrobe with mirror.' },
  { slug: '2-door-wardrobe', name: '2 Door Wardrobe', category: 'Wardrobe', type: 'Wardrobe',
    material: 'Wood', price: 9999, shape: 'wardrobe',
    desc: '2 door wooden wardrobe with mirror.' },

  // ---- Dressing Table ----
  { slug: 'dressing-table-with-arch', name: 'Dressing Table with Arch', category: 'Dressing Table', type: 'Dressing Table',
    material: 'Wood', price: 6999, shape: 'dressingtable', featured: true,
    desc: 'Wooden dressing table with arch mirror and stool.' },
  { slug: 'dressing-table-with-storage', name: 'Dressing Table with Storage', category: 'Dressing Table', type: 'Dressing Table',
    material: 'Wood', price: 5999, shape: 'dressingtable',
    desc: 'Wooden dressing table with storage drawers and mirror.' },

  // ---- Living Room ----
  { slug: '3-seater-sofa', name: '3 Seater Sofa', category: 'Living Room', type: 'Sofa',
    material: 'Fabric & Wood', price: 15999, shape: 'sofa', featured: true,
    desc: '3 seater fabric sofa with cushions.' },
  { slug: 'teapoy', name: 'Teapoy', category: 'Living Room', type: 'Teapoy',
    material: 'Wood', price: 2499, shape: 'teapoy',
    desc: 'Wooden centre table / teapoy.' },
  { slug: 'unjal-with-chain', name: 'Unjal (with Chain)', category: 'Living Room', type: 'Swing',
    material: 'Wood & Metal Chain', price: 7999, shape: 'swing', featured: true,
    desc: 'Traditional wooden swing (unjal) with hanging chain.' },

  // ---- Dining ----
  { slug: 'plastic-chair-set-of-4', name: 'Plastic Chair (Set of 4)', category: 'Dining', type: 'Chairs',
    material: 'Plastic', price: 3199, shape: 'chair',
    desc: 'Set of 4 plastic chairs.' },
  { slug: 'wooden-chair-set-of-4', name: 'Wooden Chair (Set of 4)', category: 'Dining', type: 'Chairs',
    material: 'Wood', price: 5999, shape: 'chair',
    desc: 'Set of 4 wooden dining chairs.' },

  // ---- Pooja ----
  { slug: '6-feet-pooja-rack', name: '6 Feet Pooja Rack', category: 'Pooja', type: 'Pooja Rack',
    material: 'Wood', price: 13999, shape: 'poojarack', featured: true,
    desc: '6 feet wooden pooja rack with carvings.' },
  { slug: 'kuthu-vilakku', name: 'Kuthu Vilakku', category: 'Pooja', type: 'Kuthu Vilakku',
    material: 'Brass', price: 1499, shape: 'lamp',
    desc: 'Traditional brass Kuthu Vilakku lamp.' },
  { slug: 'kamatchi-vilakku', name: 'Kamatchi Vilakku', category: 'Pooja', type: 'Kamatchi Vilakku',
    material: 'Brass', price: 999, shape: 'walllamp',
    desc: 'Traditional brass Kamatchi Vilakku lamp.' },
  { slug: 'pithalai-plate', name: 'Pithalai Plate', category: 'Pooja', type: 'Plate',
    material: 'Brass', price: 599, shape: 'plate',
    desc: 'Brass (Pithalai) pooja plate.' }
];

/* ------------------------------------------------------------------ */
/* Combo packages — real photos, each with swappable comboItems slots  */
/* ------------------------------------------------------------------ */
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

const testimonials = [
  { name: 'Meera K.', role: 'Homeowner, Tirupur', quote: 'We took Combo 2 for our new house — everything from the cot to the pooja items arrived together and matched perfectly.', rating: 5 },
  { name: 'Arjun R.', role: 'Homeowner, Coimbatore', quote: 'Delivery was on time and the wardrobe mirrors were packed with real care. No damage, no missing pieces.', rating: 5 },
  { name: 'Priya S.', role: 'Homeowner, Madurai', quote: 'Combo pricing saved us a lot compared to buying each piece separately. Assembly team was quick and polite.', rating: 5 }
];

async function seed() {
  await connectDB();

  await Product.deleteMany({});
  await Testimonial.deleteMany({});

  generateIcons(individualProducts.map(p => ({ slug: p.slug, shape: p.shape })));

  const individualDocs = individualProducts.map(p => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    type: p.type,
    material: p.material,
    description: p.desc,
    price: p.price,
    compare_at_price: null,
    image: `/images/products/${p.slug}.svg`,
    featured: !!p.featured,
    stock: 20
  }));

  await Product.insertMany(individualDocs);
  await Product.insertMany(combos);
  await Testimonial.insertMany(testimonials);

  console.log(`Seeded ${individualDocs.length} individual products, ${combos.length} combo packages, and ${testimonials.length} testimonials.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
