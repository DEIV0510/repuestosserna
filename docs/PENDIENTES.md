# Pendientes de configuración — Serna Repuestos

Datos que **no se inventaron** porque no están confirmados. El sitio funciona sin ellos y se adapta solo cuando se completan.

| Dato | Estado | Dónde se cambia |
|---|---|---|
| **URL de Facebook** | El nombre comercial «Serna Repuestos» está confirmado; la URL exacta de la página no aparece en buscadores. Hoy el sitio muestra el nombre **sin enlace** (contacto y pie). | `src/lib/contacto.ts` → `FACEBOOK.url`. Al ponerla, aparecen solos el enlace y el botón «Facebook». |
| **Dominio definitivo** | Sin dominio no se publican `canonical`, `og:url` ni el sitemap con URL absoluta. En Vercel se usa automáticamente el dominio de producción del proyecto (`VERCEL_PROJECT_PRODUCTION_URL`). | Variable de entorno `SITE_URL` (p. ej. `https://www.sernarepuestos.com`) al compilar, o el dominio de producción en Vercel. |
| **Horario de atención** | En el video de apertura se dice «Nuestro horario de atención será desde las 8 a. m. hasta las 6 p. m.», pero no se mencionan los días. No se publicó para no dar información incompleta. | Confirmar días y horas con el cliente; agregarlo en `src/lib/contacto.ts` y en los datos estructurados de `src/layouts/Base.astro` (`openingHoursSpecification`). |
| **Coordenadas del local** | No se publicaron (no están confirmadas). El mapa y «Cómo llegar» usan la dirección escrita. | Si el cliente comparte el punto exacto de Google Maps, se puede usar su enlace en `MAPS_INDICACIONES`. |
| **Analítica** | No hay Google Analytics, Meta Pixel ni CRM instalados. Los clics en WhatsApp, Instagram, mapa y menú ya se publican en `window.dataLayer` y como evento `serna:cta`. | Instalar la herramienta que elija el cliente: recibirá los eventos sin tocar el código (`src/scripts/analitica.ts`). |
| **Fotos de productos propios** | No se entregaron fotos de producto. Las especialidades usan fotos de Unsplash (ver `CREDITOS-FOTOS.md`) que ilustran cada sistema, no referencias de la tienda. | Reemplazarlas por fotos reales cuando existan: `scripts/imagenes.config.mjs` + `npm run images`. |
| **Marcas, precios, garantías** | No se mencionan en ningún lugar. | — |

## Lo que sí se usó del material del cliente

- **Logo** (`_material-cliente/logo-serna.pdf`): es una foto JPEG del logo sobre fondo negro. Se usa el raster original con el negro convertido en transparencia (sin redibujar ni cambiar proporciones). Ver `scripts/marca.mjs`.
- **Video de apertura** (`_material-cliente/video-apertura.mp4`, no se sube al repositorio por su peso): de ahí salen las tres fotos reales del local (asesor, estanterías y fachada) y los ejemplos de productos que la propia tienda nombra: *amortiguadores traseros, terminales de dirección, brazos de dirección y pastillas*. Transcripción en `_material-cliente/transcripcion-video.txt`.
