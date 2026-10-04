// Suppliers and purchases endpoints (TS09, TS10, TS11, TS12, owner: Candy)
const { fail, nextId, nextCode, today, money, inRange, findProduct } = require('../lib/helpers');
const { applyMovement } = require('../lib/stock');
const alertRules = require('../lib/alert-rules');

const supplierName = (db, id) =>
  (
    db
      .get('proveedores')
      .find((p) => Number(p.id) === Number(id))
      .value() || {}
  ).nombre || '';

const summary = (db, c) => ({
  ...c,
  proveedorNombre: supplierName(db, c.proveedorId),
});

const itemView = (db, i) => ({
  ...i,
  productoNombre: (findProduct(db, i.productoId) || {}).nombre || '',
  subtotal: money(i.cantidad * i.costoUnitario),
});

module.exports = (server, db) => {
  // TS09
  server.post('/proveedores', (req, res) => {
    const { nombre, telefono, correo } = req.body || {};

    if (!nombre || !String(nombre).trim() || !telefono || !String(telefono).trim()) {
      return fail(res, 400, 'INCOMPLETE');
    }

    // R8: the name + phone combination is not repeated
    const same = db
      .get('proveedores')
      .find(
        (p) =>
          p.nombre.toLowerCase() === String(nombre).trim().toLowerCase() &&
          p.telefono.replace(/\s/g, '') === String(telefono).replace(/\s/g, ''),
      )
      .value();

    if (same) {
      return fail(res, 409, 'DUPLICATE_SUPPLIER');
    }

    const proveedor = {
      id: nextId(db, 'proveedores'),
      nombre: String(nombre).trim(),
      correo: correo || '',
      telefono: String(telefono).trim(),
    };

    db.get('proveedores').push(proveedor).write();

    res.status(201).json(proveedor);
  });

  // TS12
  server.get('/compras', (req, res) => {
    const { desde, hasta } = req.query;

    const compras = db
      .get('compras')
      .value()
      .filter((c) => inRange(c.fecha, desde, hasta))
      .sort((a, b) => b.id.localeCompare(a.id));

    const total = money(
      compras.filter((c) => c.estado !== 'CANCELLED').reduce((s, c) => s + c.total, 0),
    );

    res.json({
      compras: compras.map((c) => summary(db, c)),
      total,
    });
  });

  server.get('/compras/:id', (req, res) => {
    const compra = db
      .get('compras')
      .find({
        id: req.params.id,
      })
      .value();

    if (!compra) {
      return fail(res, 404, 'NOT_FOUND');
    }

    const movimientos = db
      .get('movimientos-stock')
      .filter({
        origen: 'PURCHASE',
        origenId: compra.id,
      })
      .value()
      .map((m) => ({
        ...m,
        productoNombre: (findProduct(db, m.productoId) || {}).nombre || '',
      }));

    res.json({
      ...summary(db, compra),
      items: compra.items.map((i) => itemView(db, i)),
      movimientos,
    });
  });

  // TS10: the purchase starts PENDING and does not change the stock (R15)
  server.post('/compras', (req, res) => {
    const { proveedorId, restockingNeedId, items, fecha } = req.body || {};

    if (!items || !items.length) {
      return fail(res, 400, 'NO_ITEMS');
    }

    if (
      !db
        .get('proveedores')
        .find((p) => Number(p.id) === Number(proveedorId))
        .value()
    ) {
      return fail(res, 404, 'SUPPLIER_NOT_FOUND');
    }

    for (const i of items) {
      if (!findProduct(db, i.productoId)) {
        return fail(res, 404, 'PRODUCT_NOT_FOUND');
      }

      if (!(Number.isInteger(i.cantidad) && i.cantidad > 0)) {
        return fail(res, 400, 'INVALID_QUANTITY');
      }
    }

    const compra = {
      id: nextCode(db, 'compras', 'PO'),
      proveedorId: Number(proveedorId),
      fecha: fecha || today(),
      estado: 'PENDING',
      total: money(items.reduce((s, i) => s + i.cantidad * i.costoUnitario, 0)),
      restockingNeedId: restockingNeedId ? Number(restockingNeedId) : null,
      items: items.map((i) => ({
        productoId: Number(i.productoId),
        cantidad: i.cantidad,
        costoUnitario: i.costoUnitario,
      })),
    };

    db.get('compras').push(compra).write();

    alertRules.onPurchaseRegistered(db, compra);

    res.status(201).json({
      id: compra.id,
    });
  });

  // TS11: receiving adds the stock, one IN movement per item (R16)
  server.patch('/compras/:id/recepcion', (req, res) => {
    const compra = db
      .get('compras')
      .find({
        id: req.params.id,
      })
      .value();

    if (!compra) {
      return fail(res, 404, 'NOT_FOUND');
    }

    if (compra.estado === 'RECEIVED') {
      return fail(res, 409, 'ALREADY_RECEIVED');
    }

    compra.estado = 'RECEIVED';

    for (const item of compra.items) {
      applyMovement(db, {
        productoId: item.productoId,
        tipo: 'IN',
        origen: 'PURCHASE',
        origenId: compra.id,
        cantidad: item.cantidad,
      });
    }

    alertRules.onPurchaseReceived(db, compra);

    res.json(summary(db, compra));
  });
};
