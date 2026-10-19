'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { crearDb } = require('../src/db');
const menu = require('../src/modules/menu');
const pedidos = require('../src/modules/pedidos');
const caja = require('../src/modules/caja');

const dia = new Date('2026-11-20T15:00:00Z');
const ahora = () => dia;

function pedidoPagado(db, platoId, cantidad) {
  const p = pedidos.crearPedido(db, { mesa: 1, items: [{ platoId, cantidad }] }, 1, ahora);
  for (const e of ['en_preparacion', 'listo', 'entregado', 'pagado']) pedidos.cambiarEstado(db, p.id, e, ahora);
}

test('el reporte suma solo pedidos pagados del dia', () => {
  const db = crearDb();
  const cat = menu.crearCategoria(db, { nombre: 'Fuertes' });
  const plato = menu.crearPlato(db, { nombre: 'Ajiaco', precio: 20000, categoriaId: cat.id });
  pedidoPagado(db, plato.id, 2);
  pedidoPagado(db, plato.id, 1);
  pedidos.crearPedido(db, { mesa: 2, items: [{ platoId: plato.id, cantidad: 1 }] }, 1, ahora);
  const r = caja.reporteVentas(db, '2026-11-20');
  assert.strictEqual(r.total, 60000);
  assert.strictEqual(r.pedidos, 2);
  assert.strictEqual(r.platosVendidos.Ajiaco, 3);
});

test('el cierre de caja se hace una sola vez por fecha', () => {
  const db = crearDb();
  const c = caja.cierreCaja(db, '2026-11-20', 'Administrador', ahora);
  assert.strictEqual(c.total, 0);
  assert.throws(() => caja.cierreCaja(db, '2026-11-20', 'Administrador', ahora), /ya fue cerrada/);
});
