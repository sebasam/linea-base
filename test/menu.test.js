'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { crearDb } = require('../src/db');
const menu = require('../src/modules/menu');

function conCategoria() {
  const db = crearDb();
  const cat = menu.crearCategoria(db, { nombre: 'Bebidas' });
  return { db, cat };
}

test('CRUD de platos', () => {
  const { db, cat } = conCategoria();
  const p = menu.crearPlato(db, { nombre: 'Limonada', precio: 6000, categoriaId: cat.id });
  assert.strictEqual(menu.listarMenu(db)[0].platos.length, 1);
  menu.actualizarPlato(db, p.id, { precio: 6500 });
  assert.strictEqual(menu.obtenerPlato(db, p.id).precio, 6500);
  menu.eliminarPlato(db, p.id);
  assert.throws(() => menu.obtenerPlato(db, p.id), /no existe/);
});

test('valida precio y categoria', () => {
  const { db, cat } = conCategoria();
  assert.throws(() => menu.crearPlato(db, { nombre: 'X', precio: -1, categoriaId: cat.id }), /precio/);
  assert.throws(() => menu.crearPlato(db, { nombre: 'X', precio: 10, categoriaId: 99 }), /categoria/);
});

test('no permite categorias repetidas', () => {
  const { db } = conCategoria();
  assert.throws(() => menu.crearCategoria(db, { nombre: 'bebidas' }), /ya existe/);
});
