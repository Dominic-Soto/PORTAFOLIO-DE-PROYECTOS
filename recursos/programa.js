/*
  PROGRAMA DE OBRA DETALLADO — Expansión de Oficinas AUO, ejes A–E / 1–3
  Versión 01-10-26 · 64 actividades y 5 hitos · PITSA Industriales
  -------------------------------------------------------------------------
  Este archivo controla las fechas y textos de la simulación 4D. Es el mismo
  programa que el Excel y el archivo de MS Project de "programa\salida".

  CÓMO EDITAR LAS FECHAS
  - Cambie "inicio" y "fin" de la tarea (formato AAAA-MM-DD). Use días hábiles:
    lunes a viernes, sin los feriados de la hoja "Calendario" del Excel.
  - Los hitos están en "hitos" (y el hito del cliente se repite en "hito"):
    cambie "fecha" en ambos lugares si mueve M1.
  - Guarde y vuelva a abrir la presentación: la animación se actualiza sola.
  - Para que el Excel y MS Project coincidan, ponga las mismas fechas en
    programa\datos_v0110.ps1 y ejecute programa\gen_xlsx.ps1 y gen_xml.ps1
    (calc.ps1 avisa si alguna fecha no coincide con este archivo).
  - No cambie los "id": el modelo 3D asigna cada elemento a su tarea por id
    (reglas en analisis\mapeo_4d.json).

  CAMPOS DE CADA TAREA
    id        T01…T64, en orden de la EDT
    grupo     uno de "grupos" (define el color de la barra)
    vista     cámara sugerida: general, ala, ampliacion, cimentacion, estructura,
              sanitarios, cubierta, fachada, pb, pa, terraza, final, aerea, actual,
              instalaciones, inst_pb, inst_pa, azotea
    nivel     PB, PA, AZ (azotea) o General
    sistemas  ids de instalaciones que construye la tarea (AF, AC, SAN, VEN, PLU,
              PCI, HVR, HVC, HVD, HVE, ELE, CON, ILU, VYD, SEG)
    edt, fase clave y fase de la estructura de desglose del trabajo
  Las tareas sin geometría (pruebas, recorridos) sólo aparecen en la línea de tiempo.
*/
window.AUO_PROGRAMA = {
  proyecto: 'Expansión de Oficinas AUO',
  cliente: 'AUO Mobility Solutions · AUO PSC México S.A. de C.V.',
  responsable: 'PITSA Industriales S. de R.L. de C.V.',
  ubicacion: 'Circuito Corral de Piedras No. 80, Corral de Piedras Abajo, San Miguel de Allende, Gto.',
  version: 'Programa detallado 01-10-26',
  inicio: '2026-11-01',
  fin: '2027-06-18',

  hito: {
    id: 'M1',
    fecha: '2027-01-29',
    titulo: 'Sanitarios de planta baja terminados',
    detalle: 'El núcleo de sanitarios y vestidores de planta baja (ejes C–E) queda en operación, con sus instalaciones hidráulica, sanitaria y eléctrica probadas, acabados y muebles sanitarios colocados: las oficinas siguen funcionando sin interrupción y continúa el resto de la obra.'
  },

  hitos: [
    { id: 'M2', fecha: '2027-01-22', titulo: 'Estructura y cubierta terminadas', detalle: 'Estructura metálica de los dos niveles, losa de entrepiso y cubierta KR-18 terminadas: la ampliación queda techada antes de terminar los sanitarios de planta baja.', edt: '1.2.3.4' },
    { id: 'M1', fecha: '2027-01-29', titulo: 'Sanitarios de planta baja terminados', detalle: 'El núcleo de sanitarios y vestidores de planta baja (ejes C–E) queda en operación, con sus instalaciones hidráulica, sanitaria y eléctrica probadas, acabados y muebles sanitarios colocados: las oficinas siguen funcionando sin interrupción y continúa el resto de la obra.', edt: '1.3.7' },
    { id: 'M3', fecha: '2027-04-14', titulo: 'Edificio cerrado', detalle: 'Fachadas, cancelería exterior, parasoles e impermeabilización terminados: el interior queda protegido para los acabados.', edt: '1.4.5' },
    { id: 'M4', fecha: '2027-06-09', titulo: 'Instalaciones probadas y en operación', detalle: 'Hidráulica, sanitaria, protección contra incendio, aire acondicionado, eléctrica, voz y datos y seguridad probadas y funcionando.', edt: '1.7.2' },
    { id: 'M5', fecha: '2027-06-18', titulo: 'Entrega de la obra a AUO', detalle: 'Recorrido final, tapial retirado y entrega de la ampliación con planos finales, manuales y garantías.', edt: '1.7.5' }
  ],

  grupos: [
    { nombre: 'Preliminares', color: '#8d99a6' },
    { nombre: 'Demolición', color: '#8c2f39' },
    { nombre: 'Cimentación', color: '#a0703c' },
    { nombre: 'Estructura', color: '#3f5f8a' },
    { nombre: 'Sanitarios PB', color: '#1d9a6c' },
    { nombre: 'Envolvente', color: '#c2549d' },
    { nombre: 'Hidráulica y sanitaria', color: '#2b7bd6' },
    { nombre: 'Protección contra incendio', color: '#d62828' },
    { nombre: 'Aire acondicionado', color: '#7b4fc9' },
    { nombre: 'Eléctrica y especiales', color: '#e0a800' },
    { nombre: 'Interiores', color: '#ef8a23' },
    { nombre: 'Acabados finales', color: '#84a83a' },
    { nombre: 'Pruebas y entrega', color: '#15202b' }
  ],

  tareas: [
    // 1.1 Preliminares y desmantelamiento
    { id: 'T01', nombre: 'Movilización, permisos internos y trazo general', inicio: '2026-11-02', fin: '2026-11-06', grupo: 'Preliminares', vista: 'general', nivel: 'General', sistemas: [], edt: '1.1.1.1', fase: 'Preliminares y desmantelamiento',
      desc: 'Permisos de trabajo con AUO, programa de seguridad, almacén y oficina de obra, trazo y nivelación de los ejes A–E / 1–3 y levantamiento de las instalaciones existentes.' },
    { id: 'T02', nombre: 'Tapial perimetral, barreras de polvo y accesos de obra', inicio: '2026-11-03', fin: '2026-11-11', grupo: 'Preliminares', vista: 'general', nivel: 'General', sistemas: [], edt: '1.1.1.2', fase: 'Preliminares y desmantelamiento',
      desc: 'Tapial perimetral de la zona A–E, barreras de polvo y ruido junto a las oficinas en operación, señalización de seguridad y accesos de obra independientes del personal de AUO.' },
    { id: 'T03', nombre: 'Reubicación provisional de lockers, enfermería y lactario', inicio: '2026-11-02', fin: '2026-11-10', grupo: 'Preliminares', vista: 'ala', nivel: 'PB', sistemas: [], edt: '1.1.1.3', fase: 'Preliminares y desmantelamiento',
      desc: 'Traslado provisional de lockers, enfermería y lactario a áreas habilitadas del edificio existente para liberar el ala de servicios.' },
    { id: 'T04', nombre: 'Desvío y retiro de instalaciones existentes del ala', inicio: '2026-11-09', fin: '2026-11-13', grupo: 'Demolición', vista: 'inst_pb', nivel: 'PB', sistemas: ['PCI', 'ELE'], edt: '1.1.2.1', fase: 'Preliminares y desmantelamiento',
      desc: 'Desvío provisional de alimentaciones eléctricas, hidráulicas y de aire del ala; retiro de la red existente de protección contra incendio de la zona (ramales, bajadas y rociadores) sin dejar sin servicio a las oficinas.' },
    { id: 'T05', nombre: 'Retiro de la carpa de lockers', inicio: '2026-11-11', fin: '2026-11-18', grupo: 'Demolición', vista: 'ala', nivel: 'PB', sistemas: [], edt: '1.1.2.2', fase: 'Preliminares y desmantelamiento',
      desc: 'Desmontaje de la carpa de lockers, retiro del piso provisional y limpieza del área.' },
    { id: 'T06', nombre: 'Desmontaje de velarias, terraza y techumbre ligera', inicio: '2026-11-17', fin: '2026-11-25', grupo: 'Demolición', vista: 'ala', nivel: 'AZ', sistemas: [], edt: '1.1.2.3', fase: 'Preliminares y desmantelamiento',
      desc: 'Retiro de las velarias y de la terraza sobre la azotea del ala de servicios y de su techumbre ligera, con recuperación del material que AUO indique.' },
    { id: 'T07', nombre: 'Demolición de muros y castillos del ala de servicios', inicio: '2026-11-20', fin: '2026-11-30', grupo: 'Demolición', vista: 'ala', nivel: 'PB', sistemas: [], edt: '1.1.2.4', fase: 'Preliminares y desmantelamiento',
      desc: 'Demolición de los muros del ala que no se aprovechan, retiro de 3 castillos del eje 3 (tramo A–B) y acarreo de escombro fuera de la planta.' },

    // 1.2 Obra civil y estructura
    { id: 'T08', nombre: 'Trazo de ejes y excavación para zapatas', inicio: '2026-11-19', fin: '2026-11-30', grupo: 'Cimentación', vista: 'cimentacion', nivel: 'PB', sistemas: [], edt: '1.2.1.1', fase: 'Obra civil y estructura',
      desc: 'Trazo de los ejes de columnas nuevas y excavación para zapatas aisladas, zapata corrida y trabe de liga, cuidando la cimentación existente.' },
    { id: 'T09', nombre: 'Zapatas, dados y trabe de liga', inicio: '2026-11-24', fin: '2026-12-14', grupo: 'Cimentación', vista: 'cimentacion', nivel: 'PB', sistemas: [], edt: '1.2.1.2', fase: 'Obra civil y estructura',
      desc: 'Plantilla, acero de refuerzo, cimbra y colado de zapatas ZA1 a ZA5, zapata corrida ZC1, dados y trabe de liga de 25×40 cm.' },
    { id: 'T10', nombre: 'Anclas y placas base', inicio: '2026-11-26', fin: '2026-12-11', grupo: 'Cimentación', vista: 'cimentacion', nivel: 'PB', sistemas: [], edt: '1.2.1.3', fase: 'Obra civil y estructura',
      desc: 'Plantillas de anclaje, anclas de 5/8" y 3/4", tuercas de nivelación y placas base PB1 a PB4 ahogadas en los dados.' },
    { id: 'T11', nombre: 'Rellenos compactados, ductos bajo piso y firme de PB', inicio: '2026-12-15', fin: '2026-12-28', grupo: 'Cimentación', vista: 'cimentacion', nivel: 'PB', sistemas: ['ELE'], edt: '1.2.1.4', fase: 'Obra civil y estructura',
      desc: 'Rellenos compactados en capas, ductos eléctricos y de voz y datos bajo piso y firme de concreto de 15 cm en planta baja.' },
    { id: 'T12', nombre: 'Montaje de columnas HSS', inicio: '2026-12-08', fin: '2026-12-18', grupo: 'Estructura', vista: 'estructura', nivel: 'PB', sistemas: [], edt: '1.2.2.1', fase: 'Obra civil y estructura',
      desc: 'Montaje, plomeo y nivelación de columnas HSS de 254 y 305 mm (C1 a C4) sobre placas base y relleno con mortero sin contracción.' },
    { id: 'T13', nombre: 'Vigas de entrepiso y conexiones', inicio: '2026-12-15', fin: '2026-12-28', grupo: 'Estructura', vista: 'estructura', nivel: 'PA', sistemas: [], edt: '1.2.2.2', fase: 'Obra civil y estructura',
      desc: 'Montaje de trabes T7 a T12 y vigas V1 a V4 del entrepiso a N.P.T. +4.00 m, con conexiones atornilladas y soldadas.' },
    { id: 'T14', nombre: 'Losacero de entrepiso: lámina, conectores y malla', inicio: '2026-12-22', fin: '2026-12-31', grupo: 'Estructura', vista: 'estructura', nivel: 'PA', sistemas: [], edt: '1.2.2.3', fase: 'Obra civil y estructura',
      desc: 'Colocación de lámina losacero, conectores de cortante soldados, malla electrosoldada y frentes de losa, iniciando sobre el núcleo de sanitarios.' },
    { id: 'T15', nombre: 'Colado de losa de entrepiso N.P.T. +4.00', inicio: '2026-12-29', fin: '2027-01-05', grupo: 'Estructura', vista: 'estructura', nivel: 'PA', sistemas: [], edt: '1.2.2.4', fase: 'Obra civil y estructura',
      desc: 'Colado de la losa de 11.4 cm en dos etapas, primero sobre el núcleo de sanitarios, y curado.' },
    { id: 'T16', nombre: 'Columnas de PA, armaduras de cubierta y escalera', inicio: '2026-12-30', fin: '2027-01-12', grupo: 'Estructura', vista: 'cubierta', nivel: 'PA', sistemas: [], edt: '1.2.3.1', fase: 'Obra civil y estructura',
      desc: 'Columna de planta alta, trabes y armaduras de cubierta T1, T3, T4 y T6 a +8.1 m y escalera metálica entre niveles.' },
    { id: 'T17', nombre: 'Montenes y tensores de cubierta', inicio: '2027-01-07', fin: '2027-01-15', grupo: 'Estructura', vista: 'cubierta', nivel: 'AZ', sistemas: [], edt: '1.2.3.2', fase: 'Obra civil y estructura',
      desc: 'Montenes dobles tipo caja de 10" cal. 14 y tensores de contraventeo de la cubierta.' },
    { id: 'T18', nombre: 'Lámina KR-18 de cubierta y remates', inicio: '2027-01-13', fin: '2027-01-22', grupo: 'Estructura', vista: 'cubierta', nivel: 'AZ', sistemas: [], edt: '1.2.3.3', fase: 'Obra civil y estructura',
      desc: 'Lámina KR-18 a +8.1 m, caballetes, remates y cierres contra el edificio existente: la ampliación queda techada.' },

    // 1.3 Sanitarios de planta baja (hito M1)
    { id: 'T19', nombre: 'Sanitarios PB: muros de block del núcleo', inicio: '2026-12-21', fin: '2026-12-30', grupo: 'Sanitarios PB', vista: 'sanitarios', nivel: 'PB', sistemas: [], edt: '1.3.1', fase: 'Sanitarios de planta baja',
      desc: 'Muros de block hueco de 20×20×40 y castillos del núcleo de sanitarios y vestidores de planta baja, con preparaciones para instalaciones.' },
    { id: 'T20', nombre: 'Sanitarios PB: hidráulica, sanitaria y ventilación', inicio: '2026-12-28', fin: '2027-01-14', grupo: 'Sanitarios PB', vista: 'sanitarios', nivel: 'PB', sistemas: ['AF', 'AC', 'SAN', 'VEN'], edt: '1.3.2', fase: 'Sanitarios de planta baja',
      desc: 'Ramales de agua fría y agua caliente, drenaje sanitario y ventilación en muros y plafón del núcleo de sanitarios, con pruebas de presión y hermeticidad.' },
    { id: 'T21', nombre: 'Sanitarios PB: eléctrica, extracción y rociadores', inicio: '2026-12-31', fin: '2027-01-18', grupo: 'Sanitarios PB', vista: 'sanitarios', nivel: 'PB', sistemas: ['ELE', 'HVD', 'HVE', 'HVR', 'HVC', 'PCI'], edt: '1.3.3', fase: 'Sanitarios de planta baja',
      desc: 'Canalizaciones eléctricas, ductos y extractores de aire de sanitarios y vestidores, y ramales de rociadores en el plafón del núcleo.' },
    { id: 'T22', nombre: 'Sanitarios PB: impermeabilización, loseta y pisos', inicio: '2027-01-11', fin: '2027-01-22', grupo: 'Sanitarios PB', vista: 'sanitarios', nivel: 'PB', sistemas: [], edt: '1.3.4', fase: 'Sanitarios de planta baja',
      desc: 'Aplanados, impermeabilización de piso, loseta porcelánica blanca de 60×60 en muros, piso cerámico gris y zoclos.' },
    { id: 'T23', nombre: 'Sanitarios PB: plafones, luminarias y rejillas', inicio: '2027-01-18', fin: '2027-01-25', grupo: 'Sanitarios PB', vista: 'sanitarios', nivel: 'PB', sistemas: ['ILU', 'CON', 'HVD'], edt: '1.3.5', fase: 'Sanitarios de planta baja',
      desc: 'Plafón de panel de yeso resistente a la humedad con pintura, luminarias, apagadores, contactos y rejillas de extracción.' },
    { id: 'T24', nombre: 'Sanitarios PB: muebles, mamparas y accesorios', inicio: '2027-01-20', fin: '2027-01-29', grupo: 'Sanitarios PB', vista: 'sanitarios', nivel: 'PB', sistemas: [], edt: '1.3.6', fase: 'Sanitarios de planta baja',
      desc: 'WC y mingitorios con fluxómetro, lavabos, mamparas y divisiones de mingitorio, puertas y accesorios; pruebas de funcionamiento y limpieza para su entrega a AUO.' },

    // 1.4 Envolvente
    { id: 'T25', nombre: 'Muros de fachada PB y PA', inicio: '2027-02-02', fin: '2027-03-05', grupo: 'Envolvente', vista: 'fachada', nivel: 'General', sistemas: [], edt: '1.4.1', fase: 'Envolvente',
      desc: 'Muros de block de fachada en ambos niveles, castillos y cerramientos, aplanado y pintura exterior.' },
    { id: 'T26', nombre: 'Pretiles, impermeabilización y terraza', inicio: '2027-02-16', fin: '2027-03-01', grupo: 'Envolvente', vista: 'terraza', nivel: 'PA', sistemas: [], edt: '1.4.2', fase: 'Envolvente',
      desc: 'Pretiles, impermeabilización de la losa de la terraza y de los remates de cubierta, chaflanes y bajadas a canalones.' },
    { id: 'T27', nombre: 'Cancelería exterior, ventanas y puertas de fachada', inicio: '2027-03-08', fin: '2027-04-07', grupo: 'Envolvente', vista: 'fachada', nivel: 'General', sistemas: [], edt: '1.4.3', fase: 'Envolvente',
      desc: 'Ventanas corridas, cancelería de aluminio y cristal, puertas de acceso y de emergencia en fachada.' },
    { id: 'T28', nombre: 'Parasoles de aluminio', inicio: '2027-03-23', fin: '2027-04-14', grupo: 'Envolvente', vista: 'fachada', nivel: 'General', sistemas: [], edt: '1.4.4', fase: 'Envolvente',
      desc: 'Bastidores de HSS y perfiles de parasol de aluminio en fachada, en continuidad con los parasoles existentes.' },

    // 1.5 Instalaciones · hidráulica y sanitaria
    { id: 'T29', nombre: 'Redes enterradas PB: drenajes, pluvial y acometida', inicio: '2026-11-26', fin: '2026-12-14', grupo: 'Hidráulica y sanitaria', vista: 'instalaciones', nivel: 'PB', sistemas: ['SAN', 'VEN', 'PLU', 'AF'], edt: '1.5.1.1', fase: 'Instalaciones',
      desc: 'Red sanitaria enterrada (pasa bajo las zapatas), ventilas, registros, red pluvial enterrada hasta la descarga y acometida de agua fría, con prueba de hermeticidad antes del relleno.' },
    { id: 'T30', nombre: 'Bajantes pluviales, canalones y colectores de azotea', inicio: '2027-01-26', fin: '2027-02-08', grupo: 'Hidráulica y sanitaria', vista: 'instalaciones', nivel: 'General', sistemas: ['PLU'], edt: '1.5.1.2', fase: 'Instalaciones',
      desc: 'Canalones de lámina, colectores en azotea y bajantes de aguas pluviales conectados a la red enterrada.' },
    { id: 'T31', nombre: 'Hidráulica PB: agua fría, agua caliente y calentador', inicio: '2027-02-09', fin: '2027-03-01', grupo: 'Hidráulica y sanitaria', vista: 'inst_pb', nivel: 'PB', sistemas: ['AF', 'AC'], edt: '1.5.1.3', fase: 'Instalaciones',
      desc: 'Alimentación y ramales de agua fría y caliente de planta baja (lavandería, lactario, consultorio), calentador instantáneo, válvulas y prueba de presión.' },
    { id: 'T32', nombre: 'Sanitaria y ventilación de planta alta', inicio: '2027-02-09', fin: '2027-03-05', grupo: 'Hidráulica y sanitaria', vista: 'inst_pa', nivel: 'PA', sistemas: ['SAN', 'VEN'], edt: '1.5.1.4', fase: 'Instalaciones',
      desc: 'Bajadas sanitarias, ramales colgados bajo el entrepiso, coladeras y ventilas hasta la azotea para los servicios de planta alta.' },
    { id: 'T33', nombre: 'Hidráulica PA: agua fría y agua caliente', inicio: '2027-03-02', fin: '2027-03-31', grupo: 'Hidráulica y sanitaria', vista: 'inst_pa', nivel: 'PA', sistemas: ['AF', 'AC'], edt: '1.5.1.5', fase: 'Instalaciones',
      desc: 'Montantes y ramales de agua fría y caliente para los sanitarios y la cocineta de planta alta, válvulas y prueba de presión.' },

    // 1.5 Instalaciones · protección contra incendio
    { id: 'T34', nombre: 'PCI PB: tubería principal, ramales y rociadores', inicio: '2027-01-13', fin: '2027-02-15', grupo: 'Protección contra incendio', vista: 'inst_pb', nivel: 'PB', sistemas: ['PCI'], edt: '1.5.2.1', fase: 'Instalaciones',
      desc: 'Red húmeda de rociadores de planta baja: tubería principal, ramales, bajadas, rociadores y soportería.' },
    { id: 'T35', nombre: 'PCI: conexión a la red existente y prueba de PB', inicio: '2027-02-16', fin: '2027-02-22', grupo: 'Protección contra incendio', vista: 'inst_pb', nivel: 'PB', sistemas: ['PCI'], edt: '1.5.2.2', fase: 'Instalaciones',
      desc: 'Interconexión con la red existente de las oficinas en una maniobra programada con AUO y prueba hidrostática de la red de planta baja.' },
    { id: 'T36', nombre: 'PCI PA: tubería, rociadores y prueba hidrostática', inicio: '2027-03-02', fin: '2027-04-07', grupo: 'Protección contra incendio', vista: 'inst_pa', nivel: 'PA', sistemas: ['PCI'], edt: '1.5.2.3', fase: 'Instalaciones',
      desc: 'Montante, tubería principal, ramales y rociadores de planta alta; prueba hidrostática y puesta en servicio.' },

    // 1.5 Instalaciones · aire acondicionado
    { id: 'T37', nombre: 'HVAC PB: ductos de inyección, extracción y ERV', inicio: '2027-01-20', fin: '2027-02-15', grupo: 'Aire acondicionado', vista: 'inst_pb', nivel: 'PB', sistemas: ['HVD'], edt: '1.5.3.1', fase: 'Instalaciones',
      desc: 'Ductos de lámina galvanizada de inyección, extracción y aire exterior (ERV) de planta baja, con aislamiento y soportería.' },
    { id: 'T38', nombre: 'HVAC PB: tubería de refrigerante VRF y condensados', inicio: '2027-02-02', fin: '2027-02-22', grupo: 'Aire acondicionado', vista: 'inst_pb', nivel: 'PB', sistemas: ['HVR', 'HVC'], edt: '1.5.3.2', fase: 'Instalaciones',
      desc: 'Líneas de gas y líquido de los sistemas VRF-1 y VRF-2, derivaciones y red de condensados de planta baja; prueba de hermeticidad con nitrógeno.' },
    { id: 'T39', nombre: 'HVAC PA: ductos de inyección, extracción y ERV', inicio: '2027-03-02', fin: '2027-03-31', grupo: 'Aire acondicionado', vista: 'inst_pa', nivel: 'PA', sistemas: ['HVD'], edt: '1.5.3.3', fase: 'Instalaciones',
      desc: 'Ductos de inyección, extracción y aire exterior (ERV) de planta alta, con aislamiento y soportería.' },
    { id: 'T40', nombre: 'HVAC PA: tubería de refrigerante VRF y condensados', inicio: '2027-03-08', fin: '2027-04-07', grupo: 'Aire acondicionado', vista: 'inst_pa', nivel: 'PA', sistemas: ['HVR', 'HVC'], edt: '1.5.3.4', fase: 'Instalaciones',
      desc: 'Montantes, troncales y derivaciones de refrigerante VRF y red de condensados de planta alta; prueba de hermeticidad con nitrógeno.' },
    { id: 'T41', nombre: 'HVAC azotea: condensadoras VRF y líneas en azotea', inicio: '2027-03-23', fin: '2027-04-07', grupo: 'Aire acondicionado', vista: 'azotea', nivel: 'AZ', sistemas: ['HVE', 'HVR'], edt: '1.5.3.5', fase: 'Instalaciones',
      desc: 'Bancadas metálicas, izaje de las condensadoras VRF de 10 y 14 TR, líneas de refrigerante en azotea, capuchones y cuellos de cubierta.' },
    { id: 'T42', nombre: 'HVAC: evaporadoras, ERV, difusores y rejillas', inicio: '2027-04-08', fin: '2027-05-07', grupo: 'Aire acondicionado', vista: 'instalaciones', nivel: 'General', sistemas: ['HVE', 'HVD'], edt: '1.5.3.6', fase: 'Instalaciones',
      desc: 'Evaporadoras VRF tipo ducto y cassette, recuperadores de energía (ERV), extractores, conexiones flexibles, difusores y rejillas coordinados con los plafones.' },
    { id: 'T43', nombre: 'HVAC: arranque, pruebas y balanceo', inicio: '2027-05-17', fin: '2027-05-28', grupo: 'Aire acondicionado', vista: 'azotea', nivel: 'General', sistemas: [], edt: '1.5.3.7', fase: 'Instalaciones',
      desc: 'Vacío y carga de refrigerante, arranque de los sistemas VRF con el fabricante, balanceo de aire y reporte de pruebas.' },

    // 1.5 Instalaciones · eléctrica y especiales
    { id: 'T44', nombre: 'Eléctrica PB: canalizaciones y charolas', inicio: '2027-01-06', fin: '2027-02-15', grupo: 'Eléctrica y especiales', vista: 'inst_pb', nivel: 'PB', sistemas: ['ELE'], edt: '1.5.4.1', fase: 'Instalaciones',
      desc: 'Tubería conduit, registros y charolas de planta baja para alumbrado, contactos, voz y datos y seguridad.' },
    { id: 'T45', nombre: 'Eléctrica PA: canalizaciones y charolas', inicio: '2027-02-23', fin: '2027-03-31', grupo: 'Eléctrica y especiales', vista: 'inst_pa', nivel: 'PA', sistemas: ['ELE'], edt: '1.5.4.2', fase: 'Instalaciones',
      desc: 'Tubería conduit, registros y charolas de planta alta y alimentaciones a los equipos de azotea.' },
    { id: 'T46', nombre: 'Tableros, alimentadores y cableado', inicio: '2027-03-16', fin: '2027-04-20', grupo: 'Eléctrica y especiales', vista: 'instalaciones', nivel: 'General', sistemas: ['ELE'], edt: '1.5.4.3', fase: 'Instalaciones',
      desc: 'Tableros TD-PB, TD-PA y TR-PA, UPS, alimentadores desde la instalación eléctrica existente, desconectadores de equipos y cableado de circuitos.' },
    { id: 'T47', nombre: 'Alumbrado: luminarias, apagadores y sensores', inicio: '2027-04-26', fin: '2027-05-21', grupo: 'Eléctrica y especiales', vista: 'instalaciones', nivel: 'General', sistemas: ['ILU'], edt: '1.5.4.4', fase: 'Instalaciones',
      desc: 'Luminarias LED de planta baja y planta alta, apagadores y sensores de ocupación, instalados con los plafones.' },
    { id: 'T48', nombre: 'Contactos y salidas de fuerza', inicio: '2027-05-03', fin: '2027-05-14', grupo: 'Eléctrica y especiales', vista: 'instalaciones', nivel: 'General', sistemas: ['CON'], edt: '1.5.4.5', fase: 'Instalaciones',
      desc: 'Contactos normales y regulados, salidas de fuerza para equipos y placas, después de la primera mano de pintura.' },
    { id: 'T49', nombre: 'Voz y datos: gabinete IDF y cableado estructurado', inicio: '2027-05-10', fin: '2027-05-28', grupo: 'Eléctrica y especiales', vista: 'instalaciones', nivel: 'General', sistemas: ['VYD'], edt: '1.5.4.6', fase: 'Instalaciones',
      desc: 'Gabinete IDF de 42U, cableado estructurado, salidas de voz y datos y certificación de nodos.' },
    { id: 'T50', nombre: 'Seguridad electrónica: CCTV y control de acceso', inicio: '2027-05-17', fin: '2027-05-28', grupo: 'Eléctrica y especiales', vista: 'instalaciones', nivel: 'General', sistemas: ['SEG'], edt: '1.5.4.7', fase: 'Instalaciones',
      desc: 'Cámaras de CCTV, lectoras y cerraduras de control de acceso, cableado e integración con el sistema existente de AUO.' },

    // 1.6 Interiores y acabados
    { id: 'T51', nombre: 'Interiores PB: muros de tablaroca y block', inicio: '2027-02-16', fin: '2027-03-12', grupo: 'Interiores', vista: 'pb', nivel: 'PB', sistemas: [], edt: '1.6.1.1', fase: 'Interiores y acabados',
      desc: 'Muros divisorios de block y tablaroca, lambrines y cajillos de lavandería, lactario, consultorio y circulaciones de planta baja.' },
    { id: 'T52', nombre: 'Interiores PB: plafones', inicio: '2027-03-23', fin: '2027-04-14', grupo: 'Interiores', vista: 'pb', nivel: 'PB', sistemas: [], edt: '1.6.1.2', fase: 'Interiores y acabados',
      desc: 'Plafón reticular de 61×61, plafón liso de panel de yeso y cajillos perimetrales de planta baja.' },
    { id: 'T53', nombre: 'Interiores PB: pisos y zoclos', inicio: '2027-04-08', fin: '2027-04-23', grupo: 'Interiores', vista: 'pb', nivel: 'PB', sistemas: [], edt: '1.6.1.3', fase: 'Interiores y acabados',
      desc: 'Pisos cerámicos y porcelánicos de gran formato, concreto pulido en áreas de servicio y zoclos.' },
    { id: 'T54', nombre: 'Interiores PB: pintura, puertas y canceles', inicio: '2027-04-21', fin: '2027-05-14', grupo: 'Interiores', vista: 'pb', nivel: 'PB', sistemas: [], edt: '1.6.1.4', fase: 'Interiores y acabados',
      desc: 'Pintura en muros y plafones, puertas de madera, metálicas y de cristal, canceles y accesorios de planta baja.' },
    { id: 'T55', nombre: 'Interiores PA: muros de tablaroca', inicio: '2027-03-16', fin: '2027-04-14', grupo: 'Interiores', vista: 'pa', nivel: 'PA', sistemas: [], edt: '1.6.2.1', fase: 'Interiores y acabados',
      desc: 'Muros divisorios de tablaroca y block, lambrines y preparaciones para canceles de oficinas, privados y salas de juntas.' },
    { id: 'T56', nombre: 'Sanitarios PA: muros, recubrimientos y muebles', inicio: '2027-04-01', fin: '2027-05-21', grupo: 'Interiores', vista: 'pa', nivel: 'PA', sistemas: [], edt: '1.6.2.2', fase: 'Interiores y acabados',
      desc: 'Núcleo de sanitarios de planta alta: loseta porcelánica, coladeras, WC, mingitorios, lavabos, mamparas y accesorios.' },
    { id: 'T57', nombre: 'Interiores PA: plafón reticular y cajillos', inicio: '2027-04-15', fin: '2027-05-07', grupo: 'Interiores', vista: 'pa', nivel: 'PA', sistemas: [], edt: '1.6.2.3', fase: 'Interiores y acabados',
      desc: 'Plafón modular reticular de 61×61, plafón liso de panel de yeso y cajillos perimetrales de planta alta.' },
    { id: 'T58', nombre: 'Interiores PA: piso tipo madera y zoclo', inicio: '2027-04-26', fin: '2027-05-14', grupo: 'Interiores', vista: 'pa', nivel: 'PA', sistemas: [], edt: '1.6.2.4', fase: 'Interiores y acabados',
      desc: 'Piso cerámico tipo madera de 19.3×89.3, piso cerámico gris en servicios y zoclo vinílico.' },
    { id: 'T59', nombre: 'Interiores PA: pintura, canceles de cristal y puertas', inicio: '2027-05-03', fin: '2027-05-28', grupo: 'Interiores', vista: 'pa', nivel: 'PA', sistemas: [], edt: '1.6.2.5', fase: 'Interiores y acabados',
      desc: 'Pintura, canceles de cristal templado de privados y salas de juntas, puertas de cristal, madera y metálicas.' },
    { id: 'T60', nombre: 'Terraza: piso exterior, barandal y velaria', inicio: '2027-05-10', fin: '2027-05-28', grupo: 'Acabados finales', vista: 'terraza', nivel: 'PA', sistemas: [], edt: '1.6.3.1', fase: 'Interiores y acabados',
      desc: 'Piso cerámico exterior, barandal de cristal y velaria tensada de la terraza de planta alta.' },
    { id: 'T61', nombre: 'Mobiliario, casilleros, señalización y letrero AUO', inicio: '2027-05-24', fin: '2027-06-04', grupo: 'Acabados finales', vista: 'pa', nivel: 'General', sistemas: [], edt: '1.6.3.2', fase: 'Interiores y acabados',
      desc: 'Estaciones de trabajo, sillas, mesas, casilleros de vestidores, equipos de lavandería, cocineta, señalización y letrero AUO en fachada.' },

    // 1.7 Pruebas, limpieza y entrega
    { id: 'T62', nombre: 'Pruebas integrales y puesta en marcha', inicio: '2027-05-31', fin: '2027-06-09', grupo: 'Pruebas y entrega', vista: 'instalaciones', nivel: 'General', sistemas: [], edt: '1.7.1', fase: 'Pruebas, limpieza y entrega',
      desc: 'Pruebas finales de hidráulica, sanitaria, protección contra incendio, aire acondicionado, eléctrica, voz y datos y seguridad, con protocolos firmados.' },
    { id: 'T63', nombre: 'Limpieza fina, obras exteriores y retiro del tapial', inicio: '2027-06-07', fin: '2027-06-15', grupo: 'Pruebas y entrega', vista: 'final', nivel: 'General', sistemas: [], edt: '1.7.3', fase: 'Pruebas, limpieza y entrega',
      desc: 'Limpieza fina de interiores, guarniciones y jardinería exterior, retiro del tapial y de las protecciones y limpieza del área de obra.' },
    { id: 'T64', nombre: 'Recorrido con AUO, pendientes y entrega documental', inicio: '2027-06-10', fin: '2027-06-18', grupo: 'Pruebas y entrega', vista: 'final', nivel: 'General', sistemas: [], edt: '1.7.4', fase: 'Pruebas, limpieza y entrega',
      desc: 'Recorrido de entrega con AUO, atención de pendientes, planos finales, manuales, garantías y capacitación de operación.' }
  ]
};
