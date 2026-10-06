// IAM endpoints (TS04, owner: Lorena). The mock keeps passwords in plain text; the real backend stores a hash.
const { fail, nextId, nowIso } = require('../lib/helpers');

const session = (user) => ({
  token: `mock-token-${user.id}-${Date.now()}`,
  email: user.email,
  businessName: user.nombreNegocio,
  businessType: user.tipoNegocio,
});

module.exports = (server, db) => {
  server.post('/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    const user = db.get('usuarios').find((u) => u.email.toLowerCase() === String(email || '').toLowerCase() && u.password === password).value();
    // R3: never say which field failed
    if (!user) return fail(res, 401, 'INVALID_CREDENTIALS');
    res.json(session(user));
  });

  server.post('/auth/register', (req, res) => {
    const { businessName, email, password, businessType } = req.body || {};
    if (!businessName || !email || !password || !['minimarket', 'bodega'].includes(businessType)) return fail(res, 400, 'INCOMPLETE');
    // R1: the email is unique
    const exists = db.get('usuarios').find((u) => u.email.toLowerCase() === String(email).toLowerCase()).value();
    if (exists) return fail(res, 409, 'EMAIL_TAKEN');
    const user = { id: nextId(db, 'usuarios'), email, password, nombreNegocio: businessName, tipoNegocio: businessType };
    db.get('usuarios').push(user).write();
    res.status(201).json(session(user)); // the register response carries the token so the user enters directly
  });

  server.post('/auth/forgot-password', (req, res) => {
    const { email } = req.body || {};
    const user = db.get('usuarios').find((u) => u.email.toLowerCase() === String(email || '').toLowerCase()).value();
    if (user) {
      const venceEn = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // R4: expires in 24 h
      db.get('restablecimientos').push({ id: nextId(db, 'restablecimientos'), token: `reset-${Date.now()}`, usuarioId: user.id, emitidoEn: nowIso(), venceEn, usadoEn: null }).write();
    }
    res.json({ sent: true, email, expiresInHours: 24 }); // same answer whether the email exists or not
  });
};