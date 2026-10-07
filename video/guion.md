# Guion · Plataforma 4D (BIM + IA)

Video de 2:04 min para el portafolio en línea (sección **Plataforma 4D**, `#video`). Dirigido a reclutadores y comprensible para arquitectos e ingenieros. No menciona clientes ni constructoras.

## Cómo grabar la narración

- Lee la columna **Narración** con calma (≈ 2.5 palabras por segundo). Cada renglón empieza en el tiempo indicado; si te sobra tiempo, deja silencio: la música lo cubre.
- Graba en un lugar sin eco, a 30 cm del micrófono, en WAV o M4A. Puedes grabar todo seguido y ajustar después.
- Mezcla la voz con la música (`musica-ambiente.m4a`) un poco más baja:

```
ffmpeg -i plataforma-4d-bim.mp4 -i voz.wav -i musica-ambiente.m4a \
  -filter_complex "[2:a]volume=0.35[m];[1:a][m]amix=inputs=2:duration=first:normalize=0[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 160k -movflags +faststart plataforma-4d-bim-voz.mp4
```

- La narración coincide con los subtítulos (`plataforma-4d-bim.vtt`). Si cambias el texto, actualiza también el `.vtt`.

## Guion cronometrado

| Tiempo | En pantalla | Narración |
|---|---|---|
| 0:00–0:06 | Del modelo de Revit a una plataforma 4D interactiva · Dominic Soto Aguilar | Así convertí un modelo de Revit en una plataforma 4D interactiva. |
| 0:05–0:13 | 01 · Punto de partida — Todo parte del modelo de Revit | Todo parte del modelo federado de Revit: arquitectura, estructura y seis modelos de instalaciones. |
| 0:13–0:22 | 01 · Punto de partida — Cada disciplina, consultable por separado | En la plataforma, cada disciplina se revisa por separado: el modelo completo, la estructura o las instalaciones. |
| 0:21–0:34 | 02 · Desarrollo — Del modelo a la plataforma, con automatización e IA | La desarrollé con agentes de inteligencia artificial, que me ayudaron a programar la automatización en C#, PowerShell y JavaScript. Los scripts leen el modelo, cuantifican cada elemento y enlazan el programa de obra con una página web 3D. |
| 0:34–0:57 | 03 · Planeación 4D — El programa de obra construye el modelo, día por día | En la planeación 4D, el programa de obra construye el modelo día por día. 64 actividades y 5 hitos: se ve qué se demuele, qué se construye y cómo avanza cada frente. Las oficinas existentes siguen operando mientras avanza la ampliación. |
| 0:57–1:15 | 04 · Instalaciones — Elige y filtra: 16 sistemas, solos o combinados, por nivel | Las instalaciones se eligen desde el panel de sistemas: agua fría, drenaje sanitario, aire acondicionado o eléctrica. Se pueden combinar varios sistemas y filtrar por nivel, con cortes que dejan ver cada red. |
| 1:14–1:24 | 05 · Propiedades — Propiedades de Revit de cada elemento, con un clic | Con la herramienta de propiedades, un clic muestra los datos de Revit de cada elemento: sistema, tipo, medida, nivel y longitud. |
| 1:23–1:35 | 06 · Cuantificación — Las cantidades siguen el filtro y se exportan a Excel | Las cantidades siguen el mismo filtro: por sistema, por nivel y por zona. Y se exportan a Excel con un clic. |
| 1:35–1:40 | 06 · Cuantificación — Tabla de cantidades lista para el presupuesto | La tabla queda lista para armar el presupuesto mucho más rápido. |
| 1:40–1:46 | 07 · Resultado — Antes y después, sobre el mismo modelo | Y el antes y el después se comparan sobre el mismo modelo. |
| 1:46–1:56 | 08 · Beneficios — Comunicación clara · Presupuesto más rápido · Decisiones con fecha · Un solo modelo | El resultado: comunicación clara con el cliente y la obra, presupuestos más rápidos, decisiones con fecha y un solo modelo como fuente de información. |
| 1:55–2:04 | Programable · Personalizable · Ampliable — Dominic Soto Aguilar · dominicsoto.arq@gmail.com | Una plataforma programable, personalizable y ampliable con automatización, inteligencia artificial y programación. Soy Dominic Soto Aguilar, arquitecto especializado en modelado y coordinación BIM. |

## Mensajes clave

- El desarrollo **parte de un modelo de Revit** (federado: arquitectura, estructura y 6 modelos de instalaciones).
- La plataforma se desarrolló con **agentes de IA, automatización (C#, PowerShell) y programación web (JavaScript, Three.js)**.
- Integra **planeación 4D** (64 actividades, 5 hitos), **instalaciones** que se eligen y filtran por sistema y nivel, **propiedades de Revit** de cada elemento y **cuantificaciones** (8,019 elementos) que se exportan a Excel y agilizan el presupuesto.
- Es **programable, personalizable y ampliable** a otros proyectos.

## Música

Pista ambiente original, compuesta y sintetizada por código para este video (sin muestras ni obras de terceros). Se incluye sola en `musica-ambiente.m4a` para remezclarla con la voz.
