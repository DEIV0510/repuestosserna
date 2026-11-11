// Formularios que arman un mensaje de WhatsApp (form[data-solicitud]):
//   «cotizar» (#solicitud) → mensajeSolicitud: tipo obligatorio, repuesto opcional.
//   «buscar»  (#busqueda, diálogo de búsqueda especial) → mensajeBusqueda: repuesto obligatorio.
// · Valida al enviar; después, cada campo corregido limpia su error mientras se escribe
//   (no se validan campos en blur: mover el error cambia el sitio del siguiente clic).
// · Abre WhatsApp dentro del mismo evento de envío (si se espera, Safari lo bloquea) y deja
//   un enlace de respaldo por si el navegador no abrió la pestaña.
// · La foto no se sube: si la persona marca «Tengo una foto», el mensaje lo dice y se le
//   recuerda adjuntarla en el chat.
// · Guarda lo escrito en sessionStorage: el vehículo se comparte entre los dos formularios;
//   en las páginas de un sistema solo se recupera el vehículo (el tipo es el de la página).
// · «Cotizar este repuesto» (fichas) llena el formulario de cotización; «¿No encuentras tu
//   repuesto?» abre la búsqueda especial (con lo buscado, si viene del catálogo).
import { mensajeBusqueda, mensajeSolicitud, waUrl, type Solicitud } from '@/lib/whatsapp';
import { registrar } from './analitica';

type Modo = 'cotizar' | 'buscar';
type Campo = 'tipo' | 'repuesto' | 'marca' | 'modelo' | 'anio';
const REQUERIDOS: Record<Modo, Campo[]> = {
  cotizar: ['tipo', 'marca', 'modelo', 'anio'],
  buscar: ['repuesto', 'marca', 'modelo', 'anio'],
};
const VEHICULO = ['marca', 'modelo', 'anio'] as const;
const CLAVE_VEHICULO = 'sr_vehiculo';
const ANIO_MIN = 1950;

const leer = <T>(clave: string): T | null => {
  try {
    return JSON.parse(sessionStorage.getItem(clave) || 'null') as T | null;
  } catch {
    return null;
  }
};
const escribir = (clave: string, valor: unknown) => {
  try {
    sessionStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* modo privado o almacenamiento bloqueado: no pasa nada */
  }
};

interface Formulario {
  form: HTMLFormElement;
  llenar: (d: { tipo?: string; repuesto?: string }) => void;
  enfocarFaltante: (retraso: number) => void;
  /** Vuelve a leer el vehículo guardado (lo pudo escribir el otro formulario). */
  refrescarVehiculo: () => void;
}

function iniciarFormulario(form: HTMLFormElement): Formulario {
  const modo = (form.dataset.solicitud as Modo) || 'cotizar';
  const CAMPOS = REQUERIDOS[modo];
  const claveForm = `sr_form_${form.id}`;
  const anioMax = Number(form.dataset.anioMax) || new Date().getFullYear() + 1;
  const resumen = form.querySelector<HTMLElement>('[data-resumen]')!;
  const estado = form.querySelector<HTMLElement>('[data-estado]')!;
  const boton = form.querySelector<HTMLButtonElement>('[data-enviar]')!;
  const botonTexto = form.querySelector<HTMLElement>('[data-enviar-texto]')!;
  const textoBoton = botonTexto.textContent ?? '';
  const contador = form.querySelector<HTMLElement>('[data-contador]');
  const ticket = document.querySelector<HTMLElement>(`[data-ticket="${form.id}"]`);
  const detalle = form.elements.namedItem('detalle') as HTMLTextAreaElement | null;
  const fieldsetTipo = form.querySelector<HTMLFieldSetElement>('.campo--tipo');
  const tipoDePagina = form.dataset.tipoInicial || '';
  let intentado = false;

  const control = (n: string) => form.elements.namedItem(n) as HTMLInputElement | null;
  const texto = (n: string) => (control(n)?.value ?? '').replace(/\s+/g, ' ').trim();
  const tipo = () => form.querySelector<HTMLInputElement>('input[name="tipo"]:checked')?.value ?? '';
  const datos = (): Solicitud => ({
    tipo: tipo(),
    repuesto: texto('repuesto'),
    marca: texto('marca'),
    modelo: texto('modelo'),
    anio: texto('anio'),
    detalle: texto('detalle'),
    foto: !!control('foto')?.checked,
  });
  const mensaje = (d: Solicitud) => (modo === 'buscar' ? mensajeBusqueda(d) : mensajeSolicitud(d));

  function validar(c: Campo): string {
    const d = datos();
    switch (c) {
      case 'tipo':
        return d.tipo ? '' : 'Elige el tipo de repuesto: suspensión, frenos o motor.';
      case 'repuesto':
        if (!d.repuesto) return 'Escribe qué repuesto buscas.';
        if (d.repuesto.length < 3) return 'Describe el repuesto con al menos 3 caracteres.';
        return '';
      case 'marca':
        if (!d.marca) return 'Escribe la marca del vehículo.';
        if (d.marca.length < 2) return 'La marca debe tener al menos 2 caracteres.';
        if (!/^[\p{L}\p{N} .'&-]+$/u.test(d.marca)) return 'Usa solo letras, números, espacios o guiones.';
        return '';
      case 'modelo':
        if (!d.modelo) return 'Escribe el modelo del vehículo.';
        if (!/^[\p{L}\p{N} .,'&/()+-]+$/u.test(d.modelo)) return 'El modelo tiene caracteres no válidos.';
        return '';
      case 'anio': {
        if (!d.anio) return 'Escribe el año del vehículo.';
        if (!/^\d{4}$/.test(d.anio)) return 'Escribe el año con 4 cifras, por ejemplo 2015.';
        const n = Number(d.anio);
        if (n < ANIO_MIN || n > anioMax) return `El año debe estar entre ${ANIO_MIN} y ${anioMax}.`;
        return '';
      }
    }
  }

  function pintarError(c: Campo, msg: string) {
    const el = form.querySelector<HTMLElement>(`[data-error="${c}"]`);
    if (!el) return;
    el.textContent = msg;
    el.hidden = !msg;
    const objetivo = c === 'tipo' ? fieldsetTipo : control(c);
    if (!objetivo) return;
    if (msg) objetivo.setAttribute('aria-invalid', 'true');
    else objetivo.removeAttribute('aria-invalid');
  }

  function actualizarTicket() {
    if (!ticket) return;
    const d = datos();
    const v = (t?: string) => t || '____';
    ticket.textContent = mensaje({ ...d, tipo: v(d.tipo), marca: v(d.marca), modelo: v(d.modelo), anio: v(d.anio), repuesto: modo === 'buscar' ? v(d.repuesto) : d.repuesto });
  }

  function guardar() {
    const d = datos();
    escribir(CLAVE_VEHICULO, { marca: d.marca, modelo: d.modelo, anio: d.anio });
    escribir(claveForm, { tipo: d.tipo, repuesto: d.repuesto, detalle: d.detalle, foto: d.foto });
  }

  function refrescarVehiculo() {
    const v = leer<Record<string, string>>(CLAVE_VEHICULO);
    if (v) VEHICULO.forEach((n) => v[n] && control(n) && (control(n)!.value = v[n]));
    actualizarTicket();
  }

  function restaurar() {
    // Datos propios del formulario (no en la página de un sistema: allí manda la página).
    const propio = leer<Partial<Solicitud>>(claveForm);
    if (propio && !tipoDePagina) {
      const radio = propio.tipo ? form.querySelector<HTMLInputElement>(`input[name="tipo"][value="${CSS.escape(propio.tipo)}"]`) : null;
      if (radio) radio.checked = true;
      if (propio.repuesto && control('repuesto')) control('repuesto')!.value = propio.repuesto;
      if (propio.detalle && detalle) detalle.value = propio.detalle;
      if (control('foto')) control('foto')!.checked = !!propio.foto;
    }
    refrescarVehiculo();
  }

  function actualizarContador() {
    if (contador && detalle) contador.textContent = `${detalle.value.length} / ${detalle.maxLength}`;
  }

  restaurar();
  actualizarContador();
  actualizarTicket();

  // El año solo admite cifras (también al pegar).
  const anio = control('anio')!;
  anio.addEventListener('input', () => {
    const limpio = anio.value.replace(/\D/g, '').slice(0, 4);
    if (limpio !== anio.value) anio.value = limpio;
  });

  form.addEventListener('input', (e) => {
    const nombre = (e.target as HTMLInputElement).name;
    if (nombre === 'detalle') actualizarContador();
    actualizarTicket();
    guardar();
    estado.textContent = '';
    // Tras un intento de envío, el error de un campo desaparece en cuanto se corrige.
    if (intentado && (CAMPOS as string[]).includes(nombre) && !validar(nombre as Campo)) {
      pintarError(nombre as Campo, '');
      if (!CAMPOS.some((c) => validar(c))) resumen.hidden = true;
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    intentado = true;
    const errores = CAMPOS.map((c) => [c, validar(c)] as const).filter(([, m]) => m);
    CAMPOS.forEach((c) => pintarError(c, errores.find(([k]) => k === c)?.[1] ?? ''));

    if (errores.length) {
      resumen.textContent =
        errores.length === 1 ? 'Revisa el campo marcado para poder armar tu solicitud.' : `Revisa los ${errores.length} campos marcados para poder armar tu solicitud.`;
      resumen.hidden = false;
      const primero = errores[0][0];
      const foco = primero === 'tipo' ? form.querySelector<HTMLInputElement>('input[name="tipo"]') : control(primero);
      foco?.focus();
      registrar('solicitud_invalida', { formulario: modo, campos: errores.map(([c]) => c).join(',') });
      return;
    }

    resumen.hidden = true;
    const d = datos();
    const url = waUrl(mensaje(d));
    guardar();

    // Se abre ya, dentro del gesto del usuario.
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    registrar('clic_whatsapp', { ubicacion: modo === 'buscar' ? 'busqueda_especial' : 'formulario', especialidad: d.tipo, foto: d.foto ? 'si' : 'no' });

    // Estado de carga breve y respaldo visible.
    boton.setAttribute('aria-busy', 'true');
    botonTexto.textContent = 'Abriendo WhatsApp…';
    window.setTimeout(() => {
      boton.removeAttribute('aria-busy');
      botonTexto.textContent = textoBoton;
      estado.textContent = '';
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.target = '_blank';
      enlace.rel = 'noopener';
      enlace.textContent = 'Ábrelo aquí';
      const foto = d.foto ? ' Adjunta la foto en el chat con el ícono del clip.' : '';
      estado.append(`Tu mensaje está listo en WhatsApp.${foto} ¿No se abrió? `, enlace, '.');
    }, 900);
  });

  return {
    form,
    llenar({ tipo: t, repuesto }) {
      const radio = t ? form.querySelector<HTMLInputElement>(`input[name="tipo"][value="${CSS.escape(t)}"]`) : null;
      if (radio) radio.checked = true;
      if (repuesto !== undefined && control('repuesto')) control('repuesto')!.value = repuesto;
      if (intentado) CAMPOS.forEach((c) => !validar(c) && pintarError(c, ''));
      estado.textContent = '';
      actualizarTicket();
      guardar();
    },
    enfocarFaltante(retraso) {
      // Con teclado o ratón se deja el cursor en el primer dato que falta; en pantallas
      // táctiles no, para no abrir el teclado sin que la persona lo pida.
      if (!matchMedia('(pointer: fine)').matches) return;
      const orden = modo === 'buscar' ? (['repuesto', ...VEHICULO] as const) : VEHICULO;
      const falta = orden.find((n) => !texto(n)) ?? orden[0];
      window.setTimeout(() => control(falta)?.focus({ preventScroll: true }), retraso);
    },
    refrescarVehiculo,
  };
}

export function iniciarSolicitud() {
  const formularios = new Map<string, Formulario>();
  document.querySelectorAll<HTMLFormElement>('form[data-solicitud]').forEach((f) => formularios.set(f.id, iniciarFormulario(f)));
  const cotizar = formularios.get('solicitud');
  const buscar = formularios.get('busqueda');
  const dialogo = document.querySelector<HTMLDialogElement>('#busqueda-especial');
  const reducir = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // «Cotizar este repuesto»: llena tipo y repuesto, marca la ficha y trae al formulario.
  document.addEventListener('click', (e) => {
    const disparador = (e.target as Element | null)?.closest<HTMLElement>('[data-cotizar]');
    if (!disparador || !cotizar) return;
    e.preventDefault();
    const nombre = disparador.dataset.nombre || '';
    const tipoFicha = disparador.dataset.tipo || '';
    cotizar.llenar({ tipo: tipoFicha, repuesto: nombre });
    document.querySelectorAll('.ficha.is-elegida').forEach((f) => f.classList.remove('is-elegida'));
    disparador.closest('.ficha')?.classList.add('is-elegida');
    const aviso = cotizar.form.querySelector<HTMLElement>('[data-aviso]');
    if (aviso) {
      aviso.textContent = nombre
        ? `Elegiste: ${nombre}${tipoFicha ? ` (${tipoFicha.toLowerCase()})` : ''}. Completa los datos de tu vehículo.`
        : 'Completa los datos de tu vehículo.';
      aviso.hidden = false;
    }
    registrar('cotizar_ficha', { repuesto: nombre, especialidad: tipoFicha });
    (document.getElementById('cotizar') ?? cotizar.form).scrollIntoView({ behavior: reducir() ? 'auto' : 'smooth', block: 'start' });
    cotizar.enfocarFaltante(reducir() ? 0 : 500);
  });

  // «¿No encuentras tu repuesto?»: abre la búsqueda especial (sin JS, el enlace va a WhatsApp).
  if (!dialogo || !buscar || typeof dialogo.showModal !== 'function') return;
  const html = document.documentElement;
  let origen: HTMLElement | null = null;
  document.addEventListener('click', (e) => {
    const disparador = (e.target as Element | null)?.closest<HTMLElement>('[data-abrir-busqueda]');
    if (!disparador) return;
    e.preventDefault();
    origen = disparador;
    buscar.refrescarVehiculo();
    if (disparador.dataset.nombre) buscar.llenar({ repuesto: disparador.dataset.nombre });
    dialogo.showModal();
    html.classList.add('is-menu');
    buscar.enfocarFaltante(60);
    registrar('busqueda_especial_abierta', { ubicacion: disparador.dataset.cta });
  });
  dialogo.querySelectorAll('[data-cerrar-busqueda]').forEach((b) => b.addEventListener('click', () => dialogo.close()));
  // Clic en el fondo oscuro (fuera del panel) también cierra.
  dialogo.addEventListener('click', (e) => e.target === dialogo && dialogo.close());
  dialogo.addEventListener('close', () => {
    html.classList.remove('is-menu');
    origen?.focus({ preventScroll: true });
    // Lo que se escribió aquí también sirve en el formulario de cotización de la página.
    cotizar?.refrescarVehiculo();
  });
}
