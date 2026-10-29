# Sistema de diseño — Serna Repuestos

Concepto: **ingeniería, precisión y movimiento**. El lenguaje sale del propio logo y de los catálogos técnicos.

## Reglas

- **Un solo ángulo: 12°**, la inclinación del nombre SERNA. Se usa en el corte de la foto del hero, el filo azul que lo acompaña, el barrido de los botones y la pantalla de carga, y los cortes entre foto y placa de Frenos y Motor.
- **Trazo afilado azul** (`.trazo`): las líneas que flanquean «REPUESTOS» en el logo. Marca los rótulos de sección en lugar de cápsulas o etiquetas redondeadas.
- **Esquinas rectas** en todo. Las únicas «esquinas» decorativas son las marcas de registro azules (formulario, placa del logo), como en un plano.
- **Superficies alternadas**: grafito (hero, solicitud, nosotros, pie) y niebla clara (especialidades, asesoría, contacto). Cada sección declara `sup-oscuro` o `sup-claro` y los componentes leen `--texto`, `--texto-2`, `--linea`, `--foco`.
- **Logo solo sobre oscuro**, como fue diseñado (`components/Logo.astro`).
- **Sin cifras inventadas** (clientes, años, porcentajes) ni coordenadas sueltas que parezcan teléfonos.

## Tokens (`src/styles/global.css`)

| Token | Valor | Uso |
|---|---|---|
| `--azul` | `#003af9` | Medido en el logo. Botones principales (contraste 7:1 con blanco) |
| `--azul-vivo` | `#1f55ff` | Barridos, filos, indicadores |
| `--azul-luz` | `#6b93ff` | Azul legible sobre grafito (texto y foco) |
| `--grafito` / `-2` / `-3` | `#0c0e11` / `#13161a` / `#1a1e23` | Superficies oscuras |
| `--acero` | `#2c333b` | Líneas sobre oscuro |
| `--titanio` | `#98a1ab` | Texto secundario sobre oscuro |
| `--plata` | `#d9dce0` | Texto de apoyo sobre oscuro |
| `--claro` | `#f3f4f6` | Superficie clara |
| `--tinta` / `--tinta-2` | `#0d1014` / `#4a525c` | Texto sobre claro |

Tipografía: **Archivo** (800, ancho 106 %, titulares en mayúsculas) e **Inter** (400–600, texto e interfaz), autoalojadas y recortadas (`npm run fonts`), con fuentes de respaldo de métricas ajustadas para que el diseño no salte.

Escala: `--t-xs` 12 px · `--t-sm` 14 px · `--t-base` 16 px · `--t-md` 18 px · `--t-lg` / `--t-xl` / `--t-2xl` / `--t-hero` fluidas con `clamp()`.

Espaciado: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 px; secciones `--sec` (72–136 px). Ancho máximo 1320 px + márgenes `--gutter` (16–56 px).

Puntos de quiebre: 560 · 600 · 700 · 900 (hero de escritorio) · 1024 (navegación completa y rejillas) · 1200 px.

Movimiento: `--ease-out` para entradas, 180 / 360 / 720 ms. Todo respeta `prefers-reduced-motion`; los equipos modestos o con ahorro de datos (`html.is-ligero`) no tienen parallax.
