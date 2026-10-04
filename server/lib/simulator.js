// Optional "IoT device" simulator: SIMULATE=1 npm run server
// Every 30 s each linked sensor sends a reading close to its registered stock (+/- 3 %). It goes through the
// same function as POST /sensores/:id/lecturas, so the comparison and the alert rules run exactly the same.
const { toUnits } = require('./helpers');
const { receiveReading } = require('../routes/devices');

function start(db, everyMs = 30000) {
  return setInterval(() => {
    for (const sensor of db.get('sensores').value()) {
      if (!sensor.productoId) continue;
      const p = db.get('productos').find({ id: sensor.productoId }).value();
      if (!p || sensor.codigo === 'SN-0002') continue; // SN-0002 stays disconnected on purpose
      const noise = 1 + (Math.random() - 0.5) * 0.06;
      const base = sensor.codigo === 'SN-0003' ? toUnits(sensor.pesoKg, p.pesoUnitario) : p.stockRegistrado;
      receiveReading(db, sensor, Math.round(base * p.pesoUnitario * noise * 100) / 100);
    }
  }, everyMs);
}
module.exports = { start };
