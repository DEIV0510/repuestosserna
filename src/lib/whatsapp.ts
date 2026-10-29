// Enlaces de WhatsApp con mensaje precargado. Se construyen en el build (funcionan sin
// JavaScript); el formulario arma su mensaje en el navegador con `mensajeSolicitud`.
import { MARCA, WHATSAPP_E164 } from './contacto';

export const waUrl = (mensaje: string) => `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(mensaje)}`;

export type Especialidad = 'suspension' | 'frenos' | 'motor';

export const MENSAJES = {
  general: `Hola, ${MARCA.nombre}. Quiero consultar por un repuesto para mi vehículo.`,
  asesor: `Hola, ${MARCA.nombre}. Quiero hablar con un asesor para identificar un repuesto para mi vehículo.`,
  suspension: `Hola, ${MARCA.nombre}. Estoy buscando un repuesto para suspensión. ¿Me pueden ayudar?`,
  frenos: `Hola, ${MARCA.nombre}. Quiero consultar por un repuesto para el sistema de frenos.`,
  motor: `Hola, ${MARCA.nombre}. Necesito consultar por un repuesto para motor.`,
} satisfies Record<string, string>;

export const WA = Object.fromEntries(Object.entries(MENSAJES).map(([k, m]) => [k, waUrl(m)])) as Record<keyof typeof MENSAJES, string>;

export interface Solicitud {
  tipo: string;
  marca: string;
  modelo: string;
  anio: string;
  detalle?: string;
}

/** Mensaje del formulario de solicitud (formato del brief). La línea de detalle es opcional. */
export function mensajeSolicitud({ tipo, marca, modelo, anio, detalle }: Solicitud) {
  const lineas = [
    `Hola, ${MARCA.nombre}. Quiero consultar disponibilidad de un repuesto.`,
    `Tipo: ${tipo}.`,
    `Marca del vehículo: ${marca}.`,
    `Modelo: ${modelo}.`,
    `Año: ${anio}.`,
  ];
  // Punto final solo si la persona no cerró ya la frase (. ? ! …).
  if (detalle) lineas.push(`Detalle: ${detalle}${/[.?!…]$/.test(detalle) ? '' : '.'}`);
  lineas.push('¿Me pueden ayudar con la referencia y el precio?');
  return lineas.join('\n');
}
