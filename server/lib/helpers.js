// Small helpers shared by every mock route (owner: Angel, feature/shared-sprint2-setup)
const FIVE_MINUTES = 5 * 60 * 1000;

const pad = (n, w = 5) => String(n).padStart(w, '0');
const two = (n) => String(n).padStart(2, '0');
const toDate = (d) => `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`; // local yyyy-MM-dd
const today = () => toDate(new Date());
const nowIso = () => new Date().toISOString();
const minutesAgoIso = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();
const money = (n) => Math.round(n * 100) / 100;
const inRange = (fecha, desde, hasta) => (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
const fail = (res, status, code, extra = {}) => res.status(status).json({ code, ...extra });

const nextId = (db, collection) =>
  db.get(collection).value().reduce((max, x) => Math.max(max, Number(x.id) || 0), 0) + 1;

// Codes like R-00042 or PO-00032
const nextCode = (db, collection, prefix) => {
  const max = db.get(collection).value().reduce((m, x) => Math.max(m, parseInt(String(x.id).replace(/\D/g, ''), 10) || 0), 0);
  return `${prefix}-${pad(max + 1)}`;
};

// Business rule R11: online when the last reading is at most 5 minutes old
const sensorStatus = (sensor) => {
  if (!sensor.productoId) return 'available';
  if (sensor.ultimaLecturaAt && Date.now() - Date.parse(sensor.ultimaLecturaAt) <= FIVE_MINUTES) return 'online';
  return 'disconnected';
};

// Business rule R12: weight to whole units using the unit weight of the product
const toUnits = (weightKg, unitWeight) => (unitWeight > 0 ? Math.round(weightKg / unitWeight) : 0);

const findProduct = (db, id) => db.get('productos').find((p) => Number(p.id) === Number(id)).value();
const findSensor = (db, id) => db.get('sensores').find((s) => Number(s.id) === Number(id)).value();

module.exports = { FIVE_MINUTES, pad, toDate, today, nowIso, minutesAgoIso, money, inRange, fail, nextId, nextCode, sensorStatus, toUnits, findProduct, findSensor };
