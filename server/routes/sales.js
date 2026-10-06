// Sales endpoints (TS07, TS08, owner: Lorena)
const { fail, nextCode, today, money, inRange, findProduct } = require('../lib/helpers');
const { applyMovement } = require('../lib/stock');

const itemView = (db, i) => {
  const p = findProduct(db, i.productoId);
  return { ...i, productoNombre: p ? p.nombre : '', subtotal: money(i.cantidad * i.precioUnitario) };
};

module.exports = (server, db) => {
  // TS08: history by date range with the total of the period
  server.get('/ventas', (req, res) => {
    const { desde, hasta } = req.query;
    const ventas = db.get('ventas').value().filter((v) => inRange(v.fecha, desde, hasta)).sort((a, b) => b.id.localeCompare(a.id));
    const total = money(ventas.filter((v) => v.estado === 'COMPLETED').reduce((s, v) => s + v.total, 0));
    res.json({ ventas, total });
  });

  server.get('/ventas/:id', (req, res) => {
    const venta = db.get('ventas').find({ id: req.params.id }).value();
    if (!venta) return fail(res, 404, 'NOT_FOUND');
    const movimientos = db.get('movimientos-stock').filter({ origen: 'SALE', origenId: venta.id }).value()
      .map((m) => ({ ...m, productoNombre: (findProduct(db, m.productoId) || {}).nombre || '' }));
    res.json({ ...venta, items: venta.items.map((i) => itemView(db, i)), movimientos });
  });

  // TS07: registers the sale, validates the stock and creates one OUT movement per item
  server.post('/ventas', (req, res) => {
    const items = (req.body && req.body.items) || [];
    if (!items.length) return fail(res, 400, 'NO_ITEMS');
    const wanted = {};
    for (const item of items) {
      const p = findProduct(db, item.productoId);
      if (!p) return fail(res, 404, 'PRODUCT_NOT_FOUND', { productoId: item.productoId });
      // R14: a product without a sale price cannot be sold
      if (!(Number(p.precioVenta) > 0) || !(Number(item.precioUnitario) > 0)) return fail(res, 422, 'NO_SALE_PRICE', { productoId: p.id, productoNombre: p.nombre });
      if (!(Number.isInteger(item.cantidad) && item.cantidad > 0)) return fail(res, 400, 'INVALID_QUANTITY', { productoId: p.id });
      wanted[p.id] = (wanted[p.id] || 0) + item.cantidad;
    }
    // R13: a sale never exceeds the registered stock and the stock is not modified when it fails
    for (const [id, cantidad] of Object.entries(wanted)) {
      const p = findProduct(db, id);
      if (cantidad > p.stockRegistrado) return fail(res, 422, 'INSUFFICIENT_STOCK', { productoId: p.id, productoNombre: p.nombre, available: p.stockRegistrado });
    }
    const id = nextCode(db, 'ventas', 'R');
    const venta = {
      id, fecha: today(), estado: 'COMPLETED',
      total: money(items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0)),
      items: items.map((i) => ({ productoId: Number(i.productoId), cantidad: i.cantidad, precioUnitario: i.precioUnitario })),
    };
    db.get('ventas').push(venta).write();
    for (const item of venta.items) applyMovement(db, { productoId: item.productoId, tipo: 'OUT', origen: 'SALE', origenId: id, cantidad: item.cantidad });
    res.status(201).json({ id });
  });
};