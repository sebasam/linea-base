'use strict';
const { ErrorSigr } = require('../errores');
const { obtenerPlato } = require('./menu');

const ESTADOS = ['recibido', 'en_preparacion', 'listo', 'entregado', 'pagado'];

function crearPedido(db, { mesa, items }, meseroId, ahora = () => new Date()) {
  if (!Number.isInteger(mesa) || mesa < 1) throw new ErrorSigr('La mesa debe ser un numero entero positivo.');
  if (!Array.isArray(items) || items.length === 0) throw new ErrorSigr('El pedido debe tener al menos un plato.');
  let total = 0;
  const lineas = items.map(({ platoId, cantidad }) => {
    if (!Number.isInteger(cantidad) || cantidad < 1) throw new ErrorSigr('La cantidad debe ser un entero positivo.');
    const plato = obtenerPlato(db, platoId);
    if (!plato.disponible) throw new ErrorSigr(`El plato ${plato.nombre} no esta disponible.`, 409);
    total += plato.precio * cantidad;
    return { platoId, nombre: plato.nombre, precio: plato.precio, cantidad };
  });
  const pedido = { id: db.siguienteId('pedidos'), mesa, items: lineas, total, estado: 'recibido',
    meseroId, creadoEn: ahora().toISOString(), pagadoEn: null };
  db.datos.pedidos.push(pedido);
  db.guardar();
  return pedido;
}

function cambiarEstado(db, id, estado, ahora = () => new Date()) {
  const pedido = db.datos.pedidos.find((p) => p.id === id);
  if (!pedido) throw new ErrorSigr('El pedido no existe.', 404);
  const actual = ESTADOS.indexOf(pedido.estado);
  const nuevo = ESTADOS.indexOf(estado);
  if (nuevo === -1) throw new ErrorSigr('Estado no valido.');
  if (nuevo !== actual + 1) throw new ErrorSigr(`No se puede pasar de ${pedido.estado} a ${estado}.`, 409);
  pedido.estado = estado;
  if (estado === 'pagado') pedido.pagadoEn = ahora().toISOString();
  db.guardar();
  return pedido;
}

function listarPedidos(db, estado) {
  return db.datos.pedidos.filter((p) => !estado || p.estado === estado);
}

module.exports = { ESTADOS, crearPedido, cambiarEstado, listarPedidos };
