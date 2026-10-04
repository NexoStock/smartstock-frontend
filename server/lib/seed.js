// Turns the static db.json into a fresh in-memory database: the "@today" / "@now" markers and
// "haceMin" (minutes ago) are resolved at start, so the sensors are Online/Disconnected as in the wireflows.
const { today, nowIso, minutesAgoIso } = require('./helpers');

function seed(raw) {
  const db = JSON.parse(JSON.stringify(raw));
  const fix = (v) => (v === '@today' ? today() : v === '@now' ? nowIso() : v);
  for (const rows of Object.values(db)) {
    for (const row of rows) for (const k of Object.keys(row)) row[k] = fix(row[k]);
  }
  db.lecturas.forEach((l, i) => { l.id = i + 1; l.fecha = minutesAgoIso(l.haceMin); delete l.haceMin; });
  for (const s of db.sensores) {
    s.ultimaLecturaAt = s.haceMin === null ? null : minutesAgoIso(s.haceMin);
    s.pesoReferenciaKg = s.productoId ? s.pesoKg : null;
    delete s.haceMin;
  }
  return db;
}
module.exports = { seed };
