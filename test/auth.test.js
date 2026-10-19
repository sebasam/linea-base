'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { crearDb } = require('../src/db');
const auth = require('../src/modules/auth');

test('registra un usuario y no expone la clave', () => {
  const db = crearDb();
  const u = auth.registrar(db, { nombre: 'Ana', email: 'ana@x.co', clave: 'Clave12345' });
  assert.strictEqual(u.rol, 'cliente');
  assert.strictEqual(u.hash, undefined);
});

test('rechaza correo repetido y clave corta', () => {
  const db = crearDb();
  auth.registrar(db, { nombre: 'Ana', email: 'ana@x.co', clave: 'Clave12345' });
  assert.throws(() => auth.registrar(db, { nombre: 'Otra', email: 'ana@x.co', clave: 'Clave12345' }), /ya esta registrado/);
  assert.throws(() => auth.registrar(db, { nombre: 'B', email: 'b@x.co', clave: '123' }), /al menos 8/);
});

test('inicio de sesion correcto e incorrecto', () => {
  const db = crearDb();
  const sesiones = new Map();
  auth.registrar(db, { nombre: 'Ana', email: 'ana@x.co', clave: 'Clave12345', rol: 'mesero' });
  const r = auth.iniciarSesion(db, sesiones, { email: 'ana@x.co', clave: 'Clave12345' });
  assert.ok(sesiones.has(r.token));
  assert.throws(() => auth.iniciarSesion(db, sesiones, { email: 'ana@x.co', clave: 'mala' }), /Credenciales/);
});

test('exigirRol bloquea roles no permitidos', () => {
  assert.throws(() => auth.exigirRol({ rol: 'cliente' }, 'administrador'), /permiso/);
  assert.doesNotThrow(() => auth.exigirRol({ rol: 'administrador' }, 'administrador'));
});
