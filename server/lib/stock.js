// StockMovement registration (TS14, owner: Sebastián)
// registeredStock only changes through a movement (rule R17).
const alertRules = require('./alert-rules');
const { nextId, today, findProduct } = require('./helpers');

function applyMovement(db, { productoId, tipo, origen, origenId, cantidad }) {
  const producto = findProduct(db, productoId);
  producto.stockRegistrado += tipo === 'OUT' ? -cantidad : cantidad;
  const movimiento = { id: nextId(db, 'movimientos-stock'), productoId: producto.id, tipo, origen, origenId, cantidad, fecha: today() };
  db.get('movimientos-stock').push(movimiento).write();
  alertRules.onStockChanged(db, producto, tipo); // StockDecreased / StockIncreased
  return movimiento;
}

module.exports = { applyMovement };
