/** Texto normalizado para buscar: sin tildes, en minúsculas y con espacios simples. */
export const normalizar = (t: string) =>
  t
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
