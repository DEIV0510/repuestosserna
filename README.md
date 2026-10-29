# Serna Repuestos — sitio web

Sitio de una página para **Serna Repuestos** (El Carmen de Viboral, Antioquia): repuestos de suspensión, frenos y motor, con WhatsApp como canal de venta.

- **Astro 7** estático, sin librerías de interfaz. Un único módulo de JavaScript (~5 KB) para cabecera, menú, apariciones, formulario y analítica.
- Contenido y datos de la empresa: `src/lib/contacto.ts` (única fuente) y `src/lib/whatsapp.ts` (mensajes).
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
