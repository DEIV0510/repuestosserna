// Única fuente de datos de la empresa. Solo información confirmada por el cliente
// (brief) o por su propio material (video de apertura). Lo que falta queda en null y
// la interfaz se adapta: ver docs/PENDIENTES.md.

export const MARCA = {
  nombre: 'Serna Repuestos',
  eslogan: 'Calidad que se siente en cada recorrido',
};

/** WhatsApp comercial (formato internacional de Colombia, sin «+»). */
export const WHATSAPP_E164 = '573137800613';
export const WHATSAPP_VISIBLE = '313 780 0613';

export const DIRECCION = {
  calle: 'Cra. 31 # 43B-78',
  sector: 'Sector La María',
  ciudad: 'El Carmen de Viboral',
  departamento: 'Antioquia',
  pais: 'Colombia',
  paisCodigo: 'CO',
};

/** Dirección en una línea: la misma en la página, el mapa y los datos estructurados. */
export const DIRECCION_LINEA = `${DIRECCION.calle}, ${DIRECCION.sector}, ${DIRECCION.ciudad}, ${DIRECCION.departamento}, ${DIRECCION.pais}`;

// Para Google Maps se omite el sector: el geocodificador ubica mejor la nomenclatura.
const DESTINO_MAPA = `${DIRECCION.calle}, ${DIRECCION.ciudad}, ${DIRECCION.departamento}, ${DIRECCION.pais}`;
export const MAPS_INDICACIONES = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`Serna Repuestos, ${DESTINO_MAPA}`)}`;
export const MAPS_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(DESTINO_MAPA)}&hl=es&z=16&output=embed`;

export const INSTAGRAM = {
  usuario: '@sernarepuestos1',
  url: 'https://www.instagram.com/sernarepuestos1/',
};

/**
 * Facebook: el nombre comercial está confirmado, la URL de la página no (no aparece en
 * buscadores). Mientras sea null, el sitio muestra el nombre sin enlace.
 * PENDIENTE: pegar aquí la URL exacta de la página cuando el cliente la confirme.
 */
export const FACEBOOK: { nombre: string; url: string | null } = {
  nombre: 'Serna Repuestos',
  url: null,
};
