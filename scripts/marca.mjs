// Marca: prepara el logo oficial para la web SIN redibujarlo.
// El logo llegó como foto JPEG dentro de un PDF (_material-cliente/logo-serna.pdf),
// sobre fondo negro. Es un acabado metálico con degradados: no se puede vectorizar
// sin alterarlo, así que se usa el raster original.
// - Quita el negro como transparencia («color a alfa»): sobre negro el resultado es
//   idéntico al original y sobre el grafito del sitio se ve igual. No cambia colores,
//   proporciones ni piezas.
// - Recortes por bandas medidas en el original (no se recompone nada):
//     completo   → monograma + nombre + íconos + eslogan (pantalla de carga, Nosotros, pie)
//     principal  → monograma + SERNA + REPUESTOS (cabecera: los íconos y el eslogan no se
//                  leerían a 48 px de alto)
//     monograma  → SR (favicons)
// - Escribe src/data/marca.json (srcset con anchos medidos), favicons, iconos y og.jpg.
// Uso: npm run brand
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const SRC = '_material-cliente/logo-serna-original.jpg'; // `pdfimages -all logo-serna.pdf`
const OUT = 'public/marca';
const GRAFITO = { r: 12, g: 14, b: 17 }; // --grafito del sitio (#0c0e11)

// Bandas medidas por filas en el original (1640×2360): monograma y 765–1051,
// SERNA 1097–1217, REPUESTOS 1252–1296, íconos 1330–1460, eslogan 1494–1518.
const RECORTES = {
  completo: { left: 313, top: 741, width: 1018, height: 801, anchos: [320, 440, 640, 880, 1018] },
  principal: { left: 321, top: 749, width: 1002, height: 563, anchos: [104, 160, 208, 312, 416] },
  monograma: { left: 479, top: 749, width: 652, height: 318, anchos: [] },
};

const hash = (buf) => crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);

// Color a alfa contra negro: a = max(r,g,b); color = c / a. Compuesto sobre negro
// devuelve exactamente el píxel original. El ruido del JPEG (< 10) queda transparente.
async function conAlfa(rect) {
  const { data, info } = await sharp(SRC).extract(rect).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const m = Math.max(r, g, b);
    if (m < 10) continue;
    const k = 255 / m;
    out[j] = Math.min(255, Math.round(r * k));
    out[j + 1] = Math.min(255, Math.round(g * k));
    out[j + 2] = Math.min(255, Math.round(b * k));
    out[j + 3] = m;
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const manifiesto = {};
const png = {};
for (const [nombre, { anchos, ...rect }] of Object.entries(RECORTES)) {
  png[nombre] = await conAlfa(rect);
  if (!anchos.length) continue;
  const set = { avif: [], webp: [] };
  let peso = 0;
  for (const w of anchos) {
    const img = sharp(png[nombre]).resize({ width: w, withoutEnlargement: true });
    const avif = await img.clone().avif({ quality: 62, effort: 7 }).toBuffer();
    const webp = await img.clone().webp({ quality: 86, alphaQuality: 70, effort: 6 }).toBuffer();
    for (const [fmt, buf] of [['avif', avif], ['webp', webp]]) {
      const meta = await sharp(buf).metadata();
      const archivo = `logo-${nombre}-${meta.width}.${hash(buf)}.${fmt}`;
      fs.writeFileSync(path.join(OUT, archivo), buf);
      set[fmt].push([`/marca/${archivo}`, meta.width]);
      if (fmt === 'webp') peso += buf.length;
    }
  }
  manifiesto[nombre] = { w: rect.width, h: rect.height, ...set };
  console.log(`${nombre}: ${rect.width}×${rect.height} → ${anchos.join(', ')} (WebP ${(peso / 1024).toFixed(0)} KB en total)`);
}

// Colores medidos en el logo (medianas): azul del monograma y plata de la R.
{
  const { data } = await sharp(SRC).extract(RECORTES.monograma).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const azul = [[], [], []];
  const plata = [[], [], []];
  for (let i = 0; i < data.length; i += 3) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (b > 150 && r < 90 && b - r > 100) [r, g, b].forEach((v, k) => azul[k].push(v));
    if (r > 150 && Math.abs(r - b) < 18 && Math.abs(r - g) < 18) [r, g, b].forEach((v, k) => plata[k].push(v));
  }
  const med = (a) => a.sort((p, q) => p - q)[a.length >> 1];
  const hex = (c) => '#' + c.map((a) => med(a).toString(16).padStart(2, '0')).join('');
  manifiesto.colores = { azul: hex(azul), plata: hex(plata) };
  console.log('colores del logo:', manifiesto.colores);
}

fs.writeFileSync('src/data/marca.json', JSON.stringify(manifiesto, null, 2) + '\n');

// --- Favicons e iconos: el monograma SR sobre un cuadrado grafito ---
async function icono(lado, margen) {
  const ancho = Math.round(lado * (1 - margen * 2));
  const sr = await sharp(png.monograma).resize({ width: ancho }).toBuffer();
  const meta = await sharp(sr).metadata();
  return sharp({ create: { width: lado, height: lado, channels: 4, background: { ...GRAFITO, alpha: 1 } } })
    .composite([{ input: sr, left: Math.round((lado - meta.width) / 2), top: Math.round((lado - meta.height) / 2) }])
    .png()
    .toBuffer();
}
const ico16 = await icono(16, 0.02);
const ico32 = await icono(32, 0.04);
const ico48 = await icono(48, 0.06);
fs.writeFileSync('public/favicon-32.png', ico32);
fs.writeFileSync('public/apple-touch-icon.png', await icono(180, 0.14));
fs.writeFileSync('public/icon-192.png', await icono(192, 0.14));
fs.writeFileSync('public/icon-512.png', await icono(512, 0.2)); // también «maskable»: zona segura

// favicon.ico con PNG embebidos (16, 32, 48): formato válido desde Windows Vista.
{
  const imgs = [ico16, ico32, ico48];
  const cab = Buffer.alloc(6 + 16 * imgs.length);
  cab.writeUInt16LE(0, 0);
  cab.writeUInt16LE(1, 2);
  cab.writeUInt16LE(imgs.length, 4);
  let off = cab.length;
  imgs.forEach((b, i) => {
    const lado = [16, 32, 48][i];
    const e = 6 + i * 16;
    cab.writeUInt8(lado, e);
    cab.writeUInt8(lado, e + 1);
    cab.writeUInt16LE(1, e + 4);
    cab.writeUInt16LE(32, e + 6);
    cab.writeUInt32LE(b.length, e + 8);
    cab.writeUInt32LE(off, e + 12);
    off += b.length;
  });
  fs.writeFileSync('public/favicon.ico', Buffer.concat([cab, ...imgs]));
}
console.log('→ public/favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png');

// --- Imagen Open Graph (1200×630): logo completo sobre grafito + foto técnica con corte
// inclinado a 12° (el mismo ángulo del sistema gráfico del sitio). Sin texto añadido.
{
  const W = 1200, H = 630;
  const fotoX = 560; // borde superior del corte
  const inclinacion = Math.round(H * Math.tan((12 * Math.PI) / 180)); // ≈ 134 px
  const foto = await sharp('_material-fotos/unsplash/1760317890322-364a810cd4da.jpg')
    .resize({ width: W - fotoX + inclinacion, height: H, fit: 'cover', position: 'centre' })
    .toBuffer();
  const ancho = W - fotoX + inclinacion;
  const mascara = Buffer.from(
    `<svg width="${ancho}" height="${H}"><polygon points="${inclinacion},0 ${ancho},0 ${ancho},${H} 0,${H}" fill="#fff"/></svg>`,
  );
  const recortada = await sharp(foto).composite([{ input: mascara, blend: 'dest-in' }]).png().toBuffer();
  const logo = await sharp(png.completo).resize({ width: 440 }).toBuffer();
  const lm = await sharp(logo).metadata();
  const linea = Buffer.from(
    `<svg width="${W}" height="${H}"><rect x="0" y="${H - 6}" width="${W}" height="6" fill="#1f4fe8"/></svg>`,
  );
  const og = await sharp({ create: { width: W, height: H, channels: 3, background: GRAFITO } })
    .composite([
      { input: recortada, left: fotoX - inclinacion, top: 0 },
      { input: logo, left: Math.round((fotoX - lm.width) / 2) + 10, top: Math.round((H - lm.height) / 2) },
      { input: linea, left: 0, top: 0 },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync('public/og.jpg', og);
  console.log(`→ public/og.jpg (${(og.length / 1024).toFixed(0)} KB)`);
}
