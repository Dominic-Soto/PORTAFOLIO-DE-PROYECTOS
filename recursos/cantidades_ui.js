/*
  CANTIDADES DE INSTALACIONES — panel con totales y filtros de la página interactiva 4D AUO.
  Datos: data/cantidades.js (window.AUO_CANT), generado por nw/Cantidades.exe con las propiedades del DWF.
  Se abre con cualquier elemento que tenga el atributo data-cant (capítulo 3 y panel de sistemas):
    data-cant="1"   todos los sistemas
    data-cant="sys" los sistemas visibles en el visor 3D
  A un costado, «Cómo se divide»: corte esquemático con los límites de cada nivel, planta con las zonas y alcance.
  Script clásico (no módulo) para que funcione también abriendo el HTML desde la carpeta (file://).
*/
(function () {
  'use strict';
  const D = window.AUO_CANT;
  if (!D) return;

  const DAY = 86400000;
  const NIVELES = [['', 'Todos'], ['BP', 'Bajo piso'], ['PB', 'Planta baja'], ['PA', 'Planta alta'], ['AZ', 'Azotea']];
  const ZONAS = [['', 'Todas'], ['A', 'Ampliación (A–E)'], ['O', 'Oficinas existentes (E–N)'], ['X', 'Exterior']];
  const ESTADOS = [['N', 'Obra nueva'], ['E', 'Existente'], ['R', 'Se retira'], ['*', 'Todo']];
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  // orden de los tipos de conexión (los que no estén aquí van al final, en orden alfabético)
  const PZ_ORDEN = ['Codo 11¼°', 'Codo 22½°', 'Codo 30°', 'Codo 45°', 'Codo 60°', 'Codo 90°', 'Codo 90° con ventila trasera', 'Codo',
    'Yee sencilla', 'Yee doble', 'Tee sencilla', 'Tee recta', 'Tee reducida central', 'Tee', 'Cruz', 'Reducción', 'Reducción bushing', 'Tapón'];
  const SIS = D.sistemas.map(s => ({ ...s, color: s.color.startsWith('#') ? s.color : '#' + s.color }));
  const SISM = Object.fromEntries(SIS.map(s => [s.id, s]));
  const CL = Object.fromEntries(D.clases.map((c, i) => [c.id, { ...c, i }]));
  const ROWS = D.f.map(r => ({ sys: r[0], cl: r[1], tipo: D.t[r[2]], med: D.t[r[3]], red: D.t[r[4]], niv: r[5], zona: r[6], est: r[7], tarea: r[8], n: r[9], m: r[10], pz: r.length > 11 ? D.t[r[11]] : '' }));
  const SYS_IDS = new Set(ROWS.map(r => r.sys));
  const pzIdx = (p) => { const i = PZ_ORDEN.indexOf(p); return i < 0 ? 100 : i; };
  const PIEZAS = [...new Set(ROWS.map(r => r.pz).filter(Boolean))].sort((a, b) => pzIdx(a) - pzIdx(b) || a.localeCompare(b, 'es'));
  const CORTE = Object.assign({ BP: 0, PB: 3.89, PA: 7.9, trabes: 3.5 }, D.cortes || {});
  const REFS = D.referencias || [];

  // programa de obra (las mismas fechas que el 4D)
  const PROG = window.AUO_PROGRAMA || { tareas: [] };
  const toT = (s) => new Date(s + 'T12:00:00').getTime();
  const TK = {};
  // cada actividad ocupa sus días completos: de las 00:00 del inicio a las 24:00 del fin; una fecha elegida cuenta hasta el final de ese día
  const finDia = (s) => toT(s) + DAY / 2 - 1000;
  for (const t of PROG.tareas || []) if (t && t.id && t.inicio && t.fin) TK[t.id] = { ...t, t0: toT(t.inicio) - DAY / 2, t1: toT(t.fin) + DAY / 2 };
  const WC = new Set(Object.values(TK).filter(t => /sanitarios pb/i.test(t.grupo || '')).map(t => t.id));
  const HITO = PROG.hito ? finDia(PROG.hito.fecha) : null;
  const T0 = PROG.inicio ? toT(PROG.inicio) - DAY / 2 : Date.now(), T1 = PROG.fin ? finDia(PROG.fin) : Date.now();

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf1 = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nf0 = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });
  const nf2 = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const fmtD = (t) => { const d = new Date(t); return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`; };
  const isoD = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const numMed = (s) => { const m = /(\d+(?:\.\d+)?)/.exec(s || ''); return m ? parseFloat(m[1]) : 1e9; };
  const cota = (z) => (z === 0 ? '±' : (z > 0 ? '+' : '−')) + nf2.format(Math.abs(z));

  // filtros
  const F = { sys: new Set(), cl: '', pz: '', niv: '', zona: '', est: 'N', tarea: '', q: '', fecha: false, t: null };
  const collapsed = new Set();
  let root = null, lastFocus = null, verComo = true;

  // parte instalada a la fecha: sólo obra nueva (lo existente o lo que se retira no se instala en esta obra)
  function frac(r) {
    if (!F.fecha) return 1;
    if (r.est !== 'N') return 0;
    const k = TK[r.tarea]; if (!k) return 1;
    return clamp((F.t - k.t0) / (k.t1 - k.t0), 0, 1);
  }
  // pass(r, 'cl', 'niv'…): aplica todos los filtros salvo los indicados
  function pass(r, ...skip) {
    if (!skip.includes('sys') && F.sys.size && !F.sys.has(r.sys)) return false;
    if (!skip.includes('cl') && F.cl && r.cl !== F.cl) return false;
    if (!skip.includes('pz') && F.pz && r.pz !== F.pz) return false;
    if (!skip.includes('niv') && F.niv && r.niv !== F.niv) return false;
    if (!skip.includes('zona') && F.zona && r.zona !== F.zona) return false;
    if (F.est !== '*' && r.est !== F.est) return false;
    if (F.tarea) { if (F.tarea === '_wc' ? !WC.has(r.tarea) : r.tarea !== F.tarea) return false; }
    if (F.q) {
      const s = `${r.tipo} ${r.med} ${r.red} ${r.pz} ${CL[r.cl].nombre} ${SISM[r.sys] ? SISM[r.sys].nombre : ''} ${r.tarea}`.toLowerCase();
      if (!F.q.toLowerCase().split(/\s+/).filter(Boolean).every(w => s.includes(w))) return false;
    }
    return true;
  }

  // ------------------------------------------------------------------ estilos
  function css() {
    if (document.getElementById('cantCss')) return;
    const st = document.createElement('style'); st.id = 'cantCss';
    st.textContent = `
#cant { position: fixed; inset: 0; z-index: 55; background: rgba(9,16,24,.46); display: none; align-items: center; justify-content: center; padding: 24px; font-family: Inter, system-ui, sans-serif; }
#cant.show { display: flex; }
#cant .box { background: #fff; color: var(--ink, #15202b); width: min(1400px, 100%); height: min(92vh, 1000px); border-radius: 16px; box-shadow: 0 24px 60px rgba(10,20,30,.35); display: flex; flex-direction: column; overflow: hidden; }
#cant .hd { display: flex; align-items: flex-start; gap: 14px; padding: 16px 20px 12px; border-bottom: 1px solid var(--line, rgba(21,32,43,.12)); }
#cant .hd h2 { margin: 0; font-size: 19px; letter-spacing: -.01em; }
#cant .hd p { margin: 3px 0 0; font-size: 12px; color: var(--muted, #5a6774); }
#cant .hd .sp { flex: 1; }
#cant .btn { border: 1px solid var(--line, rgba(21,32,43,.12)); background: #fff; border-radius: 8px; font: 600 12.5px Inter, system-ui, sans-serif; padding: 7px 12px; color: #22303c; cursor: pointer; white-space: nowrap; }
#cant .btn:hover { border-color: var(--auo-2, #2f6fd0); color: var(--auo, #0f3f8d); }
#cant .btn.pri { background: var(--auo, #0f3f8d); border-color: var(--auo, #0f3f8d); color: #fff; }
#cant .btn.pri:hover { background: var(--auo-2, #2f6fd0); color: #fff; }
#cant .btn.on { background: #e8eef9; border-color: var(--auo-2, #2f6fd0); color: var(--auo, #0f3f8d); }
#cant .btn[disabled] { opacity: .45; cursor: default; }
#cant .x { width: 34px; height: 34px; padding: 0; font-size: 16px; }
#cant .flt { padding: 10px 20px 4px; display: flex; flex-direction: column; gap: 8px; border-bottom: 1px solid var(--line, rgba(21,32,43,.12)); background: #f7f8fa; }
#cant .frow { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; }
#cant .fl { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--muted, #5a6774); }
#cant select, #cant input[type=search], #cant input[type=date] { font: 500 12.5px Inter, system-ui, sans-serif; border: 1px solid var(--line, rgba(21,32,43,.12)); border-radius: 8px; padding: 6px 8px; background: #fff; color: #22303c; max-width: 100%; text-transform: none; letter-spacing: 0; }
#cant input[type=search] { width: 220px; }
#cant .seg { display: inline-flex; border: 1px solid var(--line, rgba(21,32,43,.12)); border-radius: 8px; overflow: hidden; background: #fff; flex-wrap: wrap; }
#cant .seg button { border: 0; background: transparent; font: 600 12px Inter, system-ui, sans-serif; padding: 6px 10px; color: #2a3642; cursor: pointer; text-transform: none; letter-spacing: 0; }
#cant .seg button + button { border-left: 1px solid var(--line, rgba(21,32,43,.12)); }
#cant .seg button.on { background: var(--auo, #0f3f8d); color: #fff; }
#cant .chips { display: flex; flex-wrap: wrap; gap: 5px; }
#cant .chip { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--line, rgba(21,32,43,.12)); background: #fff; border-radius: 999px; padding: 4px 10px 4px 7px; font: 600 11.5px Inter, system-ui, sans-serif; color: #2a3642; cursor: pointer; }
#cant .chip i { width: 11px; height: 11px; border-radius: 3px; flex: none; }
#cant .chip.on { background: #e8eef9; border-color: var(--auo-2, #2f6fd0); color: var(--auo, #0f3f8d); }
#cant .chip.all.on { background: var(--auo, #0f3f8d); color: #fff; border-color: var(--auo, #0f3f8d); }
#cant .bd2 { flex: 1; display: flex; min-height: 0; }
#cant .main { flex: 1; min-width: 0; overflow: auto; padding: 14px 20px 18px; }
#cant .como { width: 330px; flex: none; overflow: auto; border-left: 1px solid var(--line, rgba(21,32,43,.12)); background: #fafbfc; padding: 12px 14px 18px; }
#cant .como.oculto { display: none; }
#cant .como h3 { margin: 0 0 2px; font-size: 14px; }
#cant .como h4 { margin: 14px 0 4px; font-size: 10.5px; letter-spacing: .07em; text-transform: uppercase; color: var(--muted, #5a6774); }
#cant .como p, #cant .como li { font-size: 11.5px; line-height: 1.45; color: #34414d; margin: 0 0 5px; }
#cant .como ul { margin: 4px 0 0; padding-left: 16px; }
#cant .como .sub { font-size: 11px; color: var(--muted, #5a6774); margin-bottom: 6px; }
#cant .como svg { display: block; width: 100%; height: auto; }
#cant .como svg [data-niv], #cant .como svg [data-zona] { cursor: pointer; }
#cant .como .lim { display: grid; grid-template-columns: 22px 1fr; gap: 2px 6px; margin: 6px 0 0; }
#cant .como .lim b.n { display: inline-grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #d64541; color: #d64541; font-size: 10.5px; margin-top: 1px; }
#cant .como .lim div { font-size: 11.5px; line-height: 1.42; color: #34414d; margin-bottom: 4px; }
#cant .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 6px; margin-bottom: 12px; }
#cant .card { border: 1px solid var(--line, rgba(21,32,43,.12)); border-radius: 9px; padding: 6px 10px; cursor: pointer; background: #fff; text-align: left; font-family: inherit; }
#cant .card:hover { border-color: var(--auo-2, #2f6fd0); }
#cant .card.on { border-color: var(--auo, #0f3f8d); box-shadow: inset 0 0 0 1px var(--auo, #0f3f8d); background: #f2f6fd; }
#cant .card .v { font-size: 15.5px; font-weight: 800; letter-spacing: -.01em; color: #15202b; }
#cant .card .v small { font-size: 11.5px; font-weight: 600; color: var(--muted, #5a6774); margin-left: 3px; }
#cant .card .l { font-size: 11px; color: var(--muted, #5a6774); margin-top: 0; line-height: 1.25; }
#cant .card .p { font-size: 11px; color: var(--ok, #1d9a6c); font-weight: 700; margin-top: 2px; }
#cant .tools { display: flex; gap: 8px; align-items: center; margin: 2px 0 8px; flex-wrap: wrap; }
#cant .tools .info { font-size: 12px; color: var(--muted, #5a6774); flex: 1; min-width: 200px; }
#cant .tw { overflow-x: auto; }
#cant table { width: 100%; border-collapse: collapse; font-size: 12.5px; min-width: 640px; }
#cant th { position: sticky; top: -14px; background: #fff; z-index: 1; text-align: left; font-size: 10.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted, #5a6774); padding: 7px 8px; border-bottom: 2px solid #dfe3e8; }
#cant td { padding: 5px 8px; border-bottom: 1px solid #eef0f3; vertical-align: top; }
#cant td.n, #cant th.n { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
#cant tr.sys td { background: #f3f5f8; font-weight: 700; font-size: 13px; border-bottom: 1px solid #dfe3e8; cursor: pointer; padding: 8px; }
#cant tr.sys td i.sw { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 8px; vertical-align: -1px; }
#cant tr.sys td .car { display: inline-block; width: 14px; color: var(--muted, #5a6774); transition: transform .15s; }
#cant tr.sys.col td .car { transform: rotate(-90deg); }
#cant tr.cl td { font-weight: 700; color: #3a4754; padding-top: 9px; font-size: 12px; }
#cant tr.cl td .u { font-weight: 500; color: var(--soft, #8994a0); margin-left: 6px; }
#cant tr.pzs td { padding: 2px 8px 7px 22px; border-bottom: 1px solid #eef0f3; }
#cant .pzc { display: inline-flex; gap: 5px; align-items: baseline; border: 1px solid #dfe5ee; background: #f6f8fc; border-radius: 6px; padding: 2px 8px; margin: 2px 4px 2px 0; font-size: 11.5px; color: #2a3642; cursor: pointer; }
#cant .pzc b { font-variant-numeric: tabular-nums; color: var(--auo, #0f3f8d); }
#cant .pzc.on { background: var(--auo, #0f3f8d); color: #fff; border-color: var(--auo, #0f3f8d); }
#cant .pzc.on b { color: #fff; }
#cant tr.st td { font-weight: 700; color: #22303c; border-bottom: 1px solid #dfe3e8; }
#cant tr.it td:first-child { padding-left: 22px; }
#cant td .red { color: var(--muted, #5a6774); }
#cant .bar { display: inline-block; width: 46px; height: 6px; background: #e6e9ed; border-radius: 3px; overflow: hidden; vertical-align: middle; margin-right: 6px; }
#cant .bar i { display: block; height: 100%; background: var(--ok, #1d9a6c); }
#cant .empty { padding: 40px; text-align: center; color: var(--muted, #5a6774); }
#cant .nota { font-size: 11.5px; color: var(--muted, #5a6774); line-height: 1.5; margin-top: 14px; }
@media (max-width: 1100px) {
  #cant .bd2 { flex-direction: column; overflow: auto; }
  #cant .main { overflow: visible; }
  #cant .como { width: auto; border-left: 0; border-bottom: 1px solid var(--line, rgba(21,32,43,.12)); order: -1; overflow: visible; }
  #cant .como svg.corte { max-width: 340px; }
  #cant th { top: 0; }
}
@media (max-width: 820px) {
  #cant { padding: 0; }
  #cant .box { height: 100%; border-radius: 0; }
  #cant .hd { padding: 12px 16px 10px; flex-wrap: wrap; }
  #cant .flt { padding: 8px 16px 4px; max-height: 40vh; overflow: auto; }
  #cant .main { padding: 12px 16px; }
  #cant input[type=search] { width: 100%; }
}`;
    document.head.appendChild(st);
  }

  // ------------------------------------------------------------------ estructura
  function build() {
    css();
    root = document.createElement('div');
    root.id = 'cant'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Cantidades de instalaciones');
    const tareas = [...new Set(ROWS.filter(r => r.est === 'N' && r.tarea).map(r => r.tarea))].filter(id => TK[id]).sort((a, b) => TK[a].t0 - TK[b].t0 || a.localeCompare(b, 'es', { numeric: true }));
    const grupos = []; for (const s of SIS) if (SYS_IDS.has(s.id)) { let g = grupos.find(x => x.g === s.grupo); if (!g) grupos.push(g = { g: s.grupo, list: [] }); g.list.push(s); }
    root.innerHTML = `
      <div class="box">
        <div class="hd">
          <div><h2>Cantidades de instalaciones</h2><p>Cuantificación del modelo coordinado «${esc(D.fuente)}» · ${nf0.format(D.elementos)} elementos de instalaciones</p></div>
          <div class="sp"></div>
          <button class="btn" data-a="como" title="Mostrar u ocultar cómo se dividen niveles, zonas y alcance">Cómo se divide</button>
          <button class="btn" data-a="ver3d" title="Mostrar en el visor 3D sólo los sistemas seleccionados">Ver en 3D</button>
          <button class="btn pri" data-a="csv" title="Descargar la tabla filtrada (se abre en Excel)">Exportar a Excel</button>
          <button class="btn x" data-a="cerrar" aria-label="Cerrar">✕</button>
        </div>
        <div class="flt">
          <div class="frow"><span class="fl">Sistema</span><div class="chips" id="cSys">
            <button class="chip all" data-sys="">Todos</button>
            ${grupos.map(g => g.list.map(s => `<button class="chip" data-sys="${esc(s.id)}" title="${esc(s.grupo)}"><i style="background:${s.color}"></i>${esc(s.nombre.replace(/^HVAC · /, 'HVAC: ').replace(/^Eléctrica · canalizaciones, charolas y tableros$/, 'Eléctrica: canalizaciones y tableros').replace(/ \(CCTV y control de acceso\)/, ''))}</button>`).join('')).join('')}
          </div></div>
          <div class="frow">
            <label class="fl">Clase <select id="cCl"><option value="">Todas</option>${D.clases.filter(c => ROWS.some(r => r.cl === c.id)).map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('')}</select></label>
            ${PIEZAS.length ? `<label class="fl">Conexión <select id="cPz" title="Tipo de conexión: codo 45°, codo 90°, yee, tee…"><option value="">Todas</option>${PIEZAS.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('')}</select></label>` : ''}
            <span class="fl">Nivel <span class="seg" id="cNiv">${NIVELES.map(([v, l]) => `<button data-v="${v}">${l}</button>`).join('')}</span></span>
            <span class="fl">Zona <span class="seg" id="cZona">${ZONAS.map(([v, l]) => `<button data-v="${v}">${l}</button>`).join('')}</span></span>
          </div>
          <div class="frow">
            <span class="fl">Estado <span class="seg" id="cEst">${ESTADOS.map(([v, l]) => `<button data-v="${v}">${l}</button>`).join('')}</span></span>
            <label class="fl">Actividad <select id="cTarea" style="max-width:340px"><option value="">Todas</option>${WC.size ? `<option value="_wc">Etapa sanitarios PB (meta ${PROG.hito ? fmtD(toT(PROG.hito.fecha)) : 'enero'})</option>` : ''}${tareas.map(id => `<option value="${id}">${id} · ${esc(TK[id].nombre)}</option>`).join('')}</select></label>
            <label class="fl">Buscar <input type="search" id="cQ" placeholder="tipo, diámetro, red…"></label>
          </div>
          <div class="frow">
            <span class="fl">Cantidad <span class="seg" id="cModo"><button data-v="0">Alcance total</button><button data-v="1">Instalado a la fecha</button></span></span>
            <span class="fl" id="cFechaBox">Fecha <input type="date" id="cFecha" min="${isoD(T0)}" max="${isoD(T1)}">
              <button class="btn" data-a="f4d" title="Usar la fecha de la línea de tiempo del 4D">Fecha del 4D</button>
              ${HITO ? `<button class="btn" data-a="fhito" title="Meta de sanitarios de planta baja">Meta sanitarios PB</button>` : ''}</span>
          </div>
        </div>
        <div class="bd2">
          <div class="main" id="cBd"></div>
          <aside class="como" id="cComo" aria-label="Cómo se divide la cuantificación"></aside>
        </div>
      </div>`;
    document.body.appendChild(root);
    verComo = innerWidth > 1100;

    root.addEventListener('click', (e) => { if (e.target === root) close(); });
    root.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
    root.querySelector('#cSys').addEventListener('click', (e) => {
      const b = e.target.closest('[data-sys]'); if (!b) return;
      const id = b.dataset.sys;
      if (!id) F.sys.clear(); else if (F.sys.has(id)) F.sys.delete(id); else F.sys.add(id);
      render();
    });
    const seg = (sel, key, conv = (v) => v) => root.querySelector(sel).addEventListener('click', (e) => { const b = e.target.closest('button[data-v]'); if (!b) return; F[key] = conv(b.dataset.v); render(); });
    seg('#cNiv', 'niv'); seg('#cZona', 'zona'); seg('#cEst', 'est');
    seg('#cModo', 'fecha', (v) => v === '1');
    root.querySelector('#cCl').addEventListener('change', (e) => { F.cl = e.target.value; render(); });
    const sPz = root.querySelector('#cPz'); if (sPz) sPz.addEventListener('change', (e) => { setPz(e.target.value); render(); });
    root.querySelector('#cTarea').addEventListener('change', (e) => { F.tarea = e.target.value; render(); });
    root.querySelector('#cQ').addEventListener('input', (e) => { F.q = e.target.value.trim(); render(); });
    root.querySelector('#cFecha').addEventListener('change', (e) => { if (e.target.value) { F.t = clamp(finDia(e.target.value), T0, T1); F.fecha = true; render(); } });
    root.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      const act = a.dataset.a;
      if (act === 'cerrar') close();
      else if (act === 'csv') exportCsv();
      else if (act === 'ver3d') ver3d();
      else if (act === 'como') { verComo = !verComo; render(); }
      else if (act === 'f4d') { F.t = fecha4D(); F.fecha = true; render(); }
      else if (act === 'fhito') { F.t = HITO; F.fecha = true; render(); }
      else if (act === 'expand') { collapsed.clear(); render(); }
      else if (act === 'collapse') { for (const s of SIS) collapsed.add(s.id); render(); }
      else if (act === 'limpiar') { F.sys.clear(); F.cl = ''; F.pz = ''; F.niv = ''; F.zona = ''; F.est = 'N'; F.tarea = ''; F.q = ''; root.querySelector('#cQ').value = ''; render(); }
    });
    root.querySelector('#cBd').addEventListener('click', (e) => {
      const c = e.target.closest('[data-card]'); if (c) { F.cl = F.cl === c.dataset.card ? '' : c.dataset.card; render(); return; }
      const p = e.target.closest('[data-pz]'); if (p) { setPz(F.pz === p.dataset.pz ? '' : p.dataset.pz); render(); return; }
      const h = e.target.closest('tr.sys[data-s]'); if (h) { const id = h.dataset.s; if (collapsed.has(id)) collapsed.delete(id); else collapsed.add(id); render(); }
    });
    root.querySelector('#cComo').addEventListener('click', (e) => {
      const n = e.target.closest('[data-niv]'); if (n) { F.niv = F.niv === n.dataset.niv ? '' : n.dataset.niv; render(); return; }
      const z = e.target.closest('[data-zona]'); if (z) { F.zona = F.zona === z.dataset.zona ? '' : z.dataset.zona; render(); }
    });
  }

  function fecha4D() { const A = window.AUO; const t = A && A.state ? A.state.t : Date.now(); return clamp(t, T0, T1); }
  // los tipos de conexión sólo existen en la clase «Conexiones»: al elegir uno se quita otra clase seleccionada
  function setPz(p) { F.pz = p; if (p && F.cl && F.cl !== 'CON') F.cl = ''; }

  // ------------------------------------------------------------------ cálculo y tabla
  function agrupar(rows) {
    // sistema → clase → (tipo, medida, red); además, piezas por tipo de conexión de cada sistema y clase
    const out = new Map();
    for (const r of rows) {
      let s = out.get(r.sys); if (!s) out.set(r.sys, s = new Map());
      let c = s.get(r.cl); if (!c) { c = new Map(); c.pz = new Map(); s.set(r.cl, c); }
      const k = r.tipo + '\u0001' + r.med + '\u0001' + r.red;
      let it = c.get(k); if (!it) c.set(k, it = { tipo: r.tipo, med: r.med, red: r.red, pz: r.pz, n: 0, m: 0, ni: 0, mi: 0 });
      const f = frac(r);
      it.n += r.n; it.m += r.m; it.ni += r.n * f; it.mi += r.m * f;
      if (r.pz) c.pz.set(r.pz, (c.pz.get(r.pz) || 0) + r.n);
    }
    return out;
  }
  const val = (o, u) => u === 'm' ? o.m : o.n;
  const vali = (o, u) => u === 'm' ? o.mi : o.ni;
  const fmtV = (v, u) => u === 'm' ? nf1.format(v) : nf0.format(Math.round(v));
  const pct = (a, b) => b > 0 ? Math.round(100 * a / b) : 0;
  const un = (v, u) => u === 'm' ? 'm' : (Math.round(v) === 1 ? 'pza' : 'pzas');
  // ordena partidas: tipo de conexión, luego nombre y medida
  const ordenItems = (a, b) => pzIdx(a.pz) - pzIdx(b.pz) || a.tipo.localeCompare(b.tipo, 'es') || numMed(a.med) - numMed(b.med) || a.med.localeCompare(b.med, 'es') || a.red.localeCompare(b.red, 'es');

  function render() {
    if (!root) return;
    // estado de los controles
    root.querySelectorAll('#cSys .chip').forEach(b => b.classList.toggle('on', b.dataset.sys ? F.sys.has(b.dataset.sys) : F.sys.size === 0));
    const segOn = (sel, v) => root.querySelectorAll(sel + ' button').forEach(b => b.classList.toggle('on', b.dataset.v === String(v)));
    segOn('#cNiv', F.niv); segOn('#cZona', F.zona); segOn('#cEst', F.est); segOn('#cModo', F.fecha ? '1' : '0');
    root.querySelector('#cCl').value = F.cl; root.querySelector('#cTarea').value = F.tarea;
    // tipos de conexión con los demás filtros (para que al elegir uno sigan visibles los otros)
    const pzMap = new Map();   // sistema → Map(tipo de conexión → piezas)
    for (const r of ROWS) if (r.pz && pass(r, 'pz', 'cl')) { let m = pzMap.get(r.sys); if (!m) pzMap.set(r.sys, m = new Map()); m.set(r.pz, (m.get(r.pz) || 0) + r.n); }
    const sPz = root.querySelector('#cPz');
    if (sPz) {
      const disp = new Set([...pzMap.values()].flatMap(m => [...m.keys()])); if (F.pz) disp.add(F.pz);
      sPz.innerHTML = `<option value="">Todas</option>${PIEZAS.filter(p => disp.has(p)).map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('')}`;
      sPz.value = F.pz;
    }
    if (F.t == null) F.t = fecha4D();
    root.querySelector('#cFecha').value = isoD(F.t);
    root.querySelector('#cFechaBox').style.opacity = F.fecha ? '1' : '.55';
    root.querySelector('[data-a="como"]').classList.toggle('on', verComo);
    const v3 = root.querySelector('[data-a="ver3d"]');
    const A = window.AUO;
    const enVisor = [...F.sys].filter(id => A && A.SISTEMAS && A.SISTEMAS.some(s => s.id === id));
    v3.disabled = !A || !A.setDisc || (F.sys.size > 0 && enVisor.length === 0);

    // tarjetas: totales por clase (con todos los filtros salvo la clase)
    const base = ROWS.filter(r => pass(r, 'cl'));
    const porClase = new Map();
    for (const r of base) { let o = porClase.get(r.cl); if (!o) porClase.set(r.cl, o = { n: 0, m: 0, ni: 0, mi: 0 }); const f = frac(r); o.n += r.n; o.m += r.m; o.ni += r.n * f; o.mi += r.m * f; }
    const cards = [...porClase.entries()].sort((a, b) => CL[a[0]].i - CL[b[0]].i).map(([id, o]) => {
      const c = CL[id], u = c.u;
      const sub = u === 'm' ? `${nf0.format(o.n)} tramos` : '';
      return `<button class="card${F.cl === id ? ' on' : ''}" data-card="${id}" title="Filtrar por esta clase">
        <div class="v">${fmtV(val(o, u), u)}<small>${un(val(o, u), u)}</small></div>
        <div class="l">${esc(c.nombre)}${sub ? ` · ${sub}` : ''}</div>
        ${F.fecha ? `<div class="p">Instalado ${fmtV(vali(o, u), u)} ${un(vali(o, u), u)} · ${pct(vali(o, u), val(o, u))}%</div>` : ''}</button>`;
    }).join('');

    const rows = base.filter(r => pass(r));
    const G = agrupar(rows);
    const fechaCols = F.fecha, ncol = fechaCols ? 7 : 5;
    let partidas = 0;
    const body = [];
    for (const s of SIS) {
      const sg = G.get(s.id); if (!sg) continue;
      let sm = 0, sn = 0, smi = 0, sni = 0;
      for (const [cl, items] of sg) for (const it of items.values()) { if (CL[cl].u === 'm') { sm += it.m; smi += it.mi; } else { sn += it.n; sni += it.ni; } }
      const col = collapsed.has(s.id);
      const resumen = [sm > 0 ? `${nf1.format(sm)} m` : '', sn > 0 ? `${nf0.format(sn)} pzas` : ''].filter(Boolean).join(' · ');
      const resI = fechaCols ? [sm > 0 ? `${nf1.format(smi)} m (${pct(smi, sm)}%)` : '', sn > 0 ? `${nf0.format(Math.round(sni))} pzas (${pct(sni, sn)}%)` : ''].filter(Boolean).join(' · ') : '';
      body.push(`<tr class="sys${col ? ' col' : ''}" data-s="${esc(s.id)}"><td colspan="3"><span class="car">▾</span><i class="sw" style="background:${s.color}"></i>${esc(s.nombre)}${s.arq ? ' <span style="font-weight:500;color:#8994a0">(modelo arquitectónico)</span>' : ''}</td><td class="n" colspan="2">${resumen}</td>${fechaCols ? `<td class="n" colspan="2">${resI}</td>` : ''}</tr>`);
      if (col) continue;
      const clases = [...sg.keys()].sort((a, b) => CL[a].i - CL[b].i);
      for (const cl of clases) {
        const c = CL[cl], u = c.u, grp = sg.get(cl);
        const items = [...grp.values()].sort(ordenItems);
        body.push(`<tr class="cl"><td colspan="${ncol}">${esc(c.nombre)}<span class="u">${u === 'm' ? 'longitud en metros' : 'piezas'}</span></td></tr>`);
        // resumen por tipo de conexión (codos 45° / 90°, yees, tees…)
        const pzSys = cl === 'CON' ? pzMap.get(s.id) : null;
        if (pzSys && pzSys.size) {
          const pzs = [...pzSys.entries()].sort((a, b) => pzIdx(a[0]) - pzIdx(b[0]) || a[0].localeCompare(b[0], 'es'));
          body.push(`<tr class="pzs"><td colspan="${ncol}">${pzs.map(([p, n]) => `<span class="pzc${F.pz === p ? ' on' : ''}" data-pz="${esc(p)}" title="Filtrar por ${esc(p.toLowerCase())}">${esc(p)} <b>${nf0.format(n)}</b></span>`).join('')}</td></tr>`);
        }
        let tn = 0, tm = 0, tni = 0, tmi = 0;
        for (const it of items) {
          partidas++;
          tn += it.n; tm += it.m; tni += it.ni; tmi += it.mi;
          const p = pct(vali(it, u), val(it, u));
          body.push(`<tr class="it"><td>${esc(it.tipo)}</td><td>${esc(it.med)}</td><td class="red">${esc(it.red)}</td><td class="n">${nf0.format(it.n)}</td><td class="n">${u === 'm' ? nf1.format(it.m) : ''}</td>${fechaCols ? `<td class="n">${fmtV(vali(it, u), u)}</td><td class="n"><span class="bar"><i style="width:${p}%"></i></span>${p}%</td>` : ''}</tr>`);
        }
        if (items.length > 1) {
          const p = pct(u === 'm' ? tmi : tni, u === 'm' ? tm : tn);
          body.push(`<tr class="st"><td colspan="3">Subtotal ${esc(c.nombre.toLowerCase())}</td><td class="n">${nf0.format(tn)}</td><td class="n">${u === 'm' ? nf1.format(tm) : ''}</td>${fechaCols ? `<td class="n">${u === 'm' ? nf1.format(tmi) : nf0.format(Math.round(tni))}</td><td class="n">${p}%</td>` : ''}</tr>`);
        }
      }
    }

    const filtros = descFiltros();
    root.querySelector('#cBd').innerHTML = `
      ${cards ? `<div class="cards">${cards}</div>` : ''}
      <div class="tools"><div class="info">${rows.length ? `${nf0.format(partidas)} partidas · ${esc(filtros)}` : ''}${F.fecha && F.est !== 'N' ? ' · el avance a la fecha aplica sólo a obra nueva' : ''}</div>
        <button class="btn" data-a="expand">Expandir todo</button><button class="btn" data-a="collapse">Contraer todo</button><button class="btn" data-a="limpiar">Quitar filtros</button></div>
      ${rows.length ? `<div class="tw"><table>
        <thead><tr><th>Tipo</th><th>Medida</th><th>Red o servicio</th><th class="n">Piezas / tramos</th><th class="n">Longitud (m)</th>${fechaCols ? `<th class="n">Instalado al ${fmtD(F.t)}</th><th class="n">Avance</th>` : ''}</tr></thead>
        <tbody>${body.join('')}</tbody></table></div>` : '<div class="empty">No hay elementos con estos filtros.</div>'}
      <p class="nota">Cantidades netas medidas en el modelo coordinado, sin desperdicio ni holguras: tubería, ductos y conduit por longitud a ejes (los tramos son las piezas del modelo); conexiones, accesorios, equipos y salidas por pieza. Las conexiones de hidráulica, sanitaria y PCI llevan su nombre comercial del modelo (descripción o BOM); el ángulo es el nominal o, si el modelo no lo trae, el medido redondeado (45°, 90°). El nivel y la zona se toman de la posición de cada elemento (ver «Cómo se divide»; 9 elementos sin geometría toman el nivel del modelo) y la actividad, del programa de obra del 4D. «Instalado a la fecha» reparte cada partida de obra nueva en proporción al avance programado de su actividad. Los conduits de voz y datos y de seguridad están en «Eléctrica» con su servicio en la columna «Red o servicio». Los muebles sanitarios provienen del modelo arquitectónico. Generado el ${esc(D.generado)}.</p>`;

    const como = root.querySelector('#cComo');
    como.classList.toggle('oculto', !verComo);
    if (verComo) como.innerHTML = comoHTML();
  }

  // ------------------------------------------------------------------ «Cómo se divide»: corte, planta y alcance
  function totales(rows) {
    let m = 0, n = 0;
    for (const r of rows) { if (CL[r.cl].u === 'm') m += r.m; else n += r.n; }
    return [m > 0 ? `${nf1.format(m)} m` : '', n > 0 ? `${nf0.format(n)} pzas` : ''].filter(Boolean).join(' · ') || '—';
  }

  function comoHTML() {
    // totales de cada nivel y zona con los demás filtros
    const porNiv = {}, porZona = {};
    for (const [id] of NIVELES.slice(1)) porNiv[id] = totales(ROWS.filter(r => r.niv === id && pass(r, 'niv')));
    for (const [id] of ZONAS.slice(1)) porZona[id] = totales(ROWS.filter(r => r.zona === id && pass(r, 'zona')));
    const rep = D.repartidos || { tramos: 0, metros: 0 };
    const ref = (c) => REFS.find(x => x.c === c);
    return `
      <h3>Cómo se divide</h3>
      <div class="sub">Toque una franja o una zona para filtrar la tabla.</div>
      <h4>Niveles · corte esquemático de la ampliación</h4>
      ${corteSVG(porNiv)}
      <div class="lim">
        <b class="n">1</b><div><b>${cota(CORTE.BP)} · N.P.T. de planta baja.</b> Lo que queda todo abajo (con 5 cm de tolerancia) es <b>Bajo piso</b>: redes enterradas, registros, coladeras, red de tierras y tubería en el firme. Las salidas de piso de PB (cajas de piso y sus tapas) cuentan en planta baja.</div>
        <b class="n">2</b><div><b>${cota(CORTE.PB)} · lecho bajo de la losacero del entrepiso.</b> <b>Planta baja</b> va de 1 a 2: incluye el plafón${ref('plafon') ? ` (${cota(ref('plafon').z)})` : ''} y lo que corre bajo la losa, entre las trabes del entrepiso${ref('trabe') ? ` (desde ${cota(ref('trabe').z)})` : ''}: ductos, conduits, charolas y luminarias. Excepciones que cuentan en planta alta: los drenajes y ventilaciones de los sanitarios de PA colgados bajo la losa (desde ${cota(CORTE.trabes || 3.5)}) y lo que llega al piso de PA (cajas de piso, columnas).</div>
        <b class="n">3</b><div><b>${cota(CORTE.PA)} · arranque de la cubierta</b> (montenes desde ${cota(7.88)}, lámina KR-18 hasta ${cota(8.47)}). <b>Planta alta</b> va de 2 a 3: incluye la losacero del entrepiso (${cota(3.89)} a ${cota(4.0)}), el plafón de PA${ref('plafon2') ? ` (${cota(ref('plafon2').z)})` : ''} y el espacio sobre él. Arriba de 3 es <b>Azotea</b>: equipos, ductos y tuberías sobre la cubierta y el canalón pluvial.</div>
      </div>
      <ul>
        <li>Cada pieza (conexión, equipo, salida) cuenta en el nivel donde inicia, es decir, su punto más bajo, con las excepciones de 1 y 2: bajo piso sólo si queda toda abajo del piso (las salidas de piso de PB cuentan en PB) y en planta alta los drenajes de PA y lo que llega al piso de PA.</li>
        <li>La tubería, ductos y conduit que suben o bajan más de ${nf0.format((rep.desnivelMinimo || 0.6) * 100)} cm y cruzan un límite (bajadas, columnas) se reparten por metro según la altura de cada parte${rep.tramosNuevos != null ? `: ${nf0.format(rep.tramosNuevos)} tramos de obra nueva, ${nf1.format(rep.metrosNuevos)} m` : ''}; en drenajes y ventilaciones el corte entre PB y PA es ${cota(CORTE.trabes || 3.5)}. El tramo se cuenta como pieza donde queda su mayor parte y conserva la actividad del tramo completo. Los tramos casi horizontales cuentan completos en el nivel donde inicia su parte más baja.</li>
        <li>Son los mismos límites que usa el programa de obra del 4D para asignar las actividades por nivel.</li>
      </ul>
      <h4>Zonas · planta</h4>
      ${plantaSVG(porZona)}
      <ul>
        <li>Por el centro de cada elemento: un tramo largo cuenta completo en la zona donde queda su centro.</li>
        <li><b>Ampliación</b>: del eje E al eje A, incluidos los registros y tuberías que salen unos metros del eje A. <b>Oficinas existentes</b>: del eje E al eje N.</li>
        <li><b>Exterior</b>: fuera del edificio de oficinas: la acometida eléctrica (PAD), un registro sanitario y la descarga a la red.</li>
      </ul>
      <h4>Alcance de la cuantificación</h4>
      <ul>
        <li>Todo lo modelado en los seis modelos de instalaciones del DWF del 01-10-26 (hidráulico, sanitario, pluvial, protección contra incendio, HVAC y eléctrico con especiales) más los muebles sanitarios del arquitectónico.</li>
        <li>Cantidades netas: sin desperdicio, cortes ni traslapes.</li>
        <li>No vienen en el modelo y no se cuantifican: cableado (salvo la red de tierras), aislamiento térmico y soportería de hidráulica, sanitaria y ductos (sólo hay soportería de refrigerante, condensados, PCI, equipos de HVAC y dos trapecios eléctricos).</li>
        <li>Existente y «se retira»: sólo protección contra incendio distingue esas fases en el modelo.</li>
      </ul>`;
  }

  // corte: franjas de nivel (como en una sección constructiva) con las cotas reales del modelo
  function corteSVG(porNiv) {
    const W = 300, X0 = 6, X1 = 168, ZT = 9.5, ZB = -1.5, Y0 = 10, Y1 = 446;
    const k = (Y1 - Y0) / (ZT - ZB), y = (z) => Y0 + (ZT - z) * k;
    const bands = [
      { id: 'AZ', z0: CORTE.PA, z1: ZT, fill: '#ece4f7', st: '#7b4fc9', nom: 'Azotea', rango: `${cota(CORTE.PA)} y más` },
      { id: 'PA', z0: CORTE.PB, z1: CORTE.PA, fill: '#e1f3e7', st: '#2e9e5b', nom: 'Planta alta', rango: `${cota(CORTE.PB)} a ${cota(CORTE.PA)}` },
      { id: 'PB', z0: CORTE.BP, z1: CORTE.PB, fill: '#deecfb', st: '#2f6fd0', nom: 'Planta baja', rango: `${cota(CORTE.BP)} a ${cota(CORTE.PB)}` },
      { id: 'BP', z0: ZB, z1: CORTE.BP, fill: '#f5e9c9', st: '#b07a1e', nom: 'Bajo piso', rango: `abajo de ${cota(CORTE.BP)}` },
    ];
    const g = [];
    g.push(`<defs><pattern id="cHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#c9b48a" stroke-width="1"/></pattern></defs>`);
    for (const b of bands) {
      const on = F.niv === b.id, dim = F.niv && !on;
      g.push(`<g data-niv="${b.id}"><rect x="${X0}" y="${y(b.z1)}" width="${X1 - X0}" height="${y(b.z0) - y(b.z1)}" fill="${b.fill}" opacity="${dim ? 0.45 : 1}" stroke="${on ? b.st : 'none'}" stroke-width="2"/></g>`);
    }
    // terreno y cimentación
    g.push(`<rect x="${X0}" y="${y(-0.15)}" width="${X1 - X0}" height="${y(ZB) - y(-0.15)}" fill="url(#cHatch)" opacity=".7" pointer-events="none"/>`);
    g.push(`<rect x="${X0}" y="${y(0)}" width="${X1 - X0}" height="${y(-0.15) - y(0)}" fill="#bfc4c8" pointer-events="none"/>`);
    for (const cx of [24, 146]) {
      g.push(`<rect x="${cx - 9}" y="${y(-0.6)}" width="18" height="${y(-1.2) - y(-0.6)}" fill="#b7b3ab" pointer-events="none"/>`);
      g.push(`<rect x="${cx - 3}" y="${y(8.15)}" width="6" height="${y(-0.6) - y(8.15)}" fill="#8e959b" pointer-events="none"/>`);
    }
    // entrepiso: trabe, losacero; cubierta: trabe, montenes y lámina; plafones
    g.push(`<rect x="27" y="${y(3.89)}" width="116" height="${y(3.53) - y(3.89)}" fill="#8e959b" opacity=".85" pointer-events="none"/>`);
    g.push(`<rect x="${X0}" y="${y(4.0)}" width="${X1 - X0}" height="${y(3.89) - y(4.0)}" fill="#a9a7a2" pointer-events="none"/>`);
    g.push(`<rect x="27" y="${y(8.15)}" width="116" height="${y(7.53) - y(8.15)}" fill="#8e959b" opacity=".85" pointer-events="none"/>`);
    g.push(`<line x1="${X0}" x2="${X1}" y1="${y(8.47)}" y2="${y(8.47)}" stroke="#6f777e" stroke-width="3" pointer-events="none"/>`);
    for (const z of [3.0, 6.70]) g.push(`<line x1="27" x2="143" y1="${y(z)}" y2="${y(z)}" stroke="#7d8a96" stroke-width="1.2" stroke-dasharray="5 3" pointer-events="none"/>`);
    // instalaciones de ejemplo: red enterrada, tubería en plafón PB, drenaje de PA bajo la losa, caja de piso, bajada que cruza niveles, equipo en azotea
    g.push(`<line x1="70" x2="160" y1="${y(-0.75)}" y2="${y(-0.55)}" stroke="#8d5b3b" stroke-width="3" pointer-events="none"/>`);
    g.push(`<line x1="34" x2="138" y1="${y(3.28)}" y2="${y(3.28)}" stroke="#2b7bd6" stroke-width="2.5" pointer-events="none"/>`);
    g.push(`<line x1="96" x2="138" y1="${y(3.72)}" y2="${y(3.62)}" stroke="#8d5b3b" stroke-width="3" pointer-events="none"/>`);
    g.push(`<rect x="110" y="${y(4.0)}" width="9" height="${y(3.72) - y(4.0)}" fill="#c77d00" pointer-events="none"/>`);
    g.push(`<line x1="52" x2="52" y1="${y(8.47)}" y2="${y(-0.7)}" stroke="#16a3a3" stroke-width="3" stroke-dasharray="7 3" pointer-events="none"/>`);
    g.push(`<rect x="92" y="${y(9.2)}" width="38" height="${y(8.47) - y(9.2)}" rx="2" fill="#4b5d7a" pointer-events="none"/>`);
    // referencias del modelo (cotas)
    const refTxt = [[8.47, 'lámina de cubierta'], [7.53, 'trabes de cubierta'], [6.70, 'plafón PA'], [4.0, 'N.P.T. PA'], [3.53, 'trabes entrepiso'], [3.0, 'plafón PB'], [0, 'N.P.T. PB']];
    for (const [z, t] of refTxt) g.push(`<text x="31" y="${y(z) - 2.5}" font-size="7.6" fill="#2a3642" stroke="#fff" stroke-width="2.4" stroke-linejoin="round" paint-order="stroke" pointer-events="none">${cota(z)} ${t}</text>`);
    // límites de nivel (rojo) con su número
    [[CORTE.BP, 1], [CORTE.PB, 2], [CORTE.PA, 3]].forEach(([z, n]) => {
      g.push(`<line x1="${X0}" x2="${X1 + 8}" y1="${y(z)}" y2="${y(z)}" stroke="#d64541" stroke-width="1.4" stroke-dasharray="4 3" pointer-events="none"/>`);
      g.push(`<circle cx="${X1 + 15}" cy="${y(z)}" r="7.5" fill="#fff" stroke="#d64541" stroke-width="1.4"/><text x="${X1 + 15}" y="${y(z) + 3.4}" font-size="9.5" font-weight="700" text-anchor="middle" fill="#d64541">${n}</text>`);
    });
    // cotas por franja: flecha, nombre, rango y totales con los filtros
    for (const b of bands) {
      const ya = y(b.z1) + (b.id === 'AZ' ? 2 : 10), yb = y(b.z0) - (b.id === 'BP' ? 2 : 10), xm = X1 + 32;
      const on = F.niv === b.id;
      g.push(`<g data-niv="${b.id}">
        <rect x="${X1 + 24}" y="${y(b.z1) + 1}" width="${W - X1 - 25}" height="${y(b.z0) - y(b.z1) - 2}" fill="${on ? b.fill : '#fff'}" opacity="${on ? 1 : 0.01}"/>
        <line x1="${xm}" x2="${xm}" y1="${ya}" y2="${yb}" stroke="${b.st}" stroke-width="2"/>
        <path d="M${xm - 3.5},${ya + 5} L${xm},${ya} L${xm + 3.5},${ya + 5} M${xm - 3.5},${yb - 5} L${xm},${yb} L${xm + 3.5},${yb - 5}" fill="none" stroke="${b.st}" stroke-width="2"/>
        <text x="${xm + 7}" y="${(ya + yb) / 2 - 8}" font-size="11" font-weight="800" fill="${b.st}">${b.nom}</text>
        <text x="${xm + 7}" y="${(ya + yb) / 2 + 4}" font-size="8.6" fill="#3b4652">${b.rango}</text>
        <text x="${xm + 7}" y="${(ya + yb) / 2 + 16}" font-size="8.6" font-weight="700" fill="#15202b">${esc(porNiv[b.id])}</text>
      </g>`);
    }
    return `<svg class="corte" viewBox="0 0 ${W} ${Y1 + 6}" role="img" aria-label="Corte esquemático con los límites de bajo piso, planta baja, planta alta y azotea">${g.join('')}</svg>`;
  }

  // planta: zonas por el centro del elemento (eje E = límite de la ampliación)
  function plantaSVG(porZona) {
    const W = 300, H = 132, uMin = -16, uMax = 104, x = (u) => 8 + (u - uMin) * (W - 16) / (uMax - uMin);
    const yA = 34, yB = 68, EJE = { N: -6.9, E: 60.4, A: 96.95 };
    const z = (id, fill, st) => ({ on: F.zona === id, dim: F.zona && F.zona !== id, fill, st });
    const zx = z('X', '#f1f2f4', '#7d8a96'), zo = z('O', '#e3e6ea', '#5a6774'), za = z('A', '#cfe1fa', '#2f6fd0');
    const g = [];
    g.push(`<g data-zona="X"><rect x="2" y="16" width="${W - 4}" height="${78}" rx="6" fill="${zx.fill}" stroke="${zx.on ? zx.st : '#d5d9de'}" stroke-width="${zx.on ? 2 : 1}" stroke-dasharray="${zx.on ? '' : '4 3'}" opacity="${zx.dim ? 0.5 : 1}"/><text x="8" y="27" font-size="8.5" fill="#5a6774">Exterior</text></g>`);
    g.push(`<g data-zona="O"><rect x="${x(EJE.N)}" y="${yA}" width="${x(EJE.E) - x(EJE.N)}" height="${yB - yA}" fill="${zo.fill}" stroke="${zo.on ? zo.st : '#9aa4ad'}" stroke-width="${zo.on ? 2 : 1}" opacity="${zo.dim ? 0.5 : 1}"/><text x="${(x(EJE.N) + x(EJE.E)) / 2}" y="${(yA + yB) / 2 + 3}" font-size="9" font-weight="700" text-anchor="middle" fill="#3b4652">Oficinas existentes</text></g>`);
    g.push(`<g data-zona="A"><rect x="${x(EJE.E)}" y="${yA}" width="${x(EJE.A) - x(EJE.E)}" height="${yB - yA}" fill="${za.fill}" stroke="${za.on ? za.st : '#2f6fd0'}" stroke-width="${za.on ? 2.2 : 1.2}" opacity="${za.dim ? 0.5 : 1}"/><text x="${(x(EJE.E) + x(EJE.A)) / 2}" y="${(yA + yB) / 2 + 3}" font-size="9" font-weight="800" text-anchor="middle" fill="#0f3f8d">Ampliación</text></g>`);
    for (const [k, u] of Object.entries(EJE)) g.push(`<line x1="${x(u)}" x2="${x(u)}" y1="${yA - 6}" y2="${yB + 4}" stroke="#d64541" stroke-width="1" stroke-dasharray="3 2" pointer-events="none"/><circle cx="${x(u)}" cy="${yA - 11}" r="6.5" fill="#fff" stroke="#3b4652"/><text x="${x(u)}" y="${yA - 8}" font-size="8.5" font-weight="700" text-anchor="middle" fill="#3b4652">${k}</text>`);
    // totales por zona
    const tz = [['A', 'Ampliación (A–E)', '#0f3f8d'], ['O', 'Oficinas existentes (E–N)', '#3b4652'], ['X', 'Exterior', '#5a6774']];
    tz.forEach(([id, t, c], i) => g.push(`<g data-zona="${id}"><text x="8" y="${108 + i * 11}" font-size="8.8" fill="${c}"><tspan font-weight="${F.zona === id ? 800 : 700}">${t}:</tspan> ${esc(porZona[id])}</text></g>`));
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Planta con las zonas de la cuantificación">${g.join('')}</svg>`;
  }

  function descFiltros() {
    const p = [];
    p.push(F.sys.size ? [...F.sys].map(id => SISM[id] ? SISM[id].nombre : id).join(', ') : 'todos los sistemas');
    if (F.cl) p.push(CL[F.cl].nombre.toLowerCase());
    if (F.pz) p.push(F.pz.toLowerCase());
    if (F.niv) p.push(NIVELES.find(x => x[0] === F.niv)[1].toLowerCase());
    if (F.zona) p.push(ZONAS.find(x => x[0] === F.zona)[1].toLowerCase());
    p.push(ESTADOS.find(x => x[0] === F.est)[1].toLowerCase());
    if (F.tarea) p.push(F.tarea === '_wc' ? 'etapa sanitarios PB' : `actividad ${F.tarea}`);
    if (F.q) p.push(`«${F.q}»`);
    if (F.fecha) p.push(`instalado al ${fmtD(F.t)}`);
    return p.join(' · ');
  }

  // ------------------------------------------------------------------ acciones
  function exportCsv() {
    const rows = ROWS.filter(r => pass(r));
    const G = agrupar(rows);
    const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
    const n2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
    const lines = [];
    lines.push(q('Cantidades de instalaciones · Expansión de Oficinas AUO'));
    lines.push(q(`Modelo: ${D.fuente} · Filtros: ${descFiltros()}`));
    lines.push(q(`Niveles: bajo piso abajo de ${cota(CORTE.BP)} (5 cm de tolerancia; las salidas de piso de PB cuentan en PB) · planta baja de ${cota(CORTE.BP)} a ${cota(CORTE.PB)} (lecho bajo de la losacero) · planta alta de ${cota(CORTE.PB)} a ${cota(CORTE.PA)} (los drenajes y ventilaciones de sanitarios de PA desde ${cota(CORTE.trabes || 3.5)} y lo que llega al piso de PA, como cajas de piso y columnas, cuentan en PA) · azotea de ${cota(CORTE.PA)} en adelante (el canalón pluvial cuenta en azotea)`));
    lines.push('');
    const hdr = ['Grupo', 'Sistema', 'Clase', 'Tipo de conexión', 'Tipo', 'Medida', 'Red o servicio', 'Unidad', 'Piezas o tramos', 'Longitud (m)'];
    if (F.fecha) hdr.push(`Instalado al ${isoD(F.t)}`, 'Avance (%)');
    lines.push(hdr.map(q).join(','));
    for (const s of SIS) {
      const sg = G.get(s.id); if (!sg) continue;
      for (const cl of [...sg.keys()].sort((a, b) => CL[a].i - CL[b].i)) {
        const c = CL[cl], u = c.u;
        const items = [...sg.get(cl).values()].sort(ordenItems);
        for (const it of items) {
          const row = [q(s.grupo), q(s.nombre), q(c.nombre), q(it.pz), q(it.tipo), q(it.med), q(it.red), q(u === 'm' ? 'm' : 'pza'), it.n, u === 'm' ? n2(it.m) : ''];
          if (F.fecha) row.push(u === 'm' ? n2(it.mi) : Math.round(it.ni), pct(vali(it, u), val(it, u)));
          lines.push(row.join(','));
        }
      }
    }
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Cantidades instalaciones AUO.csv';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function ver3d() {
    const A = window.AUO; if (!A || !A.setDisc) return;
    const sel = [...F.sys].filter(id => A.SISTEMAS.some(s => s.id === id));
    A.state.sysOff = new Set(sel.length ? A.SISTEMAS.filter(s => !sel.includes(s.id)).map(s => s.id) : []);
    if (A.state.chapter === 'actual' || A.state.chapter === 'alcance' || A.state.chapter === 'video') A.setChapter('instal');
    A.setDisc('mep');
    close();
  }

  function open(mode) {
    if (!root) build();
    const A = window.AUO;
    if (mode === 'sys' && A && A.state && A.SISTEMAS) {
      const on = A.SISTEMAS.filter(s => !A.state.sysOff.has(s.id)).map(s => s.id);
      F.sys = new Set(on.length === A.SISTEMAS.length ? [] : on);
    } else if (mode !== 'keep') F.sys.clear();
    // en el proceso 4D se abre con la fecha de la línea de tiempo
    F.t = fecha4D();
    F.fecha = !!(A && A.state && A.state.chapter === 'proceso');
    lastFocus = document.activeElement;
    root.classList.add('show');
    render();
    root.querySelector('[data-a="cerrar"]').focus();
    if (A && A.pause) A.pause();
  }
  function close() {
    if (!root) return;
    root.classList.remove('show');
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) { /* sin foco previo */ }
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cant]');
    if (b && !(root && root.contains(b))) { e.preventDefault(); open(b.dataset.cant); }
  });
  window.AUO_CANT_UI = { open, close, F, ROWS, render };
})();
