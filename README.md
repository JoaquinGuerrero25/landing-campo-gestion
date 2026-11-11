# Gestión de Campo — Landing

Landing page de **Gestión de Campo**, aplicación de gestión para productores de agricultura extensiva (margen por lote, stock con costo promedio, carga sin señal).

Sitio estático: HTML + CSS + JavaScript puro, sin build ni dependencias. Tema claro/oscuro automático, accesible (WCAG AA) y con `prefers-reduced-motion`.

## Estructura

```
index.html        Contenido y SEO (meta, Open Graph, JSON-LD)
css/styles.css    Variables de diseño, base y estados hover/focus
js/main.js        Menú móvil, FAQ, formulario y animaciones de entrada
assets/           Logo, íconos y fotos
```

## Ver en local

```bash
python -m http.server 5173
```

Abrir http://localhost:5173.

## Pendientes de contenido

Buscar en `index.html` los textos entre corchetes, resaltados en ocre: `[correo]`, `[teléfono / WhatsApp]`, `[completar: IVA y tipo de cambio]`, `[cupo]` y `[Razón social · CUIT]`. También faltan las páginas de Términos y Privacidad (`#terminos`, `#privacidad`) y las fotos marcadas como espacio reservado.

## Capturas de la aplicación

`assets/app-margen.webp`, `app-stock.webp` y `app-celular.webp` son capturas reales de la aplicación con los datos ficticios de su demostración (organización «Agropecuaria Los Ñandúes SA (demo)», campaña 2024/25, en modo oscuro). Se generaron con `pnpm --filter @campo/api demo:seed` sobre una base aparte, la API y el cliente, y Chrome en 1440×900 a 2× (escritorio, 2880×1800) y 390×823 a 3× (celular). Para actualizarlas, repetir ese proceso y reemplazar los archivos.

Siguen como espacio reservado las tres fotos (productor con el celular, camión cargando grano, campo de soja al atardecer): hay que reemplazarlas por fotos reales.

## Formulario

Por defecto solo valida y muestra la confirmación. Para recibir los datos, poner la URL de un servicio (Formspree, Getform, un webhook propio) en `data-endpoint` del `<form>`: se envía un POST con JSON.

## Publicación

Cualquier hosting estático sirve (GitHub Pages, Netlify, Cloudflare Pages, Vercel).
