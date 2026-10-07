/*
  HERRAMIENTAS DEL VISOR 4D AUO — propiedades de un elemento y medición en el 3D.
  · «Propiedades»: clic en un elemento → se resalta y se abre una pestaña con sus datos: los del DWF del 01-10-26
    y los calculados para el 4D y las cantidades (sistema, tipo comercial, nivel, zona, actividad del programa).
  · «Medir»: punto a punto (se ajusta a los vértices cercanos) o separación libre entre dos elementos
    (con las cajas envolventes de cada uno, en los ejes del edificio).
  Usa window.AUO (app.js), los tramos por elemento de cada bloque del modelo (mesh.userData.runs) y
  window.AUO_ELEM_DATA (data/elementos.js). Script clásico, para que funcione abriendo el HTML desde la carpeta (file://).
*/
(function () {
  'use strict';
  const espera = (f) => new Promise(r => { const t = () => f() ? r() : setTimeout(t, 250); t(); });
  espera(() => window.__AUO_READY && window.AUO && window.AUO.THREE).then(init);

  const CAT_ES = {
    'Pipes': 'Tubería', 'Pipe Fittings': 'Conexión de tubería', 'Pipe Accessories': 'Válvula o accesorio', 'Flex Pipes': 'Manguera flexible',
    'Ducts': 'Ducto', 'Duct Fittings': 'Conexión de ducto', 'Flex Ducts': 'Ducto flexible', 'Duct Accessories': 'Accesorio de ducto',
    'Air Terminals': 'Difusor o rejilla', 'Mechanical Equipment': 'Equipo mecánico', 'Sprinklers': 'Rociador',
    'Conduits': 'Tubo conduit', 'Conduit Fittings': 'Conexión de conduit', 'Cable Trays': 'Charola', 'Cable Tray Fittings': 'Conexión de charola',
    'Electrical Equipment': 'Equipo eléctrico', 'Electrical Fixtures': 'Contacto o salida', 'Lighting Fixtures': 'Luminaria',
    'Lighting Devices': 'Apagador o sensor', 'Data Devices': 'Salida de voz y datos', 'Security Devices': 'Dispositivo de seguridad',
    'Plumbing Fixtures': 'Mueble sanitario', 'Generic Models': 'Modelo genérico', 'Walls': 'Muro', 'Floors': 'Piso o losa', 'Ceilings': 'Plafón',
    'Doors': 'Puerta', 'Windows': 'Ventana', 'Structural Columns': 'Columna', 'Structural Framing': 'Viga o trabe',
    'Structural Foundations': 'Cimentación', 'Roofs': 'Cubierta', 'Curtain Panels': 'Panel de cancel', 'Curtain Wall Mullions': 'Montante de cancel',
    'Railings': 'Barandal', 'Stairs': 'Escalera', 'Furniture': 'Mueble', 'Furniture Systems': 'Mobiliario', 'Casework': 'Mueble fijo',
    'Specialty Equipment': 'Equipo especial', 'Planting': 'Vegetación', 'Communication Devices': 'Dispositivo de comunicación'
  };
  const FASE_ES = { 'New Construction': 'Construcción nueva', 'Existing': 'Existente' };
  const ESTADO_CANT = { N: 'Obra nueva', E: 'Existente', R: 'Se retira' };
  const NIVEL_ES = { BP: 'Bajo piso', PB: 'Planta baja', PA: 'Planta alta', AZ: 'Azotea' };
  const ZONA_ES = { A: 'Ampliación (ejes A–E)', O: 'Oficinas existentes (ejes E–N)', X: 'Exterior' };
  const ESTADO_4D = { E: 'Existente durante toda la obra', N: 'Se construye', D: 'Se retira', T: 'Obra temporal' };
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf2 = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nf3 = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  const cota = (z) => (Math.abs(z) < 0.005 ? '±' : (z > 0 ? '+' : '−')) + nf2.format(Math.abs(z));
  const fechaCorta = (s) => { const d = new Date(s + 'T12:00:00'); return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`; };

  function css() {
    const st = document.createElement('style'); st.id = 'herrCss';
    st.textContent = `
#toolBtns .chip.on { background: var(--auo, #0f3f8d); color: #fff; border-color: var(--auo, #0f3f8d); }
#propPanel { position: fixed; z-index: 24; right: 16px; top: 74px; width: 360px; max-height: calc(100vh - 200px); overflow: auto; display: none;
  background: var(--card-solid, #fff); border: 1px solid var(--line, rgba(21,32,43,.12)); border-radius: 14px; box-shadow: 0 14px 40px rgba(15,30,45,.22); font-family: Inter, system-ui, sans-serif; color: var(--ink, #15202b); }
#propPanel.show { display: block; }
#propPanel .ph { position: sticky; top: 0; background: var(--card-solid, #fff); padding: 12px 14px 10px; border-bottom: 1px solid var(--line, rgba(21,32,43,.12)); display: flex; gap: 10px; align-items: flex-start; z-index: 1; }
#propPanel .ph .tt { flex: 1; min-width: 0; }
#propPanel .ph b { display: block; font-size: 14.5px; line-height: 1.3; }
#propPanel .ph span { display: block; font-size: 11.5px; color: var(--muted, #5a6774); margin-top: 2px; }
#propPanel .ph i.sw { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; vertical-align: 0; }
#propPanel .x { border: 1px solid var(--line, rgba(21,32,43,.12)); background: #fff; border-radius: 8px; width: 28px; height: 28px; cursor: pointer; flex: none; }
#propPanel .pb { padding: 4px 14px 14px; }
#propPanel h5 { margin: 12px 0 4px; font-size: 10.5px; letter-spacing: .07em; text-transform: uppercase; color: var(--muted, #5a6774); }
#propPanel dl { display: grid; grid-template-columns: 118px 1fr; gap: 3px 10px; margin: 0; font-size: 12px; }
#propPanel dt { color: var(--muted, #5a6774); }
#propPanel dd { margin: 0; color: #1f2b36; word-break: break-word; }
#propPanel .acc { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
#propPanel .acc button { border: 1px solid var(--line, rgba(21,32,43,.12)); background: #fff; border-radius: 8px; font: 600 12px Inter, system-ui, sans-serif; padding: 6px 10px; cursor: pointer; color: #22303c; }
#propPanel .acc button:hover { border-color: var(--auo-2, #2f6fd0); color: var(--auo, #0f3f8d); }
#propPanel .nota { font-size: 11px; color: var(--soft, #8994a0); margin-top: 10px; line-height: 1.4; }
#medBar { position: fixed; z-index: 24; left: 50%; top: 70px; transform: translateX(-50%); display: none; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: center;
  background: var(--card-solid, #fff); border: 1px solid var(--line, rgba(21,32,43,.12)); border-radius: 12px; box-shadow: 0 10px 30px rgba(15,30,45,.18); padding: 8px 12px; font: 500 12.5px Inter, system-ui, sans-serif; color: #22303c; max-width: calc(100vw - 24px); }
#medBar.show { display: flex; }
#medBar .seg { display: inline-flex; border: 1px solid var(--line, rgba(21,32,43,.12)); border-radius: 8px; overflow: hidden; }
#medBar .seg button { border: 0; background: #fff; font: 600 12px Inter, system-ui, sans-serif; padding: 5px 10px; cursor: pointer; color: #2a3642; }
#medBar .seg button + button { border-left: 1px solid var(--line, rgba(21,32,43,.12)); }
#medBar .seg button.on { background: var(--auo, #0f3f8d); color: #fff; }
#medBar .b { border: 1px solid var(--line, rgba(21,32,43,.12)); background: #fff; border-radius: 8px; font: 600 12px Inter, system-ui, sans-serif; padding: 5px 10px; cursor: pointer; color: #22303c; }
#medBar .msg { color: var(--muted, #5a6774); }
.medLbl { position: fixed; z-index: 17; transform: translate(-50%, -120%); background: #15202b; color: #fff; border-radius: 8px; padding: 4px 8px 5px; font: 600 12.5px Inter, system-ui, sans-serif; white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,.25); pointer-events: auto; }
.medLbl small { display: block; font-weight: 500; font-size: 10.5px; color: #c9d4de; }
.medLbl.alerta { background: #b3261e; }
.medLbl .q { margin-left: 6px; cursor: pointer; color: #c9d4de; font-weight: 700; }
@media (max-width: 820px) {
  #propPanel { left: 8px; right: 8px; width: auto; top: auto; bottom: 8px; max-height: 52vh; }
  #medBar { top: 112px; }
}`;
    document.head.appendChild(st);
  }

  function init() {
    const A = window.AUO, THREE = A.THREE, canvas = A.renderer.domElement;
    css();

    // ---------------------------------------------------------------- interfaz
    const views = document.getElementById('views');
    const grp = document.createElement('div'); grp.className = 'group'; grp.id = 'toolBtns';
    grp.innerHTML = `<button class="chip" data-tool="prop" title="Clic en un elemento para ver sus propiedades">Propiedades</button><button class="chip" data-tool="medir" title="Medir distancias en el 3D">Medir</button>`;
    views.insertBefore(grp, views.firstChild);
    const panel = document.createElement('aside'); panel.id = 'propPanel'; panel.setAttribute('aria-label', 'Propiedades del elemento'); document.body.appendChild(panel);
    const bar = document.createElement('div'); bar.id = 'medBar';
    bar.innerHTML = `<span class="seg"><button data-m="pp" class="on">Punto a punto</button><button data-m="ee">Entre elementos</button></span><span class="msg" id="medMsg"></span><button class="b" data-a="borrar">Borrar medidas</button><button class="b" data-a="cerrar">Terminar</button>`;
    document.body.appendChild(bar);

    let tool = null, modo = 'pp', pend = null;      // pend: primer punto o primer elemento de la medición en curso
    const setTool = (t) => {
      tool = tool === t ? null : t;
      grp.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === tool));
      bar.classList.toggle('show', tool === 'medir');
      canvas.style.cursor = tool ? 'crosshair' : '';
      cancelarPend();
      if (tool !== 'prop') cerrarPanel();
      msg();
    };
    grp.addEventListener('click', (e) => { const b = e.target.closest('[data-tool]'); if (b) setTool(b.dataset.tool); });
    bar.addEventListener('click', (e) => {
      const m = e.target.closest('[data-m]'); if (m) { modo = m.dataset.m; bar.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('on', x === m)); cancelarPend(); msg(); return; }
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'borrar') borrarMedidas(); else setTool('medir');
    });
    function msg() {
      const el = document.getElementById('medMsg'); if (!el) return;
      el.textContent = modo === 'pp' ? (pend ? 'Toque el segundo punto' : 'Toque el primer punto (se ajusta a los vértices cercanos)')
        : (pend ? 'Toque el segundo elemento' : 'Toque el primer elemento: se mide la separación libre entre sus cajas');
    }

    // ---------------------------------------------------------------- datos de los elementos
    let ELEM = null, cargando = null;
    function cargarElem() {
      if (cargando) return cargando;
      cargando = (async () => {
        if (!window.AUO_ELEM_DATA) return null;
        const bin = Uint8Array.from(atob(window.AUO_ELEM_DATA), c => c.charCodeAt(0));
        const txt = await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
        const j = JSON.parse(txt);
        ELEM = { t: j.t, e: j.e, campos: j.campos };
        return ELEM;
      })().catch(err => { console.error(err); return null; });
      return cargando;
    }
    function registro(i) {
      if (!ELEM || i < 0 || !ELEM.e[i]) return null;
      const r = ELEM.e[i], o = {};
      ELEM.campos.forEach((c, k) => { o[c] = ELEM.t[r[k]] || ''; });
      return o;
    }
    // índice de triángulos por elemento (se arma una vez)
    let porElem = null;
    function indice() {
      if (porElem) return porElem;
      porElem = new Map();
      for (const it of A.ITEMS) for (const m of it.meshes) {
        const r = m.userData.runs; if (!r) continue;
        let s = 0;
        for (let i = 0; i < r.length; i += 2) { const e = r[i], n = r[i + 1]; let l = porElem.get(e); if (!l) porElem.set(e, l = []); l.push({ mesh: m, start: s, count: n }); s += n; }
      }
      return porElem;
    }
    function elemDeHit(h) {
      const r = h.object.userData.runs; if (!r) return -1;
      let f = h.faceIndex;
      for (let i = 0; i < r.length; i += 2) { if (f < r[i + 1]) return r[i]; f -= r[i + 1]; }
      return -1;
    }
    // geometría visible del elemento en coordenadas de la escena, agrupada por bloque del 4D (para recortar el resaltado
    // con el mismo plano de avance de cada bloque) y su caja envolvente
    const visible = (m) => m.visible && !(m.parent && !m.parent.visible) && !(m.material && m.material.opacity < 0.2);
    function geomElem(idx, hit) {
      const v = new THREE.Vector3(), box = new THREE.Box3();
      let parts = idx >= 0 ? (indice().get(idx) || []) : [];
      if (!parts.length && hit) {   // geometría generada de contexto: el bloque completo
        const g = hit.object.geometry; parts = [{ mesh: hit.object, start: 0, count: (g.index ? g.index.count : g.attributes.position.count) / 3 }];
      }
      parts = parts.filter(p => visible(p.mesh) || (hit && p.mesh === hit.object));   // sin las partes ocultas o aún no construidas
      const porItem = new Map();
      for (const p of parts) {
        const it = p.mesh.userData.item || null;
        let arr = porItem.get(it); if (!arr) porItem.set(it, arr = []);
        const g = p.mesh.geometry, ia = g.index ? g.index.array : null, pa = g.attributes.position; p.mesh.updateMatrixWorld();
        for (let t = p.start; t < p.start + p.count; t++) for (let k = 0; k < 3; k++) {
          v.fromBufferAttribute(pa, ia ? ia[t * 3 + k] : t * 3 + k).applyMatrix4(p.mesh.matrixWorld);
          box.expandByPoint(v); arr.push(v.x, v.y, v.z);
        }
      }
      return { grupos: [...porItem].map(([item, arr]) => ({ item, pos: new Float32Array(arr) })), box, parts };
    }

    // ---------------------------------------------------------------- selección en el 3D
    const ray = new THREE.Raycaster();
    function pick(cx, cy, preferirMEP) {
      const rect = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
      A.scene.updateMatrixWorld(); A.camera.updateMatrixWorld(); ray.setFromCamera(ndc, A.camera);
      const cands = [];
      for (const it of A.ITEMS) for (const m of it.meshes) {
        if (!m.visible || (m.parent && !m.parent.visible)) continue;
        if (m.material && m.material.opacity < 0.2) continue;          // arquitectura fantasma
        cands.push(m);
      }
      // el terreno, la banqueta y el estacionamiento tapan lo enterrado (salvo en la vista bajo piso)
      let suelo = Infinity;
      if (!A.underOn && A.OCULTA_SUELO) { const hs = ray.intersectObjects(A.OCULTA_SUELO, false); if (hs.length) suelo = hs[0].distance; }
      const hits = ray.intersectObjects(cands, false).filter(h => {
        if (h.distance > suelo + 0.01) return false;
        if (A.cutPlane.distanceToPoint(h.point) < -1e-3) return false;   // arriba del corte de nivel
        const it = h.object.userData.item;
        return !(it && it.plane && it.plane.distanceToPoint(h.point) < -1e-3);   // parte aún no construida en el 4D
      });
      if (!hits.length) return null;
      if (preferirMEP) { const m = hits.find(h => h.object.userData.item && h.object.userData.item.disc === 'MEP'); if (m) return m; }
      return hits[0];
    }

    // ---------------------------------------------------------------- resaltado
    function resalte(geo, color) {
      const grupo = new THREE.Group();
      for (const gr of geo.grupos) {
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(gr.pos, 3));
        const planos = gr.item && gr.item.plane ? [A.cutPlane, gr.item.plane] : [A.cutPlane];   // mismo corte y avance del 4D que el elemento
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, clippingPlanes: planos });
        const mesh = new THREE.Mesh(g, mat); mesh.renderOrder = 10; grupo.add(mesh);
      }
      if (!geo.box.isEmpty()) {
        const caja = new THREE.Box3Helper(geo.box.clone().expandByScalar(0.03), new THREE.Color(color));
        caja.material.depthTest = false; caja.material.transparent = true; caja.material.opacity = 0.95; caja.renderOrder = 11;
        grupo.add(caja);
      }
      A.scene.add(grupo); A.dirty = true;
      return grupo;
    }
    function quitar(obj) {
      if (!obj) return;
      A.scene.remove(obj);
      obj.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      A.dirty = true;
    }

    // ---------------------------------------------------------------- pestaña de propiedades
    let sel = null;   // { grupo, idx, parts }
    function cerrarPanel() { panel.classList.remove('show'); if (sel) { quitar(sel.grupo); sel = null; } }
    // la pestaña termina arriba de los botones de vistas para no taparlos
    function ajustarPanel() {
      if (innerWidth <= 820) { panel.style.maxHeight = ''; return; }
      panel.style.maxHeight = Math.max(220, views.getBoundingClientRect().top - 10 - 74) + 'px';
    }
    addEventListener('resize', ajustarPanel);
    async function seleccionar(h) {
      if (!h) { cerrarPanel(); return; }
      const datos = await cargarElem();
      if (tool !== 'prop') return;   // se apagó la herramienta mientras se cargaban los datos
      const idx = elemDeHit(h), r = registro(idx), geo = geomElem(idx, h);
      if (sel) quitar(sel.grupo);
      sel = { grupo: resalte(geo, '#ffb300'), idx, parts: geo.parts };
      panel.innerHTML = htmlPanel(r, h, geo, !datos && h.object.userData.runs);
      panel.classList.add('show'); ajustarPanel();
      panel.querySelector('.x').addEventListener('click', cerrarPanel);
      const sys4d = (h.object.userData.item || {}).sys;
      panel.querySelectorAll('[data-acc]').forEach(b => b.addEventListener('click', () => accion(b.dataset.acc, r, sys4d)));
    }
    // «Ver sólo este sistema» usa el sistema con que el elemento se dibuja en el 3D
    function accion(a, r, sys4d) {
      if (a === 'solo' && sys4d) { if (A.state.disc !== 'mep') A.setDisc('mep'); A.setSysOnly(sys4d); }
      else if (a === 'todos') { A.setSysAll(true); }
      else if (a === 'copiar' && r) { const id = (r.key || '').split('|')[1] || ''; if (navigator.clipboard) navigator.clipboard.writeText(id).catch(() => {}); }
    }
    // nombre y color de un sistema (los del visor y, para muebles sanitarios, los de la cuantificación)
    const SIS_CANT = Object.fromEntries(((window.AUO_CANT && window.AUO_CANT.sistemas) || []).map(s => [s.id, s]));
    const sistema = (id) => (id && A.SIS && A.SIS[id]) || (id && SIS_CANT[id]) || null;
    const chipSis = (s) => `<i class="sw" style="display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;background:${s.color}"></i>${esc(s.nombre)}`;
    function filas(pares) {
      const ok = pares.filter(([, v]) => v != null && String(v).trim() !== '');
      return ok.length ? `<dl>${ok.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>` : '';
    }
    function seccion(t, pares) { const f = filas(pares); return f ? `<h5>${esc(t)}</h5>${f}` : ''; }
    function htmlPanel(r, h, geo, sinDatos) {
      const b = h.object.userData.batch || {}, it = h.object.userData.item || {};
      const st4d = b.status || it.status, tk4d = (b.task && b.task !== 'E') ? b.task : it.task;
      const T = tk4d && A.TASK ? A.TASK[tk4d] : null;
      const sis = sistema(it.sys) || sistema(r && r.sistema);                 // como se dibuja en el 3D
      const sisCant = r && r.sistema && r.sistema !== it.sys ? sistema(r.sistema) : null;   // si la cuantificación lo cuenta en otro sistema
      if (sinDatos) {
        return `<div class="ph"><div class="tt"><b>Propiedades no disponibles</b><span>No se pudieron leer los datos de los elementos; abra la presentación en Chrome o Edge actualizados.</span></div><button class="x" aria-label="Cerrar">✕</button></div>`;
      }
      const bx = geo.box, dims = bx.isEmpty() ? null : [bx.max.x - bx.min.x, bx.max.z - bx.min.z, bx.max.y - bx.min.y];
      const actividad = (id) => { const k = id && A.TASK ? A.TASK[id] : null; return k ? `${esc(id)} · ${esc(k.nombre)}<br><span style="color:#5a6774">${fechaCorta(k.inicio)} – ${fechaCorta(k.fin)}</span>` : esc(id || ''); };
      if (!r) {
        return `<div class="ph"><div class="tt"><b>Elemento de contexto</b><span>Geometría generada para la simulación (no viene del DWF)</span></div><button class="x" aria-label="Cerrar">✕</button></div>
          <div class="pb">${seccion('En el 4D', [['Estado', esc(ESTADO_4D[st4d] || st4d || '')], ['Actividad', T ? actividad(tk4d) : '']])}
          ${dims ? seccion('Ubicación', [['Elevación', `${cota(bx.min.y)} a ${cota(bx.max.y)}`], ['Caja', `${nf2.format(dims[0])} × ${nf2.format(dims[1])} × ${nf2.format(dims[2])} m`]]) : ''}</div>`;
      }
      const idRevit = (r.key || '').split('|')[1] || '';
      const titulo = r.tipoComercial || r.tipo || r.familia || r.categoria || 'Elemento';
      const catEs = CAT_ES[r.categoria] ? `${CAT_ES[r.categoria]} (${r.categoria})` : r.categoria;
      const sub = [sis ? `<i class="sw" style="background:${sis.color}"></i>${esc(sis.nombre)}` : '', esc(CAT_ES[r.categoria] || r.categoria)].filter(Boolean).join(' · ');
      const longitud = r.longitud ? `${nf2.format(+r.longitud)} m` : '';
      return `<div class="ph"><div class="tt"><b>${esc(titulo)}</b><span>${sub}</span></div><button class="x" aria-label="Cerrar">✕</button></div>
      <div class="pb">
        ${r.sistema || sis ? seccion('Instalación', [
          ['Sistema', sis ? chipSis(sis) : esc(r.sistema)],
          ['Sistema en cantidades', sisCant ? chipSis(sisCant) : ''],
          ['Tipo de conexión', esc(r.conexion)], ['Tipo comercial', esc(r.tipoComercial)], ['Medida', esc(r.medida)], ['Red o servicio', esc(r.red)], ['Longitud', longitud]]) : ''}
        ${seccion('Ubicación', [
          ['Nivel', esc(r.nivel ? r.nivel.replace(/\b(BP|PB|PA|AZ)\b/g, m => NIVEL_ES[m]) : '')], ['Nivel del modelo', esc(r.nivelModelo)], ['Zona', esc(ZONA_ES[r.zona] || r.zona)],
          ['Elevación', dims ? `${cota(bx.min.y)} a ${cota(bx.max.y)}` : ''],
          ['Caja (largo × ancho × alto)', dims ? `${nf2.format(dims[0])} × ${nf2.format(dims[1])} × ${nf2.format(dims[2])} m` : '']])}
        ${seccion('Fase y programa', [
          ['Estado en el modelo', esc(ESTADO_CANT[r.estado] || '')], ['En el 4D', esc(ESTADO_4D[st4d] || st4d || '')], ['Actividad', T ? actividad(tk4d) : (r.actividad ? actividad(r.actividad) : '')],
          ['Fase creada', esc(FASE_ES[r.faseCreada] || r.faseCreada)], ['Fase demolida', esc(FASE_ES[r.faseDemolida] || r.faseDemolida)]])}
        ${seccion('Modelo (DWF 01-10-26)', [
          ['Modelo', esc(r.modelo)], ['Categoría', esc(catEs)], ['Familia', esc(r.familia)], ['Tipo', esc(r.tipo)], ['Id de Revit', esc(idRevit)],
          ['Descripción', esc(r.descripcion)], ['Clave / SKU', esc(r.clave)], ['Marca', esc(r.marca)], ['Comentarios', esc(r.comentarios)]])}
        ${seccion('Sistema y dimensiones en el modelo', [
          ['Clasificación', esc(r.clasifSistema)], ['Nombre de sistema', esc(r.nombreSistema)], ['Tipo de sistema', esc(r.tipoSistema)],
          ['Tamaño', esc(r.tamano)], ['Diámetro', esc(r.diametro)], ['Longitud (modelo)', esc(r.longitudModelo)], ['Material', esc(r.material)],
          ['Ángulo', esc(r.angulo)], ['Tablero', esc(r.tablero)], ['Circuito', esc(r.circuito)]])}
        <div class="acc">
          ${it.sys && A.SIS && A.SIS[it.sys] ? `<button data-acc="solo">Ver sólo este sistema</button><button data-acc="todos">Todos los sistemas</button>` : ''}
          ${idRevit ? `<button data-acc="copiar" title="Copiar el Id para buscarlo en Revit o Navisworks">Copiar Id ${esc(idRevit)}</button>` : ''}
        </div>
        <p class="nota">Propiedades del DWF «AUO.01-10-26.Expansión Oficinas»; nivel, zona y actividad según las reglas de la cuantificación y del programa 4D.</p>
      </div>`;
    }

    // ---------------------------------------------------------------- medición
    const medidas = [];   // { obj, lbl, a, b }
    function punto(h, cx, cy) {   // punto del clic, ajustado al vértice más cercano del triángulo si está a menos de 12 px
      const g = h.object.geometry, pa = g.attributes.position, ia = g.index ? g.index.array : null, f = h.faceIndex;
      const rect = canvas.getBoundingClientRect(), v = new THREE.Vector3(), s = new THREE.Vector3();
      let best = null, bd = 12;
      for (let k = 0; k < 3; k++) {
        v.fromBufferAttribute(pa, ia ? ia[f * 3 + k] : f * 3 + k).applyMatrix4(h.object.matrixWorld);
        s.copy(v).project(A.camera);
        const d = Math.hypot((s.x + 1) / 2 * rect.width + rect.left - cx, (1 - s.y) / 2 * rect.height + rect.top - cy);
        if (d < bd) { bd = d; best = v.clone(); }
      }
      return best || h.point.clone();
    }
    function marcador(p, color) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true }));
      m.position.copy(p); m.renderOrder = 20; return m;
    }
    function linea(a, b, color, discontinua) {
      const g = new THREE.BufferGeometry().setFromPoints([a, b]);
      const mat = discontinua ? new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08, depthTest: false, transparent: true }) : new THREE.LineBasicMaterial({ color, depthTest: false, transparent: true });
      const l = new THREE.Line(g, mat); if (discontinua) l.computeLineDistances(); l.renderOrder = 20; return l;
    }
    function etiqueta(html, alerta) {
      const d = document.createElement('div'); d.className = 'medLbl' + (alerta ? ' alerta' : ''); d.innerHTML = html + '<span class="q" title="Quitar">✕</span>';
      document.body.appendChild(d); return d;
    }
    function agregarMedida(obj, a, b, html, alerta) {
      A.scene.add(obj);
      const lbl = etiqueta(html, alerta), m = { obj, lbl, a, b };
      lbl.querySelector('.q').addEventListener('click', () => { quitar(m.obj); lbl.remove(); medidas.splice(medidas.indexOf(m), 1); });
      medidas.push(m); A.dirty = true; mover();
    }
    function borrarMedidas() { for (const m of medidas) { quitar(m.obj); m.lbl.remove(); } medidas.length = 0; cancelarPend(); }
    function cancelarPend() { if (pend) { quitar(pend.obj); pend = null; } msg(); }
    // componentes: a lo largo del edificio (u = x), a lo ancho (v = z de la escena) y vertical (y)
    const comp = (a, b) => ({ du: Math.abs(b.x - a.x), dv: Math.abs(b.z - a.z), dz: Math.abs(b.y - a.y) });
    function clicMedir(cx, cy) {
      const h = pick(cx, cy, false); if (!h) return;
      if (modo === 'pp') {
        const p = punto(h, cx, cy);
        if (!pend) { const o = new THREE.Group(); o.add(marcador(p, '#e8590c')); A.scene.add(o); pend = { obj: o, p }; A.dirty = true; msg(); return; }
        const a = pend.p, b = p, o = pend.obj; pend = null; A.scene.remove(o);
        o.add(marcador(b, '#e8590c'), linea(a, b, '#e8590c'));
        const c = comp(a, b), dh = Math.hypot(c.du, c.dv);
        agregarMedida(o, a, b, `${nf3.format(a.distanceTo(b))} m<small>horizontal ${nf2.format(dh)} · vertical ${nf2.format(c.dz)}</small>`);
        msg(); return;
      }
      // entre elementos: separación libre entre las cajas envolventes (en los ejes del edificio)
      cargarElem();
      const idx = elemDeHit(h), geo = geomElem(idx, h);
      if (!pend) { const o = new THREE.Group(); o.add(resalte(geo, '#14a3a3')); A.scene.add(o); pend = { obj: o, box: geo.box.clone() }; msg(); return; }
      const bA = pend.box, bB = geo.box, o = pend.obj; pend = null; A.scene.remove(o);
      o.add(resalte(geo, '#c2255c'));
      const pa = new THREE.Vector3(), pb = new THREE.Vector3(), gap = {};
      for (const ax of ['x', 'y', 'z']) {
        const a0 = bA.min[ax], a1 = bA.max[ax], b0 = bB.min[ax], b1 = bB.max[ax];
        if (a1 < b0) { gap[ax] = b0 - a1; pa[ax] = a1; pb[ax] = b0; }
        else if (b1 < a0) { gap[ax] = a0 - b1; pa[ax] = a0; pb[ax] = b1; }
        else { gap[ax] = 0; pa[ax] = pb[ax] = (Math.max(a0, b0) + Math.min(a1, b1)) / 2; }
      }
      const d = Math.hypot(gap.x, gap.y, gap.z), dh = Math.hypot(gap.x, gap.z);
      o.add(marcador(pa, '#14a3a3'), marcador(pb, '#c2255c'), linea(pa, pb, '#15202b', true));
      if (d < 0.005) agregarMedida(o, pa, pb, `Se tocan o se cruzan<small>posible interferencia entre las cajas de los elementos</small>`, true);
      else agregarMedida(o, pa, pb, `Libre ${nf3.format(d)} m<small>horizontal ${nf2.format(dh)} · vertical ${nf2.format(gap.y)}</small>`);
      msg();
    }

    // posición de las etiquetas de medida (en cada cuadro)
    const tmp = new THREE.Vector3();
    function mover() {
      const rect = canvas.getBoundingClientRect();
      for (const m of medidas) {
        tmp.copy(m.a).add(m.b).multiplyScalar(0.5).project(A.camera);
        const fuera = tmp.z > 1 || tmp.x < -1.2 || tmp.x > 1.2 || tmp.y < -1.2 || tmp.y > 1.2;
        m.lbl.style.display = fuera ? 'none' : '';
        m.lbl.style.left = ((tmp.x + 1) / 2 * rect.width + rect.left) + 'px';
        m.lbl.style.top = ((1 - tmp.y) / 2 * rect.height + rect.top) + 'px';
      }
    }
    let capAnterior = A.state.chapter, enVideoAntes = false;
    (function ciclo() {
      const enVideo = A.state.chapter === 'video';
      if (medidas.length && !enVideo) mover();
      if (A.state.chapter !== capAnterior) { capAnterior = A.state.chapter; cerrarPanel(); cancelarPend(); }   // cambio de capítulo
      if (enVideo !== enVideoAntes) {   // en el capítulo del video las medidas se ocultan (no se borran)
        enVideoAntes = enVideo;
        for (const m of medidas) { m.obj.visible = !enVideo; if (enVideo) m.lbl.style.display = 'none'; }
        A.dirty = true;
      }
      grp.style.display = enVideo ? 'none' : '';
      if (enVideo && tool) setTool(tool);
      // si el elemento seleccionado deja de verse (línea de tiempo, sistemas, disciplina) se cierra la pestaña
      if (sel && sel.parts && sel.parts.length && !sel.parts.some(p => visible(p.mesh))) cerrarPanel();
      requestAnimationFrame(ciclo);
    })();

    // ---------------------------------------------------------------- clics en el 3D (sin arrastrar, para no chocar con la órbita)
    let down = null;
    const dedos = new Set();   // con dos dedos (pellizco) no se selecciona
    canvas.addEventListener('pointerdown', (e) => {
      dedos.add(e.pointerId);
      down = dedos.size === 1 && e.button === 0 ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
    });
    canvas.addEventListener('pointercancel', (e) => { dedos.delete(e.pointerId); down = null; });
    canvas.addEventListener('pointerup', (e) => {
      const varios = dedos.size > 1; dedos.delete(e.pointerId);
      if (varios || !tool || !down || e.button !== 0) { if (varios) down = null; return; }
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t; down = null;
      if (moved > 6 || dt > 600) return;
      if (tool === 'prop') seleccionar(pick(e.clientX, e.clientY, A.state.disc === 'mep'));
      else clicMedir(e.clientX, e.clientY);
    });
    addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !tool) return;
      if (document.querySelector('#lightbox.show, #cant.show')) return;   // Esc cierra primero esas ventanas
      if (pend) cancelarPend(); else if (panel.classList.contains('show')) cerrarPanel(); else setTool(tool);
    });
    dispatchEvent(new Event('resize'));   // el visor recalcula el panel de sistemas con los botones nuevos

    window.AUO_HERR = { setTool, pick, seleccionar, clicMedir, cargarElem, registro, elemDeHit, geomElem, medidas, borrarMedidas, get tool() { return tool; }, get modo() { return modo; }, set modo(v) { modo = v; } };
  }
})();
