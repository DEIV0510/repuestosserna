# Serna Repuestos — sitio web

Sitio de **Serna Repuestos** (El Carmen de Viboral, Antioquia): repuestos de suspensión, frenos y motor, con WhatsApp como canal de venta.

Páginas: portada (`/`), catálogo con buscador (`/repuestos/`) y una página por sistema (`/repuestos/suspension/`, `/repuestos/frenos/`, `/repuestos/motor/`). Cada ficha explica la pieza y su botón «Cotizar este repuesto» llena el formulario de la misma página; WhatsApp se abre al enviar, con el repuesto y los datos del vehículo en el mensaje.

- **Astro 7** estático, sin librerías de interfaz. Un único módulo de JavaScript (~7 KB) para cabecera, menú, apariciones, formulario y analítica.
- Contenido y datos de la empresa: `src/lib/contacto.ts` (única fuente) y `src/lib/whatsapp.ts` (mensajes).
- Catálogo: `src/data/repuestos.ts` (sistemas y fichas) y `src/data/dibujos.ts` (dibujos técnicos SVG). El buscador vive en `src/scripts/catalogo.ts`.
- Búsqueda especial (repuestos fuera del catálogo, en ámbar): `BusquedaEspecial.astro` (pestaña + diálogo) y `SeccionBusqueda.astro` (franja). Los dos formularios comparten `src/scripts/solicitud.ts` y `src/styles/formulario.css`.

## Fotos de los repuestos

Deja cada foto en `_material-cliente/repuestos/` con el id de su ficha (`amortiguadores.jpg`, `pastillas-de-freno.jpg`…) y corre `npm run images`: la ficha muestra la foto en lugar del dibujo. Referencia, compatibilidad y precio (opcionales) van en `src/data/repuestos.ts`.
- Lo que falta confirmar: [`docs/PENDIENTES.md`](docs/PENDIENTES.md). Origen de cada foto: [`docs/CREDITOS-FOTOS.md`](docs/CREDITOS-FOTOS.md). Sistema de diseño: [`docs/DISENO.md`](docs/DISENO.md).

## Uso

```bash
npm install
npm run dev        # http://localhost:5560
npm run check      # astro check + build + verificación de dist/
npm run preview    # sirve dist/ como en producción (http://localhost:5561)
```

Recursos (solo si cambian los originales):

```bash
npm run fonts      # recorta Archivo e Inter → public/fonts + src/styles/fuentes.css
npm run brand      # logo con transparencia, favicons y og.jpg → public/marca, public/
npm run images     # fotos AVIF + WebP en anchos reales → public/img + src/data/media.json
```

## Despliegue (Vercel)

Proyecto estático: framework **Astro**, comando `npm run build`, salida `dist/`. `vercel.json` fija la barra final y la caché inmutable de `/_astro`, `/img`, `/fonts` y `/marca`.

El dominio sale de `SITE_URL` o, en Vercel, del dominio de producción del proyecto: con él se publican `canonical`, `og:url` y el sitemap.

## WhatsApp

Número comercial `313 780 0613` → `https://wa.me/573137800613`. Cada botón lleva su mensaje (general, asesor, suspensión, frenos, motor) codificado con `encodeURIComponent`; el formulario arma el mensaje con tipo, marca, modelo, año y detalle. `npm run check` falla si algún enlace usa otro número o pierde su mensaje.
