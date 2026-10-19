'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { crearDb } = require('../src/db');
const menu = require('../src/modules/menu');
const pedidos = require('../src/modules/pedidos');

function escenario() {
  const db = crearDb();
  const cat = menu.crearCategoria(db, { nombre: 'Fuertes' });
  const plato = menu.crearPlato(db, { nombre: 'Sancocho', precio: 25000, categoriaId: cat.id });
  return { db, plato };
}

test('calcula el total del pedido', () => {
  const { db, plato } = escenario();
  const p = pedidos.crearPedido(db, { mesa: 3, items: [{ platoId: plato.id, cantidad: 2 }] }, 1);
  assert.strictEqual(p.total, 50000);
  assert.strictEqual(p.estado, 'recibido');
});

test('el estado avanza solo en orden', () => {
  const { db, plato } = escenario();
  const p = pedidos.crearPedido(db, { mesa: 1, items: [{ platoId: plato.id, cantidad: 1 }] }, 1);
  pedidos.cambiarEstado(db, p.id, 'en_preparacion');
  assert.throws(() => pedidos.cambiarEstado(db, p.id, 'pagado'), /No se puede pasar/);
  pedidos.cambiarEstado(db, p.id, 'listo');
  pedidos.cambiarEstado(db, p.id, 'entregado');
  const pagado = pedidos.cambiarEstado(db, p.id, 'pagado');
  assert.ok(pagado.pagadoEn);
});

test('rechaza pedidos invalidos', () => {
  const { db, plato } = escenario();
  assert.throws(() => pedidos.crearPedido(db, { mesa: 1, items: [] }, 1), /al menos un plato/);
  assert.throws(() => pedidos.crearPedido(db, { mesa: 1, items: [{ platoId: plato.id, cantidad: 0 }] }, 1), /cantidad/);
  assert.throws(() => pedidos.crearPedido(db, { mesa: 1, items: [{ platoId: 99, cantidad: 1 }] }, 1), /no existe/);
});
