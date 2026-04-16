/**
 * One-shot: writes public/noise.png (256×256 grayscale PNG, random noise).
 * Run: node scripts/generate-noise-png.mjs
 */
import { randomInt } from 'crypto';
import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'public', 'noise.png');

const W = 256;
const H = 256;

/** CRC-32 for PNG chunks (IEEE polynomial) */
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function u32be(n) {
  return Buffer.from([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
}

function chunk(typeStr, data) {
  const type = Buffer.from(typeStr, 'ascii');
  const len = u32be(data.length);
  const body = Buffer.concat([type, data]);
  const crc = u32be(crc32(body));
  return Buffer.concat([len, body, crc]);
}

// Raw RGBA rows: filter 0 + W*4 bytes per row (PNG truecolor+alpha, type 6)
const raw = Buffer.alloc((1 + W * 4) * H);
let o = 0;
for (let y = 0; y < H; y++) {
  raw[o++] = 0; // None filter
  for (let x = 0; x < W; x++) {
    const v = randomInt(0, 256);
    raw[o++] = v;
    raw[o++] = v;
    raw[o++] = v;
    raw[o++] = 255;
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // RGBA
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const idat = deflateSync(raw, { level: 9 });
const parts = [
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
];

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, Buffer.concat(parts));
console.log('Wrote', outPath);
