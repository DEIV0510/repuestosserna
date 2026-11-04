// Buscador y filtros del catálogo (Catalogo.astro).
// · Busca en el texto normalizado de cada ficha (nombre, sistema y sinónimos): sin tildes,
//   sin mayúsculas, todas las palabras deben aparecer («pastas freno» → pastillas). Si nada
//   coincide, busca también en las descripciones.
// · Lee ?q= y ?sistema= al abrir (el buscador de la portada llega así) y los mantiene en la URL.
// · Sin resultados: ofrece cotizar lo buscado (el formulario recibe el término como repuesto).
import { normalizar } from '@/lib/texto';
import { registrar } from './analitica';

const VACIAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'para', 'y', 'con', 'mi', 'un', 'una', 'en', 'por', 'repuesto', 'repuestos']);

export function iniciarCatalogo() {
  const raiz = document.querySelector<HTMLElement>('[data-catalogo]');
  if (!raiz) return;
  const form = raiz.querySelector<HTMLFormElement>('[data-buscador]')!;
  const input = form.querySelector<HTMLInputElement>('input[name="q"]')!;
  const filtros = [...raiz.querySelectorAll<HTMLButtonElement>('[data-filtro]')];
  const fichas = [...raiz.querySelectorAll<HTMLElement>('[data-repuesto]')];
  const grupos = [...raiz.querySelectorAll<HTMLElement>('[data-grupo]')];
  const conteo = raiz.querySelector<HTMLElement>('[data-conteo]')!;
  const vacio = raiz.querySelector<HTMLElement>('[data-vacio]')!;
  const vacioTermino = raiz.querySelector<HTMLElement>('[data-vacio-termino]')!;
  const vacioCotizar = raiz.querySelector<HTMLElement>('[data-vacio-cotizar]')!;
  const vacioTodo = raiz.querySelector<HTMLAnchorElement>('[data-vacio-todo]');
  const sistemaFijo = raiz.dataset.sistemaFijo || '';

  const params = new URLSearchParams(location.search);
  let filtro = filtros.some((f) => f.dataset.filtro === params.get('sistema')) ? params.get('sistema')! : 'todos';
  input.value = params.get('q') ?? '';

  let temporizador = 0;
  function aplicar(registrarBusqueda = false) {
    const crudo = input.value.trim();
    const palabras = normalizar(crudo)
      .split(' ')
      .filter((p) => p && !VACIAS.has(p))
      // plural/singular básico: «discos» y «disco», «rotulas» y «rotula»
      .map((p) => (p.length > 4 ? p.replace(/(es|s)$/, '') : p));
    const enFiltro = (f: HTMLElement) => filtro === 'todos' || f.dataset.sistema === filtro;
    const coincide = (texto = '') => palabras.every((p) => texto.includes(p));
    let elegidas = fichas.filter((f) => enFiltro(f) && coincide(f.dataset.texto));
    if (!elegidas.length && palabras.length) elegidas = fichas.filter((f) => enFiltro(f) && coincide(`${f.dataset.texto} ${f.dataset.textoDesc}`));
    for (const f of fichas) f.hidden = !elegidas.includes(f);
    const visibles = elegidas.length;
    grupos.forEach((g) => (g.hidden = !g.querySelector('[data-repuesto]:not([hidden])')));
    filtros.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === filtro)));

    const n = visibles === 1 ? '1 repuesto' : `${visibles} repuestos`;
    conteo.textContent = crudo ? `${n} para «${crudo}»` : n;
    conteo.hidden = visibles === 0;
    vacio.hidden = visibles > 0;
    if (!visibles) {
      vacioTermino.textContent = crudo;
      vacioCotizar.dataset.nombre = crudo.charAt(0).toUpperCase() + crudo.slice(1);
      if (vacioTodo) vacioTodo.href = `/repuestos/?q=${encodeURIComponent(crudo)}`;
    }

    // URL compartible sin recargar
    const url = new URL(location.href);
    crudo ? url.searchParams.set('q', crudo) : url.searchParams.delete('q');
    filtro !== 'todos' && !sistemaFijo ? url.searchParams.set('sistema', filtro) : url.searchParams.delete('sistema');
    history.replaceState(history.state, '', url);

    if (registrarBusqueda && crudo) registrar('busqueda_catalogo', { termino: crudo.slice(0, 60), resultados: String(visibles) });
  }

  input.addEventListener('input', () => {
    aplicar();
    window.clearTimeout(temporizador);
    temporizador = window.setTimeout(() => aplicar(true), 1200);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    aplicar(true);
    input.blur(); // en el celular cierra el teclado y deja ver los resultados
    raiz.querySelector('.cat__conteo, [data-vacio]:not([hidden])')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  filtros.forEach((b) =>
    b.addEventListener('click', () => {
      filtro = b.dataset.filtro!;
      aplicar();
    }),
  );

  aplicar();
  // Llegada desde el buscador de la portada: mostrar los resultados de una vez.
  if (params.get('q')) raiz.scrollIntoView({ block: 'start' });
}
