// Registro de clics en llamadas a la acción, preparado para analítica.
// No hay Google Analytics, Meta Pixel ni CRM configurados: cada evento se publica en
// `window.dataLayer` (si alguien lo instala después, lo recibe sin tocar este código) y como
// evento del navegador `serna:cta`. Nunca bloquea la navegación ni guarda datos personales:
// solo dónde se hizo clic y, si aplica, la especialidad.

type Datos = Record<string, string | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function registrar(evento: string, datos: Datos = {}) {
  const limpio = Object.fromEntries(Object.entries(datos).filter(([, v]) => v));
  try {
    window.dataLayer?.push({ event: evento, ...limpio });
    window.dispatchEvent(new CustomEvent('serna:cta', { detail: { evento, ...limpio } }));
  } catch {
    /* la analítica nunca debe romper la página */
  }
  if (import.meta.env.DEV) console.debug('[analítica]', evento, limpio);
}

/** Delegación: cualquier enlace con data-cta registra su clic. */
export function iniciarAnalitica() {
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-cta]');
      if (!el) return;
      const destino = el.getAttribute('href') ?? '';
      const canal = destino.startsWith('https://wa.me/')
        ? 'whatsapp'
        : destino.includes('instagram.com')
          ? 'instagram'
          : destino.includes('facebook.com')
            ? 'facebook'
            : destino.includes('google.com/maps')
              ? 'mapa'
              : 'otro';
      registrar(canal === 'whatsapp' ? 'clic_whatsapp' : `clic_${canal}`, {
        ubicacion: el.dataset.cta,
        especialidad: el.dataset.especialidad,
      });
    },
    { capture: true, passive: true },
  );
}
