# Gestión de Campo — Landing

Landing page de **Gestión de Campo**, aplicación de gestión para productores de agricultura extensiva (margen por lote, stock con costo promedio, carga sin señal).

Sitio estático: HTML + CSS + JavaScript puro, sin build ni dependencias. Modo claro/oscuro: sigue el del sistema y tiene un botón en la barra superior que recuerda la elección (`localStorage`, clave `gc-theme`), accesible (WCAG AA) y con `prefers-reduced-motion`.

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

Hay una versión por modo de cada captura: `assets/app-margen-{dark,light}.webp`, `app-stock-{dark,light}.webp` y `app-celular-{dark,light}.webp`. Son capturas reales de la aplicación con los datos ficticios de su demostración (organización «Agropecuaria Los Ñandúes SA (demo)», campaña 2024/25). Se generaron con `pnpm --filter @campo/api demo:seed` sobre una base aparte, la API y el cliente, y Chrome en 1440×900 a 2× (escritorio, 2880×1800) y 390×823 a 3× (celular), una vez con el esquema claro y otra con el oscuro. Para actualizarlas, repetir ese proceso y reemplazar los archivos.

## Fotos

Las tres fotos son de [Pexels](https://www.pexels.com/license/) (uso libre, incluso comercial; no exige atribución, se acredita igual). Son imágenes de referencia, no de Argentina: conviene reemplazarlas por fotos propias cuando las haya.

| Archivo | Foto | Autor |
| --- | --- | --- |
| `assets/foto-productor.webp` | [Man wearing hat holding black smartphone](https://www.pexels.com/photo/man-wearing-hat-holding-black-smartphone-4894561/) | Gustavo Fring |
| `assets/foto-camion.webp` | [Harvesting process with grain cart and truck in field](https://www.pexels.com/photo/harvesting-process-with-grain-cart-and-truck-in-field-28757609/) | Kurt Hudspeth |
| `assets/foto-atardecer.webp` | [Combine harvester and tractor with trailer on field at sunset](https://www.pexels.com/photo/combine-harvester-and-tractor-with-trailer-on-field-at-sunset-9940120/) | Tom Fisk |

`assets/campo-800.jpg` y `campo-1600.jpg` (cosechadora en el lote) vienen del diseño original.

## Formulario

Por defecto solo valida y muestra la confirmación. Para recibir los datos, poner la URL de un servicio (Formspree, Getform, un webhook propio) en `data-endpoint` del `<form>`: se envía un POST con JSON.

## Publicación

Cualquier hosting estático sirve (GitHub Pages, Netlify, Cloudflare Pages, Vercel).
