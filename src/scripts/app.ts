// Comportamiento de la página (un solo módulo, sin dependencias):
// cabecera sólida al desplazarse, sección activa, menú móvil, apariciones al entrar en
// pantalla, botón flotante, mapa diferido, año del pie, analítica y formulario.
import { iniciarAnalitica, registrar } from './analitica';
import { iniciarSolicitud } from './solicitud';

const html = document.documentElement;

/* ---------- Cabecera: transparente sobre el hero, sólida al bajar ---------- */
function iniciarCabecera() {
  const cab = document.querySelector<HTMLElement>('.cab');
  if (!cab) return;
  const marcar = () => cab.setAttribute('data-solida', String(window.scrollY > 24));
  marcar();
  let pendiente = false;
  window.addEventListener(
    'scroll',
    () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        marcar();
        pendiente = false;
      });
    },
    { passive: true },
  );
}

/* ---------- Sección activa en la navegación ---------- */
function iniciarSeccionActiva() {
  const enlaces = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav]')];
  if (!enlaces.length || !('IntersectionObserver' in window)) return;
  const porId = new Map(enlaces.map((a) => [a.dataset.nav!, a]));
  // Asesoría pertenece al bloque de «Repuestos» en la navegación.
  const alias: Record<string, string> = { asesoria: 'repuestos' };
  const secciones = [...document.querySelectorAll<HTMLElement>('main > section[id]')];
  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        const id = alias[e.target.id] ?? e.target.id;
        enlaces.forEach((a) => a.classList.toggle('is-activo', a === porId.get(id)));
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  secciones.forEach((s) => io.observe(s));
}

/* ---------- Menú móvil (<dialog>) ---------- */
function iniciarMenu() {
  const menu = document.querySelector<HTMLDialogElement>('#menu');
  const abrir = document.querySelector<HTMLButtonElement>('[data-menu-abrir]');
  if (!menu || !abrir || typeof menu.showModal !== 'function') return;
  const cerrar = () => menu.close();
  abrir.addEventListener('click', () => {
    menu.showModal();
    html.classList.add('is-menu');
    abrir.setAttribute('aria-expanded', 'true');
    registrar('menu_abierto');
  });
  menu.addEventListener('close', () => {
    html.classList.remove('is-menu');
    abrir.setAttribute('aria-expanded', 'false');
    abrir.focus({ preventScroll: true });
  });
  menu.querySelector('[data-menu-cerrar]')?.addEventListener('click', cerrar);
  // Enlace interno: cerrar primero y luego ir a la sección (el diálogo bloquea el desplazamiento).
  menu.querySelectorAll<HTMLAnchorElement>('[data-menu-enlace]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const destino = document.getElementById(a.hash.slice(1));
      if (!destino) return;
      e.preventDefault();
      cerrar();
      history.pushState(null, '', a.hash);
      destino.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }),
  );
  // Al pasar a escritorio con el menú abierto, se cierra.
  matchMedia('(min-width: 1024px)').addEventListener('change', (m) => m.matches && menu.open && cerrar());
}

/* ---------- Apariciones al entrar en pantalla ---------- */
function iniciarApariciones() {
  const els = [...document.querySelectorAll<HTMLElement>('.revela')];
  const mostrar = (el: Element) => el.classList.add('is-visible');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(mostrar);
    return;
  }
  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        // También lo que ya quedó por encima (salto con un ancla): nunca queda oculto.
        if (e.isIntersecting || e.boundingClientRect.top < 0) {
          mostrar(e.target);
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- Botón flotante: fuera del hero y lejos de los botones propios ---------- */
function iniciarFlotante() {
  const boton = document.querySelector<HTMLElement>('[data-flotante]');
  const hero = document.querySelector('#inicio');
  if (!boton || !hero || !('IntersectionObserver' in window)) {
    boton?.setAttribute('data-visible', 'true');
    return;
  }
  const visibles = new Set<Element>();
  const evitar = [hero, document.querySelector('#solicitud'), document.querySelector('#contacto'), document.querySelector('.pie')].filter(Boolean) as Element[];
  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target);
      boton.setAttribute('data-visible', String(visibles.size === 0));
    },
    { threshold: 0 },
  );
  evitar.forEach((el) => io.observe(el));
}

/* ---------- Mapa diferido ---------- */
function iniciarMapa() {
  const caja = document.querySelector<HTMLElement>('[data-mapa]');
  const boton = caja?.querySelector<HTMLButtonElement>('[data-mapa-cargar]');
  if (!caja || !boton) return;
  boton.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = caja.dataset.src!;
    iframe.title = 'Mapa de Google con la ubicación de Serna Repuestos';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.setAttribute('allowfullscreen', '');
    caja.appendChild(iframe);
    caja.setAttribute('data-cargado', '');
    iframe.focus();
    registrar('mapa_cargado');
  });
}

/* ---------- Año del pie (siempre el actual) ---------- */
function iniciarAnio() {
  document.querySelectorAll('[data-anio]').forEach((el) => (el.textContent = String(new Date().getFullYear())));
}

// Las apariciones solo ocultan su estado inicial cuando este módulo ya corre (html.is-app):
// si el JavaScript no llegara a cargar, todo el contenido queda visible.
html.classList.add('is-app');

// Cada parte es independiente: un error en una no deja la página a medias.
for (const iniciar of [
  iniciarAnalitica,
  iniciarCabecera,
  iniciarSeccionActiva,
  iniciarMenu,
  iniciarApariciones,
  iniciarFlotante,
  iniciarMapa,
  iniciarAnio,
  iniciarSolicitud,
]) {
  try {
    iniciar();
  } catch (err) {
    console.error(err);
    if (iniciar === iniciarApariciones) document.querySelectorAll('.revela').forEach((el) => el.classList.add('is-visible'));
  }
}
