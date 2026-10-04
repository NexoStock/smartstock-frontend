// Alerts & Restocking rules (owner: Sebastián, feature/alerts-email)
// R19 low stock, R20 discrepancy over 10 %, R21 purchase from alert closes the cycle.
const { nextId, nowIso, findSensor, sensorStatus, toUnits } = require('./helpers');

const activeChannels = (db) => db.get('canales-notificacion').filter((c) => c.activo).value();

// The "third-party notification service" is mocked: every sent message is logged
function notify(db, alerta) {
  for (const canal of activeChannels(db)) {
    db.get('notificaciones-enviadas')
      .push({ id: nextId(db, 'notificaciones-enviadas'), alertaId: alerta.id, canal: canal.canal, destino: canal.destino, fecha: nowIso() })
      .write();
  }
}

function createAlert(db, data) {
  const alerta = { id: nextId(db, 'alertas'), estado: 'ACTIVE', creadaEn: nowIso(), resueltaEn: null, ...data };
  db.get('alertas').push(alerta).write();
  if (data.tipo === 'LOW_STOCK') { // only a low stock creates a RestockingNeed (R19)
    const necesidad = { id: nextId(db, 'necesidades-reposicion'), productoId: data.productoId, alertaId: alerta.id, estado: 'PENDING', compraId: null };
    alerta.necesidadId = necesidad.id;
    db.get('necesidades-reposicion').push(necesidad).write();
  }
  notify(db, alerta);
  return alerta;
}

function resolveAlert(db, alerta) {
  alerta.estado = 'RESOLVED';
  alerta.resueltaEn = nowIso();
  const necesidad = db.get('necesidades-reposicion').find((n) => n.id === alerta.necesidadId).value();
  if (necesidad) necesidad.estado = 'COMPLETED';
}

const activeAlert = (db, productoId, tipo) =>
  db.get('alertas').find((a) => a.productoId === productoId && a.tipo === tipo && a.estado === 'ACTIVE').value();

// Called after every StockMovement (StockDecreased / StockIncreased)
function onStockChanged(db, producto, tipo) {
  if (tipo === 'OUT' && producto.stockRegistrado <= producto.umbralMinimo && !activeAlert(db, producto.id, 'LOW_STOCK')) {
    const sensor = producto.sensorId ? findSensor(db, producto.sensorId) : null;
    createAlert(db, {
      tipo: 'LOW_STOCK', productoId: producto.id, stockReferencia: producto.stockRegistrado,
      fuente: sensor && sensorStatus(sensor) === 'online' ? 'sensor' : 'registered',
    });
  }
  if (tipo === 'IN' && producto.stockRegistrado > producto.umbralMinimo) {
    const alerta = activeAlert(db, producto.id, 'LOW_STOCK');
    if (alerta) resolveAlert(db, alerta);
  }
}

// R21: a purchase created from an alert moves the need to IN_PROGRESS
function onPurchaseRegistered(db, compra) {
  if (!compra.restockingNeedId) return;
  const necesidad = db.get('necesidades-reposicion').find((n) => n.id === Number(compra.restockingNeedId)).value();
  if (necesidad) { necesidad.estado = 'IN_PROGRESS'; necesidad.compraId = compra.id; }
}

// R21: receiving that purchase completes the need and resolves the alert
function onPurchaseReceived(db, compra) {
  if (!compra.restockingNeedId) return;
  const necesidad = db.get('necesidades-reposicion').find((n) => n.id === Number(compra.restockingNeedId)).value();
  if (!necesidad) return;
  const alerta = db.get('alertas').find((a) => a.id === necesidad.alertaId).value();
  if (alerta && alerta.estado === 'ACTIVE') resolveAlert(db, alerta);
  necesidad.estado = 'COMPLETED';
}

// R18 / R20: a new reading is compared with the registered stock
function onReading(db, sensor, producto) {
  if (!producto) return;
  const fisico = toUnits(sensor.pesoKg, producto.pesoUnitario);
  const registrado = producto.stockRegistrado;
  const pct = registrado > 0 ? ((fisico - registrado) / registrado) * 100 : 0;
  const alerta = activeAlert(db, producto.id, 'DISCREPANCY');
  if (Math.abs(pct) > 10 && !alerta) {
    createAlert(db, {
      tipo: 'DISCREPANCY', productoId: producto.id, stockReferencia: registrado, fuente: 'sensor',
      stockRegistrado: registrado, stockFisico: fisico, diferenciaPct: Math.round(pct * 10) / 10,
    });
  } else if (Math.abs(pct) <= 10 && alerta) {
    resolveAlert(db, alerta);
  }
}

module.exports = { notify, createAlert, onStockChanged, onPurchaseRegistered, onPurchaseReceived, onReading };
