// Enlaces de WhatsApp con mensaje precargado. Se construyen en el build (funcionan sin
// JavaScript); los formularios arman su mensaje en el navegador con `mensajeSolicitud`
// (cotizar) y `mensajeBusqueda` (repuesto que no está en el catálogo).
import { MARCA, WHATSAPP_E164 } from './contacto';

export const waUrl = (mensaje: string) => `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(mensaje)}`;

export type Especialidad = 'suspension' | 'frenos' | 'motor';

export const MENSAJES = {
  general: `Hola, ${MARCA.nombre}. Quiero consultar por un repuesto para mi vehículo.`,
  asesor: `Hola, ${MARCA.nombre}. Quiero hablar con un asesor para identificar un repuesto para mi vehículo.`,
  suspension: `Hola, ${MARCA.nombre}. Estoy buscando un repuesto para suspensión. ¿Me pueden ayudar?`,
  frenos: `Hola, ${MARCA.nombre}. Quiero consultar por un repuesto para el sistema de frenos.`,
  motor: `Hola, ${MARCA.nombre}. Necesito consultar por un repuesto para motor.`,
  /** Búsqueda especial sin JavaScript (el formulario arma uno más completo). */
  busqueda: `Hola, ${MARCA.nombre}. Busco un repuesto que no está en el catálogo. ¿Me ayudan a conseguirlo?`,
} satisfies Record<string, string>;

export const WA = Object.fromEntries(Object.entries(MENSAJES).map(([k, m]) => [k, waUrl(m)])) as Record<keyof typeof MENSAJES, string>;

/** Línea que avisa que la foto va en el chat (la web no sube archivos: se adjunta en WhatsApp). */
export const LINEA_FOTO = 'Te envío una foto del repuesto en este chat.';

export interface Solicitud {
  tipo: string;
  /** Pieza elegida en el catálogo o escrita por la persona (opcional al cotizar). */
  repuesto?: string;
  marca: string;
  modelo: string;
  anio: string;
  detalle?: string;
  /** La persona marcó que tiene una foto del repuesto. */
  foto?: boolean;
}

// Punto final solo si la persona no cerró ya la frase (. ? ! …).
const conPunto = (t: string) => `${t}${/[.?!…]$/.test(t) ? '' : '.'}`;

function vehiculoYCierre(lineas: string[], { marca, modelo, anio, detalle, foto }: Solicitud, cierre: string) {
  lineas.push(`Marca del vehículo: ${marca}.`, `Modelo: ${modelo}.`, `Año: ${anio}.`);
  if (detalle) lineas.push(`Detalle: ${conPunto(detalle)}`);
  if (foto) lineas.push(LINEA_FOTO);
  lineas.push(cierre);
  return lineas.join('\n');
}

/** Mensaje del formulario de cotización (formato del brief). Repuesto, detalle y foto son opcionales. */
export function mensajeSolicitud(d: Solicitud) {
  const lineas = [`Hola, ${MARCA.nombre}. Quiero consultar disponibilidad de un repuesto.`, `Tipo: ${d.tipo}.`];
  if (d.repuesto) lineas.push(`Repuesto: ${d.repuesto}.`);
  return vehiculoYCierre(lineas, d, '¿Me pueden ayudar con la referencia y el precio?');
}

/** Mensaje de la búsqueda especial: repuestos que no están en el catálogo o son difíciles de conseguir. */
export function mensajeBusqueda(d: Omit<Solicitud, 'tipo'>) {
  const lineas = [`Hola, ${MARCA.nombre}. Busco un repuesto que no está en el catálogo.`, `Repuesto: ${d.repuesto}.`];
  return vehiculoYCierre(lineas, { ...d, tipo: '' }, '¿Me ayudan a conseguirlo?');
}
