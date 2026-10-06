const {
  fail,
  findProduct,
  findSensor,
  sensorStatus,
  toUnits,
  nowIso,
  inRange,
} = require('../lib/helpers');
const { notify } = require('../lib/alert-rules');

const minutesSince = (iso) =>
  iso
    ? Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000))
    : null;

const view = (db, alert) => {
  const product = findProduct(db, alert.productoId);
  const sensor =
    product && product.sensorId
      ? findSensor(db, product.sensorId)
      : null;
  const online = sensor && sensorStatus(sensor) === 'online';

  return {
    ...alert,
    productoNombre: product ? product.nombre : '',
    umbralMinimo: product ? product.umbralMinimo : null,
    stockActual: product ? product.stockRegistrado : null,
    minutosDesdeLectura: online
      ? minutesSince(sensor.ultimaLecturaAt)
      : null,
    unidadesSensor: online
      ? toUnits(sensor.pesoKg, product.pesoUnitario)
      : null,
  };
};

module.exports = (server, db) => {
  server.get('/alertas', (req, res) => {
    const limit = Date.now() - 24 * 60 * 60 * 1000;

    const list = db
      .get('alertas')
      .value()
      .filter(
        (alert) =>
          alert.estado === 'ACTIVE' ||
          (alert.resueltaEn && Date.parse(alert.resueltaEn) >= limit),
      )
      .sort((a, b) => b.id - a.id);

    res.json(list.map((alert) => view(db, alert)));
  });

  server.post('/notificaciones/stock-bajo', (req, res) => {
    const { productoId } = req.body || {};

    const alert = db
      .get('alertas')
      .find(
        (item) =>
          Number(item.productoId) === Number(productoId) &&
          item.estado === 'ACTIVE',
      )
      .value();

    if (!alert) {
      return fail(res, 404, 'ALERT_NOT_FOUND');
    }

    notify(db, alert);
    res.status(202).json({ sent: true, at: nowIso() });
  });

  server.put('/canales-notificacion', (req, res) => {
    const changes = Array.isArray(req.body) ? req.body : [];
    const channels = db.get('canales-notificacion').value();

    const next = channels.map((channel) => {
      const change = changes.find(
        (item) => Number(item.id) === Number(channel.id),
      );

      return change ? !!change.activo : channel.activo;
    });

    if (!next.some(Boolean)) {
      return fail(res, 422, 'AT_LEAST_ONE_CHANNEL');
    }

    channels.forEach((channel, index) => {
      channel.activo = next[index];
    });

    res.json(channels);
  });

  server.get('/movimientos-stock', (req, res) => {
    const { desde, hasta } = req.query;

    const list = db
      .get('movimientos-stock')
      .value()
      .filter((movement) => inRange(movement.fecha, desde, hasta))
      .sort((a, b) => b.id - a.id)
      .map((movement) => ({
        ...movement,
        productoNombre:
          (findProduct(db, movement.productoId) || {}).nombre || '',
      }));

    res.json(list);
  });
};