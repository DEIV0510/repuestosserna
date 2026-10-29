// Fuentes autoalojadas: Archivo (titulares, ancho expandido) e Inter variable (texto,
// formularios e interfaz).
// - Recorta cada fuente a los glifos del español que usa el sitio.
// - Archivo se fija en una sola instancia (peso 800, ancho 106 %): todos los titulares la usan
//   y una fuente estática es más liviana y más barata de dibujar que una variable.
// - Inter queda variable solo entre 400 y 600 (texto, etiquetas y botones).
// - Nombre con hash (caché inmutable) en public/fonts/.
// - Genera src/styles/fuentes.css con @font-face + fuentes de respaldo con métricas
//   ajustadas (capsize): al llegar la fuente real el diseño no salta.
// - Genera src/data/fuentes.json con las rutas para el <link rel="preload">.
// Uso: npm run fonts
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import subsetFont from 'subset-font';
import { createFontStack } from '@capsizecss/core';
import archivo from '@capsizecss/metrics/archivo';
import inter from '@capsizecss/metrics/inter';
import arial from '@capsizecss/metrics/arial';

const OUT_DIR = 'public/fonts';
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

let chars = '';
for (let c = 0x20; c <= 0x7e; c++) chars += String.fromCharCode(c); // ASCII imprimible
for (let c = 0xa0; c <= 0xff; c++) chars += String.fromCharCode(c); // á é í ó ú ñ ü ¿ ¡ « » · ×
chars += [0x2013, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x2026, 0x2022, 0x2192, 0x2193, 0x2212, 0x2009, 0x202f]
  .map((c) => String.fromCharCode(c))
  .join('');

const hash = (buf) => crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);

async function build(src, base, opts = {}) {
  const input = fs.readFileSync(src);
  const out = await subsetFont(input, chars, { targetFormat: 'woff2', ...opts });
  const name = `${base}.${hash(out)}.woff2`;
  fs.writeFileSync(path.join(OUT_DIR, name), out);
  console.log(`${name}: ${(input.length / 1024).toFixed(1)} KB → ${(out.length / 1024).toFixed(1)} KB`);
  return `/fonts/${name}`;
}

// «standard» = archivo con los ejes de peso y ancho; aquí se fijan los dos.
const archivoHref = await build('node_modules/@fontsource-variable/archivo/files/archivo-latin-standard-normal.woff2', 'archivo', {
  variationAxes: { wght: 800, wdth: 106 },
});
const interHref = await build('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', 'inter', {
  variationAxes: { wght: { min: 400, max: 600 } },
});

// Respaldo con métricas de la fuente real: Arial escalada para ocupar lo mismo.
const display = createFontStack([archivo, arial], { fontFaceFormat: 'styleString' });
const text = createFontStack([inter, arial], { fontFaceFormat: 'styleString' });

const css = `/* Generado por scripts/fuentes.mjs — no editar a mano. */
@font-face {
  font-family: 'Archivo';
  src: url('${archivoHref}') format('woff2');
  font-weight: 800;
  font-stretch: 106%;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Inter';
  src: url('${interHref}') format('woff2');
  font-weight: 400 600;
  font-style: normal;
  font-display: swap;
}
${display.fontFaces}
${text.fontFaces}
:root {
  --font-display: ${display.fontFamily}, system-ui, sans-serif;
  --font-text: ${text.fontFamily}, system-ui, sans-serif;
}
`;

fs.mkdirSync('src/styles', { recursive: true });
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/styles/fuentes.css', css);
fs.writeFileSync('src/data/fuentes.json', JSON.stringify({ archivo: archivoHref, inter: interHref }, null, 2) + '\n');
console.log('→ src/styles/fuentes.css, src/data/fuentes.json');
