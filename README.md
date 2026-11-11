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

Buscar en `index.html` los textos entre corchetes, resaltados en ocre: `[correo]`, `[teléfono / WhatsApp]`, `[completar: IVA y tipo de cambio]`, `[cupo]` y `[Razón social · CUIT]`. También faltan las páginas de Términos y Privacidad (`#terminos`, `#privacidad`) y las capturas/fotos marcadas como espacio reservado.

## Formulario

Por defecto solo valida y muestra la confirmación. Para recibir los datos, poner la URL de un servicio (Formspree, Getform, un webhook propio) en `data-endpoint` del `<form>`: se envía un POST con JSON.

## Publicación

Cualquier hosting estático sirve (GitHub Pages, Netlify, Cloudflare Pages, Vercel).
