/**
 * Asistencia por QR · 5.° "E" · I.E. N.° 82019 "La Florida del Inca"
 *
 * Este script vive dentro de tu hoja de Google (Extensiones > Apps Script).
 * Recibe las marcas de los estudiantes y se las entrega a tu app de asistencia.
 */

// 1) CAMBIA esta clave por una que solo tú conozcas. La escribirás una vez en tu app.
const CLAVE_DOCENTE = 'CAMBIA-ESTA-CLAVE';

const ZONA = 'America/Lima';
const MAX_FALLOS = 80;   // intentos con código equivocado permitidos en toda la sesión

function doGet(e) {
  return responder_(procesar_((e && e.parameter) || {}));
}

function doPost(e) {
  let p = {};
  try { p = JSON.parse(e.postData.contents); } catch (err) {}
  return responder_(procesar_(p));
}

function responder_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function ahora_() {
  const d = new Date();
  return {
    fecha: Utilities.formatDate(d, ZONA, 'yyyy-MM-dd'),
    hora: Utilities.formatDate(d, ZONA, 'HH:mm:ss')
  };
}

function leerSesion_() {
  const t = PropertiesService.getScriptProperties().getProperty('sesion');
  return t ? JSON.parse(t) : null;
}

function guardarSesion_(s) {
  PropertiesService.getScriptProperties().setProperty('sesion', JSON.stringify(s));
}

function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('Marcas');
  if (!sh) {
    sh = ss.insertSheet('Marcas');
    sh.getRange('A:A').setNumberFormat('@');   // fecha como texto
    sh.getRange('D:D').setNumberFormat('@');   // hora como texto
    sh.appendRow(['Fecha', 'Id', 'Estudiante', 'Hora', 'Registrado']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function procesar_(p) {
  try {
    switch (p.accion) {
      case 'sesion':
        return verSesion_();
      case 'marcar':
        return marcar_(p);
      case 'abrir':
      case 'cerrar':
      case 'marcas':
        if (CLAVE_DOCENTE === 'CAMBIA-ESTA-CLAVE') {
          return { ok: false, error: 'Primero cambia la clave en el script (línea CLAVE_DOCENTE).' };
        }
        if (String(p.clave || '') !== CLAVE_DOCENTE) {
          return { ok: false, error: 'La clave del docente no coincide con la del script.' };
        }
        if (p.accion === 'abrir') return abrir_(p);
        if (p.accion === 'cerrar') return cerrar_();
        return listarMarcas_(p);
      default:
        return { ok: false, error: 'Acción no válida.' };
    }
  } catch (err) {
    return { ok: false, error: 'Error del servidor: ' + err.message };
  }
}

// ---------- Estudiantes ----------

function verSesion_() {
  const s = leerSesion_();
  const a = ahora_();
  if (!s) return { ok: true, abierta: false, motivo: 'sin_sesion' };
  if (!s.abierta) return { ok: true, abierta: false, motivo: 'cerrada' };
  if (s.fecha !== a.fecha) return { ok: true, abierta: false, motivo: 'otra_fecha' };
  if (a.hora.slice(0, 5) > s.cierra) return { ok: true, abierta: false, motivo: 'fuera_de_hora', cierra: s.cierra };
  return { ok: true, abierta: true, fecha: s.fecha, cierra: s.cierra, roster: s.roster };
}

function marcar_(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const v = verSesion_();
    if (!v.abierta) return { ok: false, error: 'cerrado', motivo: v.motivo };

    const s = leerSesion_();
    if ((s.fallos || 0) >= MAX_FALLOS) return { ok: false, error: 'bloqueado' };

    const est = s.roster.find(function (r) { return String(r.id) === String(p.id); });
    if (!est) return { ok: false, error: 'estudiante' };

    if (String(p.codigo || '').trim() !== String(s.codigo)) {
      s.fallos = (s.fallos || 0) + 1;
      guardarSesion_(s);
      return { ok: false, error: 'codigo' };
    }

    const sh = hoja_();
    const ultima = sh.getLastRow();
    if (ultima > 1) {
      const datos = sh.getRange(2, 1, ultima - 1, 4).getValues();
      const ya = datos.find(function (r) {
        return String(r[0]) === s.fecha && String(r[1]) === String(est.id);
      });
      if (ya) return { ok: true, ya: true, nombre: est.nombre, hora: String(ya[3]) };
    }

    const a = ahora_();
    sh.appendRow([s.fecha, est.id, est.nombre, a.hora, new Date()]);
    return { ok: true, ya: false, nombre: est.nombre, hora: a.hora };
  } finally {
    lock.releaseLock();
  }
}

// ---------- Docente ----------

function abrir_(p) {
  const a = ahora_();
  if (p.fecha !== a.fecha) {
    return { ok: false, error: 'La fecha de tu celular (' + p.fecha + ') no coincide con la de hoy (' + a.fecha + ').' };
  }
  if (!Array.isArray(p.roster) || !p.roster.length) {
    return { ok: false, error: 'La lista de estudiantes llegó vacía.' };
  }
  if (!/^\d{2}:\d{2}$/.test(String(p.cierra || ''))) {
    return { ok: false, error: 'La hora de cierre no es válida.' };
  }
  const codigo = String(p.codigo || '').trim();
  if (codigo.length < 3) {
    return { ok: false, error: 'El código es muy corto.' };
  }
  guardarSesion_({
    fecha: a.fecha,
    codigo: codigo,
    cierra: p.cierra,
    abierta: true,
    fallos: 0,
    roster: p.roster.map(function (r) { return { id: r.id, nombre: String(r.nombre) }; })
  });
  return { ok: true };
}

function cerrar_() {
  const s = leerSesion_();
  if (s) {
    s.abierta = false;
    guardarSesion_(s);
  }
  return { ok: true };
}

function listarMarcas_(p) {
  const fecha = String(p.fecha || ahora_().fecha);
  const sh = hoja_();
  const ultima = sh.getLastRow();
  const marcas = [];
  if (ultima > 1) {
    sh.getRange(2, 1, ultima - 1, 4).getValues().forEach(function (r) {
      if (String(r[0]) === fecha) {
        marcas.push({ id: r[1], nombre: String(r[2]), hora: String(r[3]) });
      }
    });
  }
  return { ok: true, fecha: fecha, marcas: marcas };
}
