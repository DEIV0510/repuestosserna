import type { APIRoute } from 'astro';
import { SISTEMAS } from '@/data/repuestos';

// Sin dominio definitivo no se puede escribir una URL absoluta: el sitemap queda vacío
// (y robots.txt no lo anuncia).
export const GET: APIRoute = ({ site }) => {
  const rutas = ['/', '/repuestos/', ...SISTEMAS.map((s) => `/repuestos/${s.id}/`)];
  const urls = site ? rutas.map((r) => new URL(r, site).href) : [];
  const cuerpo = urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${cuerpo}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
