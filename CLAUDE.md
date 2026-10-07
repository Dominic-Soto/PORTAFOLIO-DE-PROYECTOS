# CLAUDE.md

Guía para trabajar en este repositorio. Edítala cuando cambien las reglas o la estructura.

## Qué es

Sitio estático (GitHub Pages) con los portafolios de **Dominic Soto Aguilar** — Arquitecto · Modelado y coordinación BIM.
Tres portafolios que se hojean como libro (con animación de página) o se recorren en galería vertical.

- Sitio: https://dominic-soto.github.io/PORTAFOLIO-DE-PROYECTOS/
- Enlaces directos: `#industrial`, `#arquitectura`, `#tecnico`, y a una página: `#tecnico-12`

## Estructura

```
index.html          # TODO el sitio: HTML + CSS + JS en un solo archivo, sin build
pages/<libro>/pNN.webp   # láminas a tamaño completo, 2560×1440 (16:9)
thumbs/<libro>/pNN.webp  # miniaturas, 384×216
og.jpg              # imagen para redes (Open Graph), 1200×630
.nojekyll           # evita que GitHub Pages procese el sitio con Jekyll
README.md
```

Libros (`<libro>`): `industrial` (36 págs.), `arquitectura` (35), `tecnico` (37).
Los archivos van numerados con dos dígitos: `p01.webp`, `p02.webp`, …

## Cómo funciona `index.html`

- **Datos**: el objeto `BOOKS` define cada libro: número, título, total de páginas y `sections` (`[nombre, página de inicio]`).
  Es la única fuente de verdad para el selector de secciones, las etiquetas de página y la lista de proyectos de la portada.
- `PROJECT_SKIP`: secciones que *no* son proyectos (Portada, Perfil, Contacto, …); se excluyen de la lista de la tarjeta.
- **Portada** (`#home`): repisa con los tres libros (`buildShelf`) y datos de contacto.
- **Visor** (`#viewer`): modo `libro` (animación 3D con `turn()`) o `galeria`; cajón de miniaturas; zoom (`#zoom`); pantalla completa.
- **Estado**: `S` (libro, página, modo). La última página y el modo se recuerdan en `localStorage` (envuelto en `try/catch` vía `store`).
- **Rutas**: `route()` lee el hash de la URL.
- **Tema**: colores como variables CSS en `:root`, con modo oscuro por `prefers-color-scheme` y `data-theme`. Color de acento por libro: `--ind`, `--arq`, `--tec`.
- Teclado: ← → / PageUp PageDown para hojear, Home/End, `Z` zoom, Esc cierra.

## Tareas comunes

**Reemplazar o añadir láminas de un libro**
1. Exportar a 2560×1440 WebP en `pages/<libro>/pNN.webp`.
2. Generar la miniatura 384×216 en `thumbs/<libro>/pNN.webp`, p. ej.:
   `convert pages/<libro>/p05.webp -resize 384x216 -quality 80 thumbs/<libro>/p05.webp`
3. Si cambia el número de páginas o dónde empieza cada proyecto, actualizar `pages` y `sections` en `BOOKS`.
4. Si se añade un tipo de sección que no es proyecto, agregarlo a `PROJECT_SKIP`.

**Añadir un libro nuevo**: nueva entrada en `BOOKS` (con id en minúsculas, sin guiones porque `-` separa la página en el hash), carpetas en `pages/` y `thumbs/`, un color de acento (`--xxx` en claro y oscuro + regla `[data-book="..."]`), y el enlace en `README.md`.

**Cambiar textos/contacto**: están en el HTML de `#home` y en las metaetiquetas (`description`, `og:*`, `twitter:*`) del `<head>` — mantenerlas sincronizadas.

## Probar localmente

No hay dependencias ni build. Servir la carpeta y abrir el navegador:

```
python3 -m http.server 8000   # http://localhost:8000/
```

Revisar: portada, abrir cada libro, hojear en modo libro y galería, miniaturas, zoom, enlaces `#libro-N`, ancho de móvil (~375px) y modo oscuro.
Chromium/Playwright está disponible en el entorno remoto para capturas.

## Convenciones

- Todo el contenido visible y los comentarios están en **español** (es-MX).
- Mantener un solo `index.html` sin frameworks ni dependencias externas (la única externa es la fuente Montserrat de Google Fonts).
- Estilo de código: JS compacto, funciones cortas, ids accedidos con `$("id")`; CSS con variables en `:root`. Seguir el estilo existente.
- Imágenes siempre en WebP; no subir PDFs ni originales pesados (las láminas ya suman ~17 MB).
- Rutas relativas (el sitio vive bajo `/PORTAFOLIO-DE-PROYECTOS/`); las URLs absolutas solo en `canonical` y metaetiquetas `og:`/`twitter:`.
- Publicación: GitHub Pages sirve la rama por defecto; trabajar en ramas y fusionar por PR.

## Notas / pendientes

- La tarjeta de cada libro dice "1920 × 1080", pero las láminas son de 2560×1440.
