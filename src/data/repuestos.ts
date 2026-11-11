// Catálogo de repuestos por sistema.
//
// Pedido del cliente (audio del 2026-11-04): al tocar Suspensión, Frenos o Motor no debe
// ir directo a WhatsApp; la página debe mostrar los repuestos y permitir buscarlos.
//
// Regla: no hay inventario, referencias, marcas ni precios confirmados. Por eso esto es
// una GUÍA DE COMPONENTES de cada sistema (qué es cada pieza y qué tener en cuenta) para
// que la persona identifique lo que necesita y lo cotice. La página lo dice así.
// `mencionado: true` = la propia tienda lo nombra en su video de apertura (amortiguadores
// traseros, terminales de dirección, brazos de dirección y pastillas): van primero.
// Cuando el cliente entregue su lista real de productos (fotos, referencias, precios),
// se agregan aquí y las fichas se completan solas.
import type { MediaId } from '@/lib/media';
import type { Especialidad } from '@/lib/whatsapp';
import { normalizar } from '@/lib/texto';

export type SistemaId = Especialidad;

export interface Sistema {
  id: SistemaId;
  nombre: string;
  /** Para el formulario y los mensajes («Tipo: Suspensión»). */
  tipo: 'Suspensión' | 'Frenos' | 'Motor';
  icono: 'suspension' | 'frenos' | 'motor';
  foto: MediaId;
  /** Qué hace el sistema, en una o dos frases. */
  funcion: string;
  /** Señales generales para revisar el sistema (conocimiento general, no promesas). */
  senales: string[];
  /** Datos que conviene tener a mano para cotizar. */
  datos: string[];
}

export interface Repuesto {
  id: string;
  sistema: SistemaId;
  nombre: string;
  descripcion: string;
  consejo: string;
  /** Otras formas de llamarlo (para el buscador). */
  sinonimos: string[];
  dibujo: string;
  mencionado?: boolean;
  // Datos de producto real: solo cuando la tienda los entregue (sin datos, no se muestran).
  /** Referencia o número de parte. */
  referencia?: string;
  /** Vehículos con los que es compatible, tal como los indique la tienda. */
  compatibilidad?: string;
  /** Precio en pesos; null o ausente = se consulta. */
  precio?: number | null;
}

export const SISTEMAS: Sistema[] = [
  {
    id: 'suspension',
    nombre: 'Suspensión',
    tipo: 'Suspensión',
    icono: 'suspension',
    foto: 'suspension',
    funcion:
      'La suspensión y la dirección mantienen las llantas en contacto con la vía, absorben los golpes del camino y permiten que el vehículo gire con precisión.',
    senales: [
      'Golpes o ruidos al pasar por huecos o resaltos.',
      'El vehículo rebota o se balancea más de lo normal.',
      'Desgaste irregular de las llantas.',
      'El volante vibra o el carro se va hacia un lado.',
      'Manchas de aceite en el cuerpo del amortiguador.',
    ],
    datos: ['Marca, modelo y año del vehículo', 'Si es delantero o trasero', 'Lado: izquierdo, derecho o ambos', 'Una foto de la pieza, si la tienes'],
  },
  {
    id: 'frenos',
    nombre: 'Frenos',
    tipo: 'Frenos',
    icono: 'frenos',
    foto: 'frenos',
    funcion:
      'El sistema de frenado convierte la fuerza del pedal en presión hidráulica para detener el vehículo con seguridad, por disco o por tambor.',
    senales: [
      'Chillido o ruido metálico al frenar.',
      'El pedal se siente esponjoso o baja más de lo normal.',
      'Vibración en el pedal o en el volante al frenar.',
      'El carro se va hacia un lado al frenar.',
      'El testigo de frenos se enciende en el tablero.',
    ],
    datos: ['Marca, modelo y año del vehículo', 'Si es delantero o trasero', 'Si el freno es de disco o de tambor', 'Una foto de la pieza, si la tienes'],
  },
  {
    id: 'motor',
    nombre: 'Motor',
    tipo: 'Motor',
    icono: 'motor',
    foto: 'motor',
    funcion:
      'El motor necesita piezas de sellado, filtrado, encendido y refrigeración en buen estado para entregar su potencia sin fallas ni recalentamiento.',
    senales: [
      'El testigo de «check engine» se enciende.',
      'Pérdida de potencia o tirones al acelerar.',
      'La temperatura sube más de lo normal.',
      'Chillido de correas al encender o al acelerar.',
      'Fugas de aceite o de refrigerante debajo del carro.',
    ],
    datos: ['Marca, modelo y año del vehículo', 'Cilindraje y versión del motor', 'Si es a gasolina o diésel', 'Una foto de la pieza, si la tienes'],
  },
];

export const REPUESTOS: Repuesto[] = [
  // ---------- Suspensión y dirección ----------
  {
    id: 'amortiguadores',
    sistema: 'suspension',
    nombre: 'Amortiguadores',
    descripcion: 'Controlan el rebote del vehículo y mantienen las llantas pegadas a la vía.',
    consejo: 'Se recomienda cambiarlos por pares en el mismo eje.',
    sinonimos: ['amortiguador', 'amortiguadores traseros', 'amortiguadores delanteros', 'shock'],
    dibujo: 'amortiguador',
    mencionado: true,
  },
  {
    id: 'terminales-de-direccion',
    sistema: 'suspension',
    nombre: 'Terminales de dirección',
    descripcion: 'Unen la dirección con la rueda y la hacen girar cuando mueves el volante.',
    consejo: 'Después de cambiarlos hay que alinear el vehículo.',
    sinonimos: ['terminal', 'terminal de direccion', 'punta de direccion'],
    dibujo: 'terminal',
    mencionado: true,
  },
  {
    id: 'brazos-de-direccion',
    sistema: 'suspension',
    nombre: 'Brazos de dirección',
    descripcion: 'Transmiten el movimiento de la dirección hacia las ruedas, junto con los terminales.',
    consejo: 'Al cambiarlos también se recomienda alinear.',
    sinonimos: ['brazo de direccion', 'axial', 'axiales', 'barra de direccion'],
    dibujo: 'axial',
    mencionado: true,
  },
  {
    id: 'espirales',
    sistema: 'suspension',
    nombre: 'Espirales',
    descripcion: 'Resortes que sostienen el peso del vehículo y absorben las irregularidades del camino.',
    consejo: 'Indica si son delanteros o traseros; también se cambian por pares.',
    sinonimos: ['espiral', 'resorte', 'resortes', 'muelle'],
    dibujo: 'espiral',
  },
  {
    id: 'tijeras',
    sistema: 'suspension',
    nombre: 'Tijeras',
    descripcion: 'Brazos que conectan la rueda con el chasis y la mantienen en su posición.',
    consejo: 'Según el modelo, pueden venir con rótula y bujes incluidos.',
    sinonimos: ['tijera', 'brazo de suspension', 'brazo de control', 'horquilla'],
    dibujo: 'tijera',
  },
  {
    id: 'rotulas',
    sistema: 'suspension',
    nombre: 'Rótulas',
    descripcion: 'Articulaciones que permiten el giro y el movimiento vertical de la rueda.',
    consejo: 'Una rótula con juego suele sentirse como golpeteo en la parte delantera.',
    sinonimos: ['rotula', 'munon'],
    dibujo: 'rotula',
  },
  {
    id: 'bujes',
    sistema: 'suspension',
    nombre: 'Bujes',
    descripcion: 'Piezas de caucho que absorben vibraciones en las uniones de la suspensión.',
    consejo: 'Caucho agrietado o deformado es señal de cambio.',
    sinonimos: ['buje', 'bujes de tijera', 'silentblock', 'caucho'],
    dibujo: 'buje',
  },
  {
    id: 'bieletas',
    sistema: 'suspension',
    nombre: 'Bieletas',
    descripcion: 'Unen la barra estabilizadora y reducen la inclinación del carro en las curvas.',
    consejo: 'Cuando fallan suelen sonar como un golpe seco al pasar por huecos.',
    sinonimos: ['bieleta', 'link', 'barra estabilizadora', 'estabilizador'],
    dibujo: 'bieleta',
  },

  // ---------- Frenos ----------
  {
    id: 'pastillas-de-freno',
    sistema: 'frenos',
    nombre: 'Pastillas de freno',
    descripcion: 'Presionan el disco para detener el vehículo; son la pieza de mayor desgaste.',
    consejo: 'Indica si son delanteras o traseras: se cambian por eje.',
    sinonimos: ['pastillas', 'pastas', 'pastilla', 'balatas'],
    dibujo: 'pastillas',
    mencionado: true,
  },
  {
    id: 'discos-de-freno',
    sistema: 'frenos',
    nombre: 'Discos de freno',
    descripcion: 'Giran con la rueda y reciben la presión de las pastillas al frenar.',
    consejo: 'Tienen un grosor mínimo grabado; se cambian por pares.',
    sinonimos: ['disco', 'discos', 'rotor'],
    dibujo: 'disco',
  },
  {
    id: 'bandas-de-freno',
    sistema: 'frenos',
    nombre: 'Bandas de freno',
    descripcion: 'Zapatas que frenan por dentro de la campana en los frenos de tambor.',
    consejo: 'Van en los frenos de tambor, casi siempre en las ruedas traseras.',
    sinonimos: ['bandas', 'banda', 'zapatas', 'zapata'],
    dibujo: 'bandas',
  },
  {
    id: 'campanas',
    sistema: 'frenos',
    nombre: 'Campanas',
    descripcion: 'Tambor que gira con la rueda; las bandas presionan su interior al frenar.',
    consejo: 'Se revisan junto con las bandas en cada cambio.',
    sinonimos: ['campana', 'tambor', 'tambores'],
    dibujo: 'campana',
  },
  {
    id: 'mordazas',
    sistema: 'frenos',
    nombre: 'Mordazas',
    descripcion: 'Alojan las pastillas y las empujan contra el disco con presión hidráulica.',
    consejo: 'Un pistón pegado hace que el carro se vaya hacia un lado al frenar.',
    sinonimos: ['mordaza', 'caliper', 'calipers'],
    dibujo: 'mordaza',
  },
  {
    id: 'bombas-de-freno',
    sistema: 'frenos',
    nombre: 'Bombas de freno',
    descripcion: 'Convierten la fuerza del pedal en presión hidráulica para todo el sistema.',
    consejo: 'Un pedal que baja lentamente puede indicar una falla en la bomba.',
    sinonimos: ['bomba de freno', 'cilindro maestro', 'bombin'],
    dibujo: 'bomba-freno',
  },

  // ---------- Motor ----------
  {
    id: 'filtros',
    sistema: 'motor',
    nombre: 'Filtros',
    descripcion: 'De aceite, aire y combustible: mantienen limpio lo que entra al motor.',
    consejo: 'Ten a mano el cilindraje y si el motor es a gasolina o diésel.',
    sinonimos: ['filtro', 'filtro de aceite', 'filtro de aire', 'filtro de combustible', 'filtro de gasolina'],
    dibujo: 'filtros',
  },
  {
    id: 'correas',
    sistema: 'motor',
    nombre: 'Correas',
    descripcion: 'Mueven la distribución o los accesorios del motor, como el alternador.',
    consejo: 'La de distribución y la de accesorios son distintas: indica cuál necesitas.',
    sinonimos: ['correa', 'correa de distribucion', 'kit de distribucion', 'correa de accesorios', 'banda'],
    dibujo: 'correa',
  },
  {
    id: 'bujias',
    sistema: 'motor',
    nombre: 'Bujías',
    descripcion: 'Producen la chispa que enciende la mezcla en los motores a gasolina.',
    consejo: 'Indica el cilindraje y la versión del motor.',
    sinonimos: ['bujia', 'chispa', 'encendido'],
    dibujo: 'bujia',
  },
  {
    id: 'empaques',
    sistema: 'motor',
    nombre: 'Empaques',
    descripcion: 'Sellan las uniones del motor para evitar fugas de aceite, agua o compresión.',
    consejo: 'Si puedes, envía una foto del empaque o de la zona de la fuga.',
    sinonimos: ['empaque', 'empaque de culata', 'empaquetadura', 'junta'],
    dibujo: 'empaque',
  },
  {
    id: 'bombas-de-agua',
    sistema: 'motor',
    nombre: 'Bombas de agua',
    descripcion: 'Hacen circular el refrigerante para mantener la temperatura del motor.',
    consejo: 'En muchos motores se cambia junto con la correa de distribución.',
    sinonimos: ['bomba de agua', 'refrigeracion', 'refrigerante'],
    dibujo: 'bomba-agua',
  },
  {
    id: 'soportes-de-motor',
    sistema: 'motor',
    nombre: 'Soportes de motor',
    descripcion: 'Fijan el motor al chasis y absorben sus vibraciones.',
    consejo: 'Una vibración fuerte en la cabina al encender puede ser un soporte vencido.',
    sinonimos: ['soporte', 'soportes', 'base de motor', 'taco de motor'],
    dibujo: 'soporte',
  },
];

export const sistema = (id: SistemaId) => SISTEMAS.find((s) => s.id === id)!;
export const repuestosDe = (id: SistemaId) => REPUESTOS.filter((r) => r.sistema === id);

/** Texto (normalizado) en el que busca primero el buscador: nombre, sistema y sinónimos. */
export const textoBusqueda = (r: Repuesto) => normalizar([r.nombre, sistema(r.sistema).nombre, ...r.sinonimos].join(' '));
/** Respaldo: la descripción, solo si nada coincide por nombre (evita que «discos» traiga pastillas). */
export const textoDescripcion = (r: Repuesto) => normalizar(r.descripcion);
