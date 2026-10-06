// Inventory Monitoring: stock query, product detail with readings and comparison (TS02, TS06, owner: Kiara)
const { fail, findProduct, findSensor, sensorStatus, toUnits } = require('../lib/helpers');
const { view: productView } = require('../lib/product-view');

// R17: the registered stock only moves with StockMovements; the sensor only verifies it (R18)
function compare(db, p) {
  const sensor = p.sensorId ? findSensor(db, p.sensorId) : null;
  const base = { productoId: p.id, productoNombre: p.nombre, stockRegistrado: p.stockRegistrado };
  if (!sensor || sensorStatus(sensor) !== 'online') {
    return {
      ...base,
      pesoKg: null,
      unidadesFisicas: null,
      diferenciaPct: null,
      resultado: 'REGISTERED_ONLY',
    };
  }
  const unidadesFisicas = toUnits(sensor.pesoKg, p.pesoUnitario);
  const pct =
    p.stockRegistrado > 0 ? ((unidadesFisicas - p.stockRegistrado) / p.stockRegistrado) * 100 : 0;
  return {
    ...base,
    pesoKg: sensor.pesoKg,
    unidadesFisicas,
    diferenciaPct: Math.round(pct * 10) / 10,
    resultado: Math.abs(pct) > 10 ? 'DISCREPANCY' : 'MATCH', // R20
  };
}

module.exports = (server, db) => {
  // TS02
  server.get('/productos/:id/stock', (req, res) => {
    const p = findProduct(db, req.params.id);
    if (!p) return fail(res, 404, 'NOT_FOUND');
    const v = productView(db, p);
    res.json({
      productoId: p.id,
      stockRegistrado: p.stockRegistrado,
      stockReferencia: v.stockReferencia,
      nivelStock: v.nivelStock,
      estadoSensor: v.estadoSensor,
      unidadesSensor: v.unidadesSensor,
    });
  });

  // M28: product + sensor reading + last 5 readings
  server.get('/productos/:id/detalle', (req, res) => {
    const p = findProduct(db, req.params.id);
    if (!p) return fail(res, 404, 'NOT_FOUND');
    const sensor = p.sensorId ? findSensor(db, p.sensorId) : null;
    const lecturas = sensor
      ? db
          .get('lecturas')
          .filter({ sensorId: sensor.id })
          .value()
          .sort((a, b) => b.fecha.localeCompare(a.fecha))
          .slice(0, 5)
          .map((l) => ({ ...l, unidades: toUnits(l.pesoKg, p.pesoUnitario) }))
      : [];
    res.json({
      producto: productView(db, p),
      sensor: sensor
        ? {
            id: sensor.id,
            codigo: sensor.codigo,
            estado: sensorStatus(sensor),
            pesoKg: sensor.pesoKg,
            unidades: toUnits(sensor.pesoKg, p.pesoUnitario),
            ultimaLecturaAt: sensor.ultimaLecturaAt,
          }
        : null,
      lecturas,
    });
  });

  // TS06 (M39)
  server.get('/inventario/comparacion', (req, res) => {
    const items = db
      .get('productos')
      .value()
      .map((p) => compare(db, p));
    const alerta = db
      .get('alertas')
      .find((a) => a.tipo === 'DISCREPANCY' && a.estado === 'ACTIVE')
      .value();
    res.json({
      items,
      discrepancias: items.filter((i) => i.resultado === 'DISCREPANCY').length,
      alertaId: alerta ? alerta.id : null,
    });
  });

  server.get('/inventario/comparacion/:productoId', (req, res) => {
    const p = findProduct(db, req.params.productoId);
    if (!p) return fail(res, 404, 'NOT_FOUND');
    res.json(compare(db, p));
  });
};
