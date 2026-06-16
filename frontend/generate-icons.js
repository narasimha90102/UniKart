const sharp = require('sharp');
const path = require('path');

const src = path.join(__dirname, '../.gemini/antigravity/brain/70873f55-f2e9-4924-b5a0-db0cb3673c2d/unikart_icon_1781590584532.png');
const publicDir = path.join(__dirname, 'public');

const sizes = [
  { size: 72,  name: 'icon-72.png' },
  { size: 96,  name: 'icon-96.png' },
  { size: 128, name: 'icon-128.png' },
  { size: 144, name: 'icon-144.png' },
  { size: 152, name: 'icon-152.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 384, name: 'icon-384.png' },
  { size: 512, name: 'icon-512.png' },
];

async function resize() {
  for (const { size, name } of sizes) {
    await sharp(src)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, name));
    console.log(`✓ Generated ${name} (${size}x${size})`);
  }
  console.log('\nAll icons generated successfully!');
}

resize().catch(console.error);
