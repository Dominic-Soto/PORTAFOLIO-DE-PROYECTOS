# Tablero de seguimiento de obra en Power BI

**Dominic Soto Aguilar** · Arquitecto · Modelado y coordinación BIM

Tablero para dar seguimiento a dos proyectos que comparten los mismos modelos de Revit: la **ampliación de una nave industrial** y la **expansión de sus oficinas**. Junta en un solo lugar lo que normalmente vive en archivos separados: los modelos, los catálogos de licitación y el programa de obra. Así se puede revisar el modelo contra el catálogo y detectar pendientes antes de licitar o construir.

## Qué hace

- **Lee los 19 modelos de Revit en automático**: arquitectura, estructura, instalaciones, terracerías y existente. Se abren en segundo plano y en solo lectura, sin capturar nada a mano.
- **Junta los modelos con los catálogos de licitación** y toma como vigente la revisión más reciente de cada paquete. Además, compara cada revisión contra la anterior, concepto por concepto.
- **Compara el modelo contra el catálogo**: la cantidad medida en Revit contra la del catálogo, por paquete, con su nivel de coincidencia (±5 %, 5–15 %, > 15 % o sin contraparte).
- **Registra hallazgos** por severidad, tipo y disciplina, cada uno con su evidencia, fuente y recomendación. Por ejemplo: conceptos duplicados, claves repetidas, cantidades que no cuadran o riesgos de coordinación.
- **Controla los entregables de Revit**: lleva el estado de cada modelo y de sus planos con y sin revisión. También revisa que todos los modelos tengan el mismo origen y los mismos niveles que el arquitectónico.
- **Sigue el programa 4D** de la expansión de oficinas con su curva S, sus hitos, sus actividades y los metros de instalación programados.

## De dónde salen los datos

| Fuente | Qué aporta |
|---|---|
| **Revit** (19 modelos) | Unos 113 mil elementos, cada uno con categoría, nivel, zona, proyecto y cantidad (longitud, área o volumen). También 354 planos con su revisión, niveles, ejes, vínculos, advertencias y coordenadas. Se extrae con **pyRevit**, en segundo plano. |
| **Excel** | Catálogos de conceptos de cada paquete de licitación, con todas sus revisiones. Python los lee directo del archivo .xlsx, sin abrir Excel ni modificar los originales. |
| **Programa de obra** | Actividades, fases, hitos y metros de instalación para el 4D. |
| **Revit (exportación)** | Vistas 3D del modelo coordinado, coloreadas por proyecto, y miniaturas de los planos para la galería. |

Todo se normaliza con **Python** en tablas (elementos, planos, catálogos, revisiones, hallazgos y 4D), que Power BI lee y relaciona.

## Páginas del tablero (13)

1. **Inicio**: portada con los dos proyectos, sus indicadores clave y accesos a cada página.
2. **Resumen ejecutivo**: importes por paquete, hallazgos por severidad y por proyecto, hitos y planos con y sin revisión.
3. **Catálogos de licitación**: cada paquete con su revisión vigente y sus conceptos.
4. **Cambios entre revisiones**: qué cambió contra la revisión anterior y en cuánto.
5. **Hallazgos y pendientes**: matriz de tipo por severidad, barras por disciplina y registro completo.
6. **Fichas de hallazgos** (se abre desde Hallazgos): una tarjeta por hallazgo, con su detalle, evidencia y recomendación, y los conceptos pendientes de catálogo.
7. **Modelos de Revit**: elementos, planos, advertencias y vínculos sin cargar de cada modelo, con las advertencias más frecuentes.
8. **Control de planos**: galería de miniaturas y listado de los planos por modelo, con y sin revisión.
9. **Modelo 3D**: vistas isométricas del modelo coordinado, coloreadas por proyecto.
10. **Claves por elemento**: cada elemento ligado a su clave del catálogo.
11. **Modelo contra catálogo**: coincidencia por paquete y conceptos con mayor diferencia.
12. **Programa 4D**: curva S de avance programado contra real, metros de instalación, actividades e hitos.
13. **Control de Revit**: purga, parámetros, coordenadas, niveles y planos exportados de cada modelo.

**Visuales que usa:** tarjetas de indicadores, matrices con formato condicional, barras apiladas, gráficas de dona, curva S, área acumulada, tablas con barras de datos, galería de imágenes y fichas tipo tarjeta. Cada página tiene filtros por proyecto y disciplina, o los que le correspondan, y una nota de «cómo leer esta página».

## Herramientas

- **Power BI Desktop**: proyecto en formato PBIP (modelo semántico en TMDL e informe en PBIR) con medidas DAX.
- **Revit + pyRevit**: extracción automática de elementos, planos, coordenadas y vistas.
- **Python**: lectura y normalización de los catálogos de Excel, cruce del modelo con el catálogo y detección de hallazgos.
- **Excel**: catálogos de licitación (fuente de los conceptos, cantidades y precios).
- **Node.js**: validación del informe antes de abrirlo.
- **Agentes de IA (Claude Code)**: desarrollo y automatización de los scripts, el modelo de datos y el video.

## Video

- **Archivo:** `video.mp4`, de **1:20 min** (80 s), en 1920×1080 a 30 fps, H.264 + AAC y menos de 25 MB.
- **Sin narración.** Solo tiene **música ambiental original**, compuesta por código y sin derechos de terceros, y textos en pantalla.
- **Contenido:** explica cómo funciona (de los modelos de Revit a la base de datos, al cruce y al tablero) y recorre las 13 páginas del tablero.
- **Datos ocultos:** los importes, nombres y logotipos que no deben publicarse están difuminados o tapados, en el video y en las capturas.

## Capturas (`capturas/`)

| Archivo | Página |
|---|---|
| `p01.webp` | Inicio |
| `p06.webp` | Fichas de hallazgos |
| `p07.webp` | Modelos de Revit |
| `p09.webp` | Modelo 3D |
| `p11.webp` | Modelo contra catálogo |
| `p12.webp` | Programa 4D |
| `p13.webp` | Control de Revit |

## 3 beneficios clave

1. **Sin captura manual:** los datos salen directo de los modelos y de los catálogos. Al cambiar el modelo, el tablero se actualiza con un clic.
2. **Errores detectados antes de licitar o construir:** el cruce del modelo con el catálogo muestra faltantes, duplicados y diferencias de cantidad, cada uno con su recomendación.
3. **Una sola fuente para diseño, obra y cliente:** importes, hallazgos, planos, coordinación de modelos y programa 4D en un mismo tablero, filtrable por proyecto y disciplina.
