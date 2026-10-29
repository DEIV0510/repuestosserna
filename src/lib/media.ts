// Datos de imagen listos para <picture>: anchos medidos del archivo real (media.json, marca.json).
import media from '@/data/media.json';
import marca from '@/data/marca.json';

type Set = [string, number][];
export type Recorte = 'full' | 'card';
export type MediaId = keyof typeof media;
export type LogoVersion = 'completo' | 'principal';

interface Crop {
  w: number;
  h: number;
  bg: string;
  avif: Set;
  webp: Set;
}
interface Entry {
  alt: string;
  crops: Partial<Record<Recorte, Crop>>;
}

const srcset = (set: Set) => set.map(([url, w]) => `${url} ${w}w`).join(', ');
// Respaldo para navegadores sin srcset: la WebP de ~720 px (o la mayor si no llega).
const respaldo = (set: Set) => set.find(([, w]) => w >= 700)?.[0] ?? set[set.length - 1][0];

export function pictureData(id: MediaId, recorte: Recorte) {
  const m = (media as unknown as Record<string, Entry>)[id];
  const c = m.crops[recorte];
  if (!c) throw new Error(`La foto «${id}» no tiene el recorte «${recorte}» (scripts/imagenes.config.mjs)`);
  return { avif: srcset(c.avif), webp: srcset(c.webp), src: respaldo(c.webp), width: c.w, height: c.h, alt: m.alt, bg: c.bg };
}

export function logoData(version: LogoVersion) {
  const l = marca[version];
  return { avif: srcset(l.avif as Set), webp: srcset(l.webp as Set), src: respaldo(l.webp as Set), width: l.w, height: l.h };
}

export const COLORES_LOGO = marca.colores;
