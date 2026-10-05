// Analytics & Reporting: dashboard and reports (US15, US25, owner: Kiara). Read-only: it consumes the other contexts' data.
const { today, money, inRange, findProduct } = require('../lib/helpers');
const { view: productView } = require('../lib/product-view');

module.exports = (server, db) => {
  // M17: day summary
  server.get('/dashboard', (req, res) => {
    const hoy = today();
    const ventas = db
      .get('ventas')
      .value()
      .filter((v) => v.fecha === hoy && v.estado === 'COMPLETED');
    const compras = db
      .get('compras')
      .value()
      .filter((c) => c.fecha === hoy && c.estado !== 'CANCELLED');
    const actividad = [
      ...ventas.map((v) => ({ tipo: 'SALE', id: v.id, total: v.total, fecha: v.fecha })),
      ...compras.map((c) => ({ tipo: 'PURCHASE', id: c.id, total: c.total, fecha: c.fecha })),
    ]
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 5);
    res.json({
      ventasHoy: { total: money(ventas.reduce((s, v) => s + v.total, 0)), cantidad: ventas.length },
      comprasHoy: {
        total: money(compras.reduce((s, c) => s + c.total, 0)),
        cantidad: compras.length,
      },
      alertasStockBajo: db
        .get('alertas')
        .value()
        .filter((a) => a.estado === 'ACTIVE' && a.tipo === 'LOW_STOCK').length,
      actividadReciente: actividad,
      resumenStock: db
        .get('productos')
        .value()
        .map((p) => {
          const v = productView(db, p);
          return {
            productoId: p.id,
            nombre: p.nombre,
            unidades: v.stockReferencia,
            nivel: v.nivelStock,
            sensor: v.estadoSensor,
          };
        }),
    });
  });

  // M18: totals and stock movements of the period (a Pending purchase does not generate an IN movement)
  server.get('/reportes', (req, res) => {
    const { desde, hasta } = req.query;
    const ventas = db
      .get('ventas')
      .value()
      .filter((v) => v.estado === 'COMPLETED' && inRange(v.fecha, desde, hasta));
    const compras = db
      .get('compras')
      .value()
      .filter((c) => c.estado !== 'CANCELLED' && inRange(c.fecha, desde, hasta));
    const movimientos = db
      .get('movimientos-stock')
      .value()
      .filter((m) => inRange(m.fecha, desde, hasta))
      .sort((a, b) => b.id - a.id)
      .map((m) => ({ ...m, productoNombre: (findProduct(db, m.productoId) || {}).nombre || '' }));
    res.json({
      desde: desde || null,
      hasta: hasta || null,
      ventasTotal: money(ventas.reduce((s, v) => s + v.total, 0)),
      comprasTotal: money(compras.reduce((s, c) => s + c.total, 0)),
      movimientos,
      comprasPendientes: compras.filter((c) => c.estado === 'PENDING').map((c) => c.id),
    });
  });
};
