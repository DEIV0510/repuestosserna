// Tamaños de la foto del hero: los usa el <picture> y el <link rel="preload"> del <head>.
// Escritorio: el lienzo «cover» mide max(56 % del ancho, alto × 1,5) → ~max(58vw, 132vh).
export const HERO_SIZES = {
  full: '(min-width: 900px) max(58vw, 132vh)',
  card: '100vw',
};
