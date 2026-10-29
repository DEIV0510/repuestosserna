// Formulario de solicitud de repuesto → mensaje de WhatsApp.
// · Valida al enviar; después, cada campo corregido limpia su error mientras se escribe
//   (no se validan campos en blur: mover el error cambia el sitio del siguiente clic).
// · Abre WhatsApp dentro del mismo evento de envío (si se espera, Safari lo bloquea) y deja
//   un enlace de respaldo por si el navegador no abrió la pestaña.
// · Guarda lo escrito en sessionStorage: al volver de WhatsApp los datos siguen ahí.
import { mensajeSolicitud, waUrl, type Solicitud } from '@/lib/whatsapp';
import { registrar } from './analitica';

type Campo = 'tipo' | 'marca' | 'modelo' | 'anio';
const CLAVE = 'sr_solicitud';
const ANIO_MIN = 1950;

export function iniciarSolicitud() {
  const form = document.querySelector<HTMLFormElement>('#solicitud');
  if (!form) return;
  const anioMax = Number(form.dataset.anioMax) || new Date().getFullYear() + 1;
  const resumen = form.querySelector<HTMLElement>('[data-resumen]')!;
  const estado = form.querySelector<HTMLElement>('[data-estado]')!;
  const boton = form.querySelector<HTMLButtonElement>('[data-enviar]')!;
  const botonTexto = form.querySelector<HTMLElement>('[data-enviar-texto]')!;
  const contador = form.querySelector<HTMLElement>('[data-contador]')!;
  const ticket = document.querySelector<HTMLElement>('[data-ticket]');
  const detalle = form.elements.namedItem('detalle') as HTMLTextAreaElement;
  const fieldsetTipo = form.querySelector<HTMLFieldSetElement>('.campo--tipo')!;
  let intentado = false;

  const texto = (n: string) => ((form.elements.namedItem(n) as HTMLInputElement | null)?.value ?? '').replace(/\s+/g, ' ').trim();
  const tipo = () => form.querySelector<HTMLInputElement>('input[name="tipo"]:checked')?.value ?? '';
  const datos = (): Solicitud => ({ tipo: tipo(), marca: texto('marca'), modelo: texto('modelo'), anio: texto('anio'), detalle: texto('detalle') });

  function validar(c: Campo): string {
    const d = datos();
    switch (c) {
      case 'tipo':
        return d.tipo ? '' : 'Elige el tipo de repuesto: suspensión, frenos o motor.';
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
    const el = form!.querySelector<HTMLElement>(`[data-error="${c}"]`)!;
    el.textContent = msg;
    el.hidden = !msg;
    const objetivo = c === 'tipo' ? fieldsetTipo : (form!.elements.namedItem(c) as HTMLElement);
    if (msg) objetivo.setAttribute('aria-invalid', 'true');
    else objetivo.removeAttribute('aria-invalid');
  }

  const CAMPOS: Campo[] = ['tipo', 'marca', 'modelo', 'anio'];

  function actualizarTicket() {
    if (!ticket) return;
    const d = datos();
    ticket.textContent = mensajeSolicitud({
      tipo: d.tipo || '____',
      marca: d.marca || '____',
      modelo: d.modelo || '____',
      anio: d.anio || '____',
      detalle: d.detalle,
    });
  }

  function guardar() {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(datos()));
    } catch {
      /* modo privado o almacenamiento bloqueado: no pasa nada */
    }
  }

  function restaurar() {
    try {
      const d = JSON.parse(sessionStorage.getItem(CLAVE) || 'null') as Solicitud | null;
      if (!d) return;
      const radio = form!.querySelector<HTMLInputElement>(`input[name="tipo"][value="${CSS.escape(d.tipo)}"]`);
      if (radio) radio.checked = true;
      (['marca', 'modelo', 'anio', 'detalle'] as const).forEach((n) => {
        const el = form!.elements.namedItem(n) as HTMLInputElement;
        if (el && d[n]) el.value = d[n]!;
      });
    } catch {
      /* datos dañados: se ignoran */
    }
  }

  function actualizarContador() {
    contador.textContent = `${detalle.value.length} / ${detalle.maxLength}`;
  }

  restaurar();
  actualizarContador();
  actualizarTicket();

  // El año solo admite cifras (también al pegar).
  const anio = form.elements.namedItem('anio') as HTMLInputElement;
  anio.addEventListener('input', () => {
    const limpio = anio.value.replace(/\D/g, '').slice(0, 4);
    if (limpio !== anio.value) anio.value = limpio;
  });

  form.addEventListener('input', (e) => {
    const nombre = (e.target as HTMLInputElement).name as Campo | 'detalle';
    if (nombre === 'detalle') actualizarContador();
    actualizarTicket();
    guardar();
    estado.textContent = '';
    // Tras un intento de envío, el error de un campo desaparece en cuanto se corrige.
    if (intentado && nombre !== 'detalle' && !validar(nombre)) {
      pintarError(nombre, '');
      const quedan = CAMPOS.filter((c) => validar(c)).length;
      if (!quedan) resumen.hidden = true;
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
      const foco = primero === 'tipo' ? form.querySelector<HTMLInputElement>('input[name="tipo"]') : (form.elements.namedItem(primero) as HTMLElement);
      foco?.focus();
      registrar('solicitud_invalida', { campos: errores.map(([c]) => c).join(',') });
      return;
    }

    resumen.hidden = true;
    const d = datos();
    const url = waUrl(mensajeSolicitud(d));
    guardar();

    // Se abre ya, dentro del gesto del usuario.
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    registrar('clic_whatsapp', { ubicacion: 'formulario', especialidad: d.tipo });

    // Estado de carga breve y respaldo visible.
    boton.setAttribute('aria-busy', 'true');
    botonTexto.textContent = 'Abriendo WhatsApp…';
    window.setTimeout(() => {
      boton.removeAttribute('aria-busy');
      botonTexto.textContent = 'Enviar solicitud por WhatsApp';
      estado.textContent = '';
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.target = '_blank';
      enlace.rel = 'noopener';
      enlace.textContent = 'Ábrelo aquí';
      estado.append('Tu mensaje está listo en WhatsApp. ¿No se abrió? ', enlace, '.');
    }, 900);
  });
}
