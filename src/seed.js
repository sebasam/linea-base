'use strict';
// Crea los usuarios iniciales (administrador y mesero) y un menu de ejemplo.
const path = require('path');
const { crearDb } = require('./db');
const auth = require('./modules/auth');
const menu = require('./modules/menu');

const db = crearDb(process.env.SIGR_DB || path.join(__dirname, '..', 'data', 'db.json'));
if (db.datos.usuarios.length === 0) {
  auth.registrar(db, { nombre: 'Administrador', email: 'admin@sigr.local', clave: 'Admin12345', rol: 'administrador' });
  auth.registrar(db, { nombre: 'Mesero 1', email: 'mesero@sigr.local', clave: 'Mesero12345', rol: 'mesero' });
  const entradas = menu.crearCategoria(db, { nombre: 'Entradas' });
  const fuertes = menu.crearCategoria(db, { nombre: 'Platos fuertes' });
  menu.crearPlato(db, { nombre: 'Empanadas', precio: 8000, categoriaId: entradas.id });
  menu.crearPlato(db, { nombre: 'Bandeja paisa', precio: 32000, categoriaId: fuertes.id });
  console.log('Datos iniciales creados.');
} else {
  console.log('La base de datos ya tiene informacion; no se modifico.');
}
