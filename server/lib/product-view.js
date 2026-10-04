const { findSensor, sensorStatus, toUnits } = require('./helpers');

// The list shows the sensor state, so the product is returned with a small sensor projection
const view = (db, p) => {
  const sensor = p.sensorId ? findSensor(db, p.sensorId) : null;
  const estadoSensor = sensor ? sensorStatus(sensor) : 'none';
  const unidadesSensor = sensor && estadoSensor === 'online' ? toUnits(sensor.pesoKg, p.pesoUnitario) : null;
  // The level uses the online sensor when available; otherwise the registered stock (M27)
  const stockReferencia = unidadesSensor !== null ? unidadesSensor : p.stockRegistrado;
  return { ...p, estadoSensor, unidadesSensor, stockReferencia, nivelStock: stockReferencia <= p.umbralMinimo ? 'lowStock' : 'healthy' };
};

module.exports = { view };
