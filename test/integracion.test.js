'use strict';
const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { crearServidor } = require('../src/server');
const { crearApp } = require('../src/app');
const auth = require('../src/modules/auth');

function peticion(puerto, metodo, ruta, cuerpo, token) {
  return new Promise((resolver, rechazar) => {
    const datos = cuerpo ? JSON.stringify(cuerpo) : null;
    const req = http.request({ port: puerto, method: metodo, path: ruta, headers: {
      'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } }, (res) => {
      let t = '';
      res.on('data', (d) => { t += d; });
      res.on('end', () => resolver({ estado: res.statusCode, cuerpo: t ? JSON.parse(t) : null }));
    });
    req.on('error', rechazar);
    if (datos) req.write(datos);
    req.end();
  });
}

test('flujo completo por HTTP: menu, pedido, pago, reporte y cierre', async () => {
  const app = crearApp({ ahora: () => new Date('2026-11-20T15:00:00Z') });
  auth.registrar(app.db, { nombre: 'Admin', email: 'a@s.co', clave: 'Admin12345', rol: 'administrador' });
  auth.registrar(app.db, { nombre: 'Mesero', email: 'm@s.co', clave: 'Mesero12345', rol: 'mesero' });
  const log = (m, u, c, t) => app.manejar(m, u, c, t);

  const admin = log('POST', '/auth/login', { email: 'a@s.co', clave: 'Admin12345' }).cuerpo.token;
  const mesero = log('POST', '/auth/login', { email: 'm@s.co', clave: 'Mesero12345' }).cuerpo.token;

  const cat = log('POST', '/menu/categorias', { nombre: 'Fuertes' }, admin);
  assert.strictEqual(cat.estado, 201);
  const plato = log('POST', '/menu/platos', { nombre: 'Lechona', precio: 18000, categoriaId: cat.cuerpo.id }, admin);
  assert.strictEqual(plato.estado, 201);
  assert.strictEqual(log('POST', '/menu/platos', { nombre: 'X', precio: 1, categoriaId: 1 }, mesero).estado, 403);

  const ped = log('POST', '/pedidos', { mesa: 5, items: [{ platoId: plato.cuerpo.id, cantidad: 3 }] }, mesero);
  assert.strictEqual(ped.cuerpo.total, 54000);
  for (const estado of ['en_preparacion', 'listo', 'entregado', 'pagado']) {
    assert.strictEqual(log('PATCH', `/pedidos/${ped.cuerpo.id}/estado`, { estado }, mesero).estado, 200);
  }
  const rep = log('GET', '/reportes/ventas?fecha=2026-11-20', null, admin);
  assert.strictEqual(rep.cuerpo.total, 54000);
  assert.strictEqual(log('POST', '/caja/cierre', { fecha: '2026-11-20' }, admin).estado, 201);
  assert.strictEqual(log('POST', '/caja/cierre', { fecha: '2026-11-20' }, admin).estado, 409);
  assert.strictEqual(log('GET', '/reportes/ventas?fecha=2026-11-20').estado, 401);
});

test('el servidor HTTP responde en /salud y valida rutas', async () => {
  const servidor = crearServidor();
  await new Promise((r) => servidor.listen(0, r));
  const { port } = servidor.address();
  const salud = await peticion(port, 'GET', '/salud');
  assert.strictEqual(salud.estado, 200);
  assert.strictEqual(salud.cuerpo.estado, 'ok');
  assert.strictEqual((await peticion(port, 'GET', '/no-existe')).estado, 404);
  const reg = await peticion(port, 'POST', '/auth/registro', { nombre: 'Cli', email: 'c@s.co', clave: 'Cliente12345' });
  assert.strictEqual(reg.estado, 201);
  assert.strictEqual(reg.cuerpo.rol, 'cliente');
  const res = await peticion(port, 'POST', '/reservas', { cliente: 'Cli', mesa: 2, fecha: '2026-12-01', hora: '13:00', personas: 2 });
  assert.strictEqual(res.estado, 201);
  const choque = await peticion(port, 'POST', '/reservas', { cliente: 'Otro', mesa: 2, fecha: '2026-12-01', hora: '13:30', personas: 2 });
  assert.strictEqual(choque.estado, 409);
  await new Promise((r) => servidor.close(r));
});
