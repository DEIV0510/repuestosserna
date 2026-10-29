// Verificación del build (dist/): falla si algo está roto. Uso: npm run check
// - Enlaces internos, anclas y recursos (href, src, srcset) que no existen en dist/
// - Enlaces vacíos o «#» sin destino; enlaces externos con target=_blank sin rel=noopener
// - WhatsApp: número correcto, mensaje presente y codificado; mensajes contextuales esperados
// - Imágenes sin alt, sin width/height, o srcset que declara un ancho distinto al real
// - Un solo <h1> por página; datos estructurados válidos (JSON)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIST = 'dist';
const NUMERO = '573137800613';
const errores = [];
const err = (archivo, msg) => errores.push(`${archivo}: ${msg}`);

const paginas = [];
(function recorrer(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) recorrer(p);
    else if (f.endsWith('.html')) paginas.push(p);
  }
})(DIST);

const existe = (url) => {
  const limpio = decodeURIComponent(url.split('#')[0].split('?')[0]);
  if (!limpio) return true;
  const p = path.join(DIST, limpio);
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return true;
  return fs.existsSync(path.join(p, 'index.html'));
};

const anchosReales = new Map();
async function anchoReal(url) {
  if (!anchosReales.has(url)) anchosReales.set(url, (await sharp(path.join(DIST, url)).metadata()).width);
  return anchosReales.get(url);
}

const mensajes = [];
for (const archivo of paginas) {
  const html = fs.readFileSync(archivo, 'utf8');
  const rel = path.relative(DIST, archivo);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

  if ((html.match(/<h1[\s>]/g) || []).length !== 1) err(rel, 'debe tener exactamente un <h1>');

  for (const [etiqueta, href] of html.matchAll(/<a\b[^>]*?\shref="([^"]*)"[^>]*>/g)) {
    if (!href || href === '#') err(rel, `enlace sin destino: "${href}"`);
    else if (href.startsWith('https://wa.me/')) {
      const u = new URL(href.replace(/&amp;/g, '&'));
      if (u.pathname !== `/${NUMERO}`) err(rel, `WhatsApp con otro número: ${u.pathname}`);
      const texto = u.searchParams.get('text');
      if (!texto) err(rel, 'WhatsApp sin mensaje');
      else mensajes.push(texto);
      if (/[ ¿?¡áéíóúñ]/i.test(href.split('?text=')[1] ?? '')) err(rel, `mensaje de WhatsApp sin codificar: ${href.slice(0, 80)}`);
    } else if (href.startsWith('/')) {
      if (!existe(href)) err(rel, `enlace interno roto: ${href}`);
    } else if (href.startsWith('#')) {
      if (!ids.has(href.slice(1))) err(rel, `ancla inexistente: ${href}`);
    }
    if (/target="_blank"/.test(etiqueta) && !/rel="[^"]*noopener/.test(etiqueta)) err(rel, `target=_blank sin rel=noopener: ${href.slice(0, 60)}`);
  }

  for (const [, src] of html.matchAll(/\s(?:src|href)="(\/[^"]+\.(?:webp|avif|png|jpg|svg|woff2|webmanifest|ico))"/g)) {
    if (!existe(src)) err(rel, `recurso inexistente: ${src}`);
  }
  for (const [, set] of html.matchAll(/\s(?:srcset|imagesrcset)="([^"]+)"/g)) {
    for (const parte of set.split(',')) {
      const [url, w] = parte.trim().split(/\s+/);
      if (!existe(url)) {
        err(rel, `srcset con archivo inexistente: ${url}`);
        continue;
      }
      const real = await anchoReal(url);
      if (w && Number(w.replace('w', '')) !== real) err(rel, `srcset miente: ${url} dice ${w}, mide ${real}`);
    }
  }
  for (const [img] of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt(="|[\s>])/.test(img)) err(rel, `imagen sin alt: ${img.slice(0, 80)}`);
    if (!/\swidth="\d+"/.test(img) || !/\sheight="\d+"/.test(img)) err(rel, `imagen sin width/height: ${img.slice(0, 80)}`);
  }
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try {
      JSON.parse(json);
    } catch {
      err(rel, 'JSON-LD inválido');
    }
  }
}

// Mensajes contextuales del brief: general, suspensión, frenos y motor.
const ESPERADOS = [
  'Quiero consultar por un repuesto para mi vehículo.',
  'Estoy buscando un repuesto para suspensión.',
  'Quiero consultar por un repuesto para el sistema de frenos.',
  'Necesito consultar por un repuesto para motor.',
];
for (const e of ESPERADOS) if (!mensajes.some((m) => m.includes(e))) err('index.html', `falta el mensaje de WhatsApp: «${e}»`);

console.log(`${paginas.length} páginas · ${mensajes.length} enlaces de WhatsApp · ${anchosReales.size} imágenes medidas`);
if (errores.length) {
  console.error(errores.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log('✓ Sin errores');
