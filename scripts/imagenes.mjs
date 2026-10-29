// Exporta las fotos (fotogramas del video de la tienda y fotos de Unsplash) a AVIF + WebP en
// anchos reales (sin ampliar) y escribe
// src/data/media.json con los anchos MEDIDOS de cada archivo (el srcset no miente).
// Uso: npm run images            (todas)
//      node scripts/imagenes.mjs hero-freno motor   (solo esas; el resto se conserva)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import todas, { WIDTHS } from './imagenes.config.mjs';

const OUT = 'public/img';
const MANIFEST = 'src/data/media.json';
const MAXIMO = { full: 2000, card: 1600 };
const solo = process.argv.slice(2);
const fotos = solo.length ? todas.filter((f) => solo.includes(f.id)) : todas;
if (solo.length) {
  for (const f of fs.readdirSync(OUT)) if (solo.some((id) => f.startsWith(`${id}-`))) fs.rmSync(path.join(OUT, f));
} else {
  fs.rmSync(OUT, { recursive: true, force: true });
}
fs.mkdirSync(OUT, { recursive: true });

const hash = (buf) => crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);
const hex = (n) => Math.round(n).toString(16).padStart(2, '0');

// Color de fondo: mediana de una franja de 12 px en el borde del recorte.
async function bordeMediano(buf) {
  const { data, info } = await sharp(buf).resize(200, null).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const ch = [[], [], []];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (x > 12 && x < W - 12 && y > 12 && y < H - 12) continue;
      const i = (y * W + x) * C;
      for (let k = 0; k < 3; k++) ch[k].push(data[i + k]);
    }
  const med = (a) => a.sort((p, q) => p - q)[a.length >> 1];
  return `#${hex(med(ch[0]))}${hex(med(ch[1]))}${hex(med(ch[2]))}`;
}

const previo = solo.length && fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
const manifest = {};
let total = 0;

for (const foto of fotos) {
  const entry = { alt: foto.alt, crops: {} };
  for (const [nombre, c] of Object.entries(foto.crops)) {
    // Buffer intermedio: recorte exacto en sRGB, sin metadatos.
    const base = await sharp(foto.src).extract(c).toColorspace('srgb').png().toBuffer();
    const bg = await bordeMediano(base);
    // Tope por uso: el hero de escritorio se ve a ≤ 1000 px CSS y los bloques a ≤ 800 px CSS;
    // con pantallas 2x bastan 2000 y 1600 px.
    const tope = Math.min(c.width, MAXIMO[nombre] ?? c.width);
    const anchos = [...WIDTHS.filter((w) => w < tope), tope];
    const set = { avif: [], webp: [] };
    for (const w of anchos) {
      const reduce = w < c.width;
      let img = sharp(base).resize({ width: w, withoutEnlargement: true });
      if (reduce) img = img.sharpen({ sigma: 0.6 });
      const avif = await img.clone().avif({ quality: w > 900 ? 58 : 54, effort: 6 }).toBuffer();
      const webp = await img.clone().webp({ quality: w > 900 ? 84 : 80, effort: 6 }).toBuffer();
      for (const [fmt, buf] of [['avif', avif], ['webp', webp]]) {
        const meta = await sharp(buf).metadata();
        const name = `${foto.id}-${nombre}-${meta.width}.${hash(buf)}.${fmt}`;
        fs.writeFileSync(path.join(OUT, name), buf);
        set[fmt].push([`/img/${name}`, meta.width]);
        total += buf.length;
      }
    }
    const meta = await sharp(base).metadata();
    entry.crops[nombre] = { w: meta.width, h: meta.height, bg, ...set };
    console.log(`${foto.id}/${nombre}: ${meta.width}×${meta.height} bg ${bg} → ${anchos.join(', ')}`);
  }
  manifest[foto.id] = entry;
}

// Mismo orden que la configuración, conservando lo que no se regeneró.
const final = {};
for (const f of todas) if (manifest[f.id] || previo[f.id]) final[f.id] = manifest[f.id] ?? previo[f.id];
fs.writeFileSync(MANIFEST, JSON.stringify(final, null, 2) + '\n');
console.log(`→ ${OUT} (${(total / 1024).toFixed(0)} KB en total) y src/data/media.json`);
