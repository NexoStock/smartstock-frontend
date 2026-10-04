// Mock backend of SmartStock: json-server + custom routes with the documented contracts (TS01-TS15).
// It lets the Angular app call the real endpoints until the Spring Boot backend is ready:
// then only `apiBaseUrl` changes in src/environments/environment.ts.
const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');
const raw = require('./db.json');
const { seed } = require('./lib/seed');
const { fail } = require('./lib/helpers');

const server = jsonServer.create();
const router = jsonServer.router(seed(raw)); // in memory: restarting the server resets the data
const db = router.db;

server.use(jsonServer.defaults({ logger: false }));
server.use(jsonServer.bodyParser); // our custom routes read req.body

// The users and the reset tokens are never exposed
server.use((req, res, next) => (/^\/(usuarios|restablecimientos)/.test(req.path) ? fail(res, 404, 'NOT_FOUND') : next()));

// Every request except login/register/forgot and the IoT readings needs the session token
server.use((req, res, next) => {
  const open = req.path.startsWith('/auth/') || (req.method === 'POST' && /^\/sensores\/\d+\/lecturas$/.test(req.path)) || req.method === 'OPTIONS';
  return open || (req.headers.authorization || '').startsWith('Bearer ') ? next() : fail(res, 401, 'UNAUTHORIZED');
});

// Every file in ./routes registers its own endpoints, so each bounded context owner
// adds a route file without editing this one.
for (const file of fs.readdirSync(path.join(__dirname, 'routes')).filter((f) => f.endsWith('.js')).sort()) {
  require(`./routes/${file}`)(server, db);
}
server.use(router);

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => {
  console.log(`SmartStock mock API on http://localhost:${port}`);
  if (process.env.SIMULATE === '1' || process.argv.includes('--simulate')) { require('./lib/simulator').start(db); console.log('IoT simulator ON'); }
});
