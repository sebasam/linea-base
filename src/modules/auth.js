'use strict';
const crypto = require('crypto');
const { ErrorSigr } = require('../errores');

const ROLES = ['cliente', 'mesero', 'administrador'];

function cifrar(clave, sal) {
  return crypto.scryptSync(clave, sal, 32).toString('hex');
}

function registrar(db, { nombre, email, clave, rol = 'cliente' }) {
  if (!nombre || !email || !clave) throw new ErrorSigr('Nombre, correo y clave son obligatorios.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new ErrorSigr('El correo no es valido.');
  if (clave.length < 8) throw new ErrorSigr('La clave debe tener al menos 8 caracteres.');
  if (!ROLES.includes(rol)) throw new ErrorSigr('Rol no permitido.');
  if (db.datos.usuarios.some((u) => u.email === email)) throw new ErrorSigr('El correo ya esta registrado.', 409);
  const sal = crypto.randomBytes(16).toString('hex');
  const usuario = { id: db.siguienteId('usuarios'), nombre, email, rol, sal, hash: cifrar(clave, sal) };
  db.datos.usuarios.push(usuario);
  db.guardar();
  return { id: usuario.id, nombre, email, rol };
}

function iniciarSesion(db, sesiones, { email, clave }) {
  const u = db.datos.usuarios.find((x) => x.email === email);
  if (!u || cifrar(clave || '', u.sal) !== u.hash) throw new ErrorSigr('Credenciales invalidas.', 401);
  const token = crypto.randomBytes(24).toString('hex');
  sesiones.set(token, { id: u.id, nombre: u.nombre, rol: u.rol });
  return { token, usuario: { id: u.id, nombre: u.nombre, rol: u.rol } };
}

function exigirRol(usuario, ...roles) {
  if (!usuario) throw new ErrorSigr('Debe iniciar sesion.', 401);
  if (!roles.includes(usuario.rol)) throw new ErrorSigr('No tiene permiso para esta accion.', 403);
}

module.exports = { ROLES, registrar, iniciarSesion, exigirRol };
