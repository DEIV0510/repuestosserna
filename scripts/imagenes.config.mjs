// Fotos del sitio y sus recortes (coordenadas del archivo original, sin ampliar nunca).
//
// Dos orígenes, documentados en docs/CREDITOS-FOTOS.md:
//   · Fotogramas del video de apertura de Serna Repuestos (_material-cliente/fotogramas,
//     720×1280). Se recorta por encima de los subtítulos quemados del video y por debajo
//     de la marca de agua SR (y 140–940): la foto queda limpia, sin texto encima.
//   · Fotos de Unsplash (licencia Unsplash: uso comercial gratuito, sin atribución
//     obligatoria). Ninguna muestra marcas de fabricantes ni se presenta como producto de
//     la tienda: ilustran cada sistema del vehículo.
//
// Recortes:
//   full → la foto entera (solo el hero de escritorio)
//   card → encuadre para bloques, tarjetas y el hero en móvil

const VIDEO = '_material-cliente/fotogramas';
const UNSPLASH = '_material-fotos/unsplash';
const LIMPIO = { left: 0, top: 140, width: 720, height: 800 }; // sin marca de agua ni subtítulos

export default [
  {
    id: 'hero-freno',
    src: `${UNSPLASH}/1760317890322-364a810cd4da.jpg`,
    alt: 'Disco de freno perforado y mordaza montados en la rueda de un vehículo, con la suspensión al fondo',
    crops: {
      full: { left: 0, top: 0, width: 2600, height: 1737 },
      // móvil: franja 16:10 centrada en el disco y la mordaza
      card: { left: 380, top: 380, width: 1960, height: 1225 },
    },
  },
  {
    id: 'suspension',
    src: `${UNSPLASH}/1772308005714-976160554238.jpg`,
    alt: 'Amortiguador con resorte helicoidal montado en la suspensión de un vehículo',
    crops: {
      card: { left: 700, top: 0, width: 1700, height: 1727 },
    },
  },
  {
    id: 'frenos',
    src: `${UNSPLASH}/1613214150384-14921ff659b2.jpg`,
    alt: 'Disco de freno y mordaza de un vehículo sin la rueda',
    crops: {
      card: { left: 120, top: 0, width: 2200, height: 1733 },
    },
  },
  {
    id: 'motor',
    src: `${UNSPLASH}/1429772011165-0c2e054367b8.jpg`,
    alt: 'Culata de motor abierta con árboles de levas y cadena de distribución',
    crops: {
      card: { left: 0, top: 200, width: 2200, height: 1533 },
    },
  },
  {
    id: 'local-asesor',
    src: `${VIDEO}/video-35.0s.png`,
    alt: 'Asesor de Serna Repuestos frente a las estanterías del local',
    crops: { card: LIMPIO },
  },
  {
    id: 'local-estanteria',
    src: `${VIDEO}/video-38.0s.png`,
    alt: 'Estanterías del local de Serna Repuestos con cajas de repuestos etiquetadas',
    crops: { card: LIMPIO },
  },
  {
    id: 'local-fachada',
    src: `${VIDEO}/video-15.6s.png`,
    alt: 'Fachada del local de Serna Repuestos en el sector La María, El Carmen de Viboral',
    crops: { card: LIMPIO },
  },
];

// Anchos candidatos; se descartan los mayores que el recorte (nunca se amplía).
// 840: pantallas de ~412 px con densidad 2 (el caso más común en Android).
export const WIDTHS = [360, 540, 720, 840, 960, 1280, 1600, 2000];
