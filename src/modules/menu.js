'use strict';
const { ErrorSigr } = require('../errores');

function crearCategoria(db, { nombre }) {
  if (!nombre) throw new ErrorSigr('El nombre de la categoria es obligatorio.');
  if (db.datos.categorias.some((c) => c.nombre.toLowerCase() === nombre.toLowerCase())) {
    throw new ErrorSigr('La categoria ya existe.', 409);
  }
  const cat = { id: db.siguienteId('categorias'), nombre };
  db.datos.categorias.push(cat);
  db.guardar();
  return cat;
}

function validarPlato({ nombre, precio, categoriaId }, db) {
  if (!nombre) throw new ErrorSigr('El nombre del plato es obligatorio.');
  if (typeof precio !== 'number' || !(precio > 0)) throw new ErrorSigr('El precio debe ser un numero mayor que cero.');
  if (!db.datos.categorias.some((c) => c.id === categoriaId)) throw new ErrorSigr('La categoria no existe.', 404);
}

function crearPlato(db, entrada) {
  validarPlato(entrada, db);
  const plato = { id: db.siguienteId('platos'), nombre: entrada.nombre, precio: entrada.precio,
    categoriaId: entrada.categoriaId, disponible: true };
  db.datos.platos.push(plato);
  db.guardar();
  return plato;
}

function obtenerPlato(db, id) {
  const plato = db.datos.platos.find((p) => p.id === id);
  if (!plato) throw new ErrorSigr('El plato no existe.', 404);
  return plato;
}

function actualizarPlato(db, id, cambios) {
  const plato = obtenerPlato(db, id);
  const nuevo = { ...plato, ...cambios, id: plato.id };
  validarPlato(nuevo, db);
  Object.assign(plato, nuevo);
  db.guardar();
  return plato;
}

function eliminarPlato(db, id) {
  const plato = obtenerPlato(db, id);
  db.datos.platos = db.datos.platos.filter((p) => p.id !== plato.id);
  db.guardar();
}

function listarMenu(db) {
  return db.datos.categorias.map((c) => ({
    ...c,
    platos: db.datos.platos.filter((p) => p.categoriaId === c.id && p.disponible),
  }));
}

module.exports = { crearCategoria, crearPlato, obtenerPlato, actualizarPlato, eliminarPlato, listarMenu };
