// IoT Device endpoints (TS01, TS05, US04, US06, owner: Angel)
const { fail, nextId, nowIso, sensorStatus, toUnits, findProduct, findSensor } = require('../lib/helpers');
const alertRules = require('../lib/alert-rules');

const view = (db, s) => {
  const producto = s.productoId ? findProduct(db, s.productoId) : null;
  return {
    ...s,
    estado: sensorStatus(s),
    productoNombre: producto ? producto.nombre : null,
    unidades: producto ? toUnits(s.pesoKg, producto.pesoUnitario) : null,
  };
};

// Stores one reading and runs the comparison (ReadingReceived -> CompareInventory)
function receiveReading(db, sensor, pesoKg, fecha) {
  const lectura = { id: nextId(db, 'lecturas'), sensorId: sensor.id, pesoKg, fecha: fecha || nowIso() };
  db.get('lecturas').push(lectura).write();
  sensor.pesoKg = pesoKg;
  sensor.ultimaLecturaAt = lectura.fecha;
  alertRules.onReading(db, sensor, sensor.productoId ? findProduct(db, sensor.productoId) : null);
  return lectura;
}

module.exports = (server, db) => {
  server.get('/sensores', (req, res) => res.json(db.get('sensores').value().map((s) => view(db, s))));

  server.post('/sensores/vincular', (req, res) => {
    const { sensorId, productoId } = req.body || {};
    const sensor = findSensor(db, sensorId);
    const producto = findProduct(db, productoId);
    if (!sensor || !producto) return fail(res, 404, 'NOT_FOUND');
    // R9: one sensor, one product
    if (sensor.productoId) {
      const actual = findProduct(db, sensor.productoId);
      return fail(res, 409, 'SENSOR_IN_USE', { productoNombre: actual ? actual.nombre : '' });
    }
    if (producto.sensorId) return fail(res, 409, 'PRODUCT_HAS_SENSOR');
    sensor.productoId = producto.id;
    sensor.pesoReferenciaKg = sensor.pesoKg; // R10: the initial weight is the reference
    sensor.ultimaLecturaAt = nowIso();
    producto.sensorId = sensor.id;
    res.json(view(db, sensor));
  });

  server.get('/sensores/:id', (req, res) => {
    const sensor = findSensor(db, req.params.id);
    if (!sensor) return fail(res, 404, 'NOT_FOUND');
    res.json(view(db, sensor));
  });

  // TS05
  server.get('/sensores/:id/estado', (req, res) => {
    const sensor = findSensor(db, req.params.id);
    if (!sensor) return fail(res, 404, 'NOT_FOUND');
    res.json({ estado: sensorStatus(sensor), ultimaLecturaAt: sensor.ultimaLecturaAt, pesoKg: sensor.pesoKg });
  });

  // TS01
  server.post('/sensores/:id/lecturas', (req, res) => {
    const sensor = findSensor(db, req.params.id);
    if (!sensor) return fail(res, 404, 'SENSOR_NOT_FOUND');
    const peso = Number(req.body && req.body.peso);
    if (!(peso >= 0)) return fail(res, 400, 'INVALID_WEIGHT');
    const lectura = receiveReading(db, sensor, peso, req.body.fecha);
    res.status(201).json({ id: lectura.id });
  });
};
module.exports.receiveReading = receiveReading;
