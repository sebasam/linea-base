'use strict';
const http = require('http');
const path = require('path');
const { crearApp } = require('./app');

function crearServidor(opciones = {}) {
  const app = crearApp(opciones);
  return http.createServer((req, res) => {
    let texto = '';
    req.on('data', (d) => { texto += d; });
    req.on('end', () => {
      let cuerpo = {};
      try {
        cuerpo = texto ? JSON.parse(texto) : {};
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'JSON no valido.' }));
      }
      const token = (req.headers.authorization || '').replace(/^Bearer /, '');
      const r = app.manejar(req.method, req.url, cuerpo, token);
      res.writeHead(r.estado, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(r.cuerpo === null ? '' : JSON.stringify(r.cuerpo));
    });
  });
}

if (require.main === module) {
  const puerto = Number(process.env.PORT) || 3000;
  crearServidor({ archivoDb: process.env.SIGR_DB || path.join(__dirname, '..', 'data', 'db.json') })
    .listen(puerto, () => console.log(`SIGR escuchando en http://localhost:${puerto}`));
}

module.exports = { crearServidor };
