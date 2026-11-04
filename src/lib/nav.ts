// Navegación del sitio. «Repuestos» lleva al catálogo; el resto, a secciones de la portada.
// `seccion` = id de la sección de la portada que marca el enlace como activo al desplazarse.
export const NAV = [
  { href: '/#inicio', texto: 'Inicio', seccion: 'inicio' },
  { href: '/repuestos/', texto: 'Repuestos', seccion: null },
  { href: '/#especialidades', texto: 'Especialidades', seccion: 'especialidades' },
  { href: '/#nosotros', texto: 'Nosotros', seccion: 'nosotros' },
  { href: '/#contacto', texto: 'Contacto', seccion: 'contacto' },
] as const;
