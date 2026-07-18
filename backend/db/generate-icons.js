// Generates simple flat-icon SVG placeholders for individual furniture
// pieces (used as swap alternatives inside combos). Run automatically by
// seed.js — you can also run it directly: node db/generate-icons.js
const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', '..', 'frontend', 'images', 'products');

const PALETTE = {
  linen: '#F5F0E6',
  moss: '#23301F',
  mossLight: '#48593F',
  brass: '#B78A1E',
  taupe: '#8A7960',
  white: '#FFFFFF'
};

const SHAPES = {
  bed: `<rect x="40" y="140" width="160" height="60" rx="6" fill="{fg}"/>
    <rect x="40" y="100" width="34" height="60" rx="6" fill="{fg2}"/>
    <rect x="55" y="195" width="130" height="16" rx="4" fill="{fg}"/>
    <rect x="46" y="215" width="12" height="18" fill="{fg}"/>
    <rect x="182" y="215" width="12" height="18" fill="{fg}"/>`,
  mattress: `<rect x="35" y="110" width="170" height="70" rx="10" fill="{fg}"/>
    <line x1="35" y1="130" x2="205" y2="130" stroke="{fg2}" stroke-width="4"/>
    <line x1="35" y1="160" x2="205" y2="160" stroke="{fg2}" stroke-width="4"/>`,
  fabric: `<rect x="45" y="90" width="150" height="110" rx="8" fill="{fg}"/>
    <path d="M45 90 L120 130 L195 90" fill="none" stroke="{fg2}" stroke-width="6"/>`,
  bedding: `<rect x="45" y="120" width="150" height="90" rx="8" fill="{fg}"/>
    <circle cx="80" cy="105" r="20" fill="{fg2}"/>
    <circle cx="120" cy="105" r="20" fill="{fg2}"/>
    <circle cx="160" cy="105" r="20" fill="{fg2}"/>`,
  wardrobe: `<rect x="55" y="55" width="130" height="180" rx="4" fill="{fg}"/>
    <line x1="120" y1="55" x2="120" y2="235" stroke="{bg}" stroke-width="4"/>
    <rect x="70" y="90" width="6" height="60" fill="{fg2}"/>
    <rect x="164" y="90" width="6" height="60" fill="{fg2}"/>`,
  dressingtable: `<rect x="75" y="50" width="90" height="80" rx="40" fill="none" stroke="{fg}" stroke-width="8"/>
    <rect x="55" y="140" width="130" height="70" rx="6" fill="{fg}"/>
    <rect x="90" y="160" width="8" height="30" fill="{fg2}"/>
    <rect x="142" y="160" width="8" height="30" fill="{fg2}"/>`,
  sofa: `<rect x="40" y="130" width="160" height="70" rx="18" fill="{fg}"/>
    <rect x="30" y="100" width="35" height="90" rx="14" fill="{fg}"/>
    <rect x="175" y="100" width="35" height="90" rx="14" fill="{fg}"/>
    <rect x="45" y="190" width="150" height="18" rx="6" fill="{fg2}"/>
    <rect x="50" y="215" width="14" height="20" fill="{fg}"/>
    <rect x="176" y="215" width="14" height="20" fill="{fg}"/>`,
  chair: `<path d="M60 210 L60 140 Q60 110 90 110 L150 110 Q180 110 180 140 L180 210" fill="none" stroke="{fg}" stroke-width="10" stroke-linecap="round"/>
    <path d="M60 210 L60 250 M180 210 L180 250 M75 250 L75 270 M165 250 L165 270" stroke="{fg}" stroke-width="10" stroke-linecap="round"/>
    <rect x="55" y="200" width="130" height="16" rx="8" fill="{fg}"/>`,
  teapoy: `<rect x="60" y="110" width="120" height="16" rx="4" fill="{fg}"/>
    <rect x="70" y="126" width="10" height="80" fill="{fg2}"/>
    <rect x="160" y="126" width="10" height="80" fill="{fg2}"/>
    <rect x="60" y="150" width="120" height="10" fill="{fg}"/>`,
  swing: `<line x1="70" y1="40" x2="70" y2="150" stroke="{fg}" stroke-width="6"/>
    <line x1="170" y1="40" x2="170" y2="150" stroke="{fg}" stroke-width="6"/>
    <rect x="55" y="150" width="130" height="20" rx="6" fill="{fg}"/>
    <rect x="55" y="170" width="130" height="50" rx="8" fill="{fg2}"/>`,
  lamp: `<path d="M120 40 L80 110 L160 110 Z" fill="{fg}"/>
    <rect x="115" y="110" width="10" height="110" fill="{fg}"/>
    <ellipse cx="120" cy="235" rx="45" ry="12" fill="{fg}"/>`,
  walllamp: `<path d="M90 60 h60 l-15 60 h-30 z" fill="{fg}"/>
    <rect x="115" y="120" width="10" height="80" fill="{fg2}"/>
    <ellipse cx="120" cy="210" rx="30" ry="8" fill="{fg}"/>`,
  plate: `<ellipse cx="120" cy="150" rx="80" ry="40" fill="{fg}"/>
    <ellipse cx="120" cy="150" rx="55" ry="26" fill="none" stroke="{fg2}" stroke-width="5"/>`,
  poojarack: `<rect x="55" y="70" width="130" height="140" rx="4" fill="{fg}"/>
    <path d="M55 70 L120 30 L185 70 Z" fill="{fg2}"/>
    <rect x="75" y="100" width="35" height="45" fill="{bg}"/>
    <rect x="130" y="100" width="35" height="45" fill="{bg}"/>
    <rect x="75" y="155" width="90" height="10" fill="{fg2}"/>`
};

function makeSvg(shapeKey, bg, fg, fg2) {
  const template = SHAPES[shapeKey];
  if (!template) throw new Error(`Unknown icon shape: ${shapeKey}`);
  const shape = template
    .replaceAll('{fg}', fg)
    .replaceAll('{fg2}', fg2)
    .replaceAll('{bg}', bg);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280">
  <rect width="240" height="280" fill="${bg}"/>
  ${shape}
</svg>`;
}

const colorSets = [
  [PALETTE.linen, PALETTE.moss, PALETTE.brass],
  [PALETTE.moss, PALETTE.linen, PALETTE.brass],
  [PALETTE.linen, PALETTE.mossLight, PALETTE.brass],
  [PALETTE.taupe, PALETTE.linen, PALETTE.moss]
];

// items: [{ slug, shape }]
function generateIcons(items) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  items.forEach((item, i) => {
    const [bg, fg, fg2] = colorSets[i % colorSets.length];
    const svg = makeSvg(item.shape, bg, fg, fg2);
    fs.writeFileSync(path.join(IMG_DIR, `${item.slug}.svg`), svg, 'utf-8');
  });
}

module.exports = { generateIcons };
