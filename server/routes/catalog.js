// Product Catalog endpoints (US13, US14, US05, owner: Candy)
const { fail, findProduct, findSensor } = require('../lib/helpers');
const { view } = require('../lib/product-view');

const EDITABLE = [
  'nombre',
  'sku',
  'categoria',
  'pesoUnitario',
  'precioVenta',
  'costoCompra',
  'proveedorHabitual',
  'umbralMinimo',
  'capacidadMaxima',
];

function validate(body) {
  const errors = {};

  if (!body.nombre || !String(body.nombre).trim()) {
    errors.nombre = 'REQUIRED';
  }

  if (!body.categoria || !String(body.categoria).trim()) {
    errors.categoria = 'REQUIRED';
  }

  if (!(Number(body.pesoUnitario) > 0)) {
    errors.pesoUnitario = 'GREATER_THAN_ZERO';
  }

  if (Number(body.precioVenta) < 0 || Number(body.costoCompra) < 0) {
    errors.precio = 'NEGATIVE';
  }

  const cap = Number(body.capacidadMaxima);

  if (!(Number(body.umbralMinimo) > 0) || Number(body.umbralMinimo) > cap) {
    errors.umbralMinimo = 'INVALID_THRESHOLD';
  }

  return errors;
}

module.exports = (server, db) => {
  server.get('/productos', (req, res) => {
    let list = db.get('productos').value();

    if (req.query.sensorId !== undefined) {
      list = list.filter((p) => String(p.sensorId) === String(req.query.sensorId));
    }

    res.json(list.map((p) => view(db, p)));
  });

  server.get('/productos/:id', (req, res) => {
    const p = findProduct(db, req.params.id);

    if (!p) {
      return fail(res, 404, 'NOT_FOUND');
    }

    res.json(view(db, p));
  });

  server.post('/productos', (req, res) => {
    const body = {
      capacidadMaxima: 100,
      ...req.body,
    };

    const errors = validate(body);

    if (Object.keys(errors).length) {
      return fail(res, 400, 'INVALID_PRODUCT', { errors });
    }

    const id =
      db
        .get('productos')
        .value()
        .reduce((m, x) => Math.max(m, x.id), 0) + 1;

    const producto = {
      id,
      nombre: body.nombre.trim(),
      sku: body.sku || '',
      categoria: body.categoria.trim(),
      pesoUnitario: Number(body.pesoUnitario),
      precioVenta: Number(body.precioVenta) || 0,
      costoCompra: Number(body.costoCompra) || 0,
      proveedorHabitual: body.proveedorHabitual || '',
      stockRegistrado: Math.max(0, parseInt(body.stockRegistrado, 10) || 0),
      umbralMinimo: Number(body.umbralMinimo),
      capacidadMaxima: Number(body.capacidadMaxima),
      sensorId: null,
    };

    db.get('productos').push(producto).write();

    res.status(201).json(view(db, producto));
  });

  server.put('/productos/:id', (req, res) => {
    const p = findProduct(db, req.params.id);

    if (!p) {
      return fail(res, 404, 'NOT_FOUND');
    }

    const next = { ...p };

    for (const key of EDITABLE) {
      if (req.body[key] !== undefined) {
        next[key] = req.body[key];
      }
    }

    const errors = validate(next);

    if (Object.keys(errors).length) {
      return fail(res, 400, 'INVALID_PRODUCT', { errors });
    }

    Object.assign(p, next);

    res.json(view(db, p));
  });

  server.put('/sensores/:id/umbral', (req, res) => {
    const sensor = findSensor(db, req.params.id);

    const producto = sensor && sensor.productoId ? findProduct(db, sensor.productoId) : null;

    if (!producto) {
      return fail(res, 404, 'NOT_FOUND');
    }

    const umbral = Number(req.body && req.body.umbralMinimo);

    if (!(umbral > 0)) {
      return fail(res, 422, 'THRESHOLD_INVALID');
    }

    if (umbral > producto.capacidadMaxima) {
      return fail(res, 422, 'THRESHOLD_EXCEEDS_CAPACITY', {
        maxCapacity: producto.capacidadMaxima,
      });
    }

    producto.umbralMinimo = umbral;

    res.json(view(db, producto));
  });
};
