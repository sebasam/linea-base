'use strict';
const { ErrorSigr } = require('../errores');

const TOTAL_MESAS = 10;
const DURACION_MIN = 120;

function aMinutos(hora) {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hora || '');
  if (!m) throw new ErrorSigr('La hora debe tener el formato HH:MM.');
  return Number(m[1]) * 60 + Number(m[2]);
}

function validarFecha(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || Number.isNaN(Date.parse(fecha))) {
    throw new ErrorSigr('La fecha debe tener el formato AAAA-MM-DD.');
  }
}

function chocan(a, b) {
  return Math.abs(aMinutos(a) - aMinutos(b)) < DURACION_MIN;
}

function mesasOcupadas(db, fecha, hora) {
  return db.datos.reservas
    .filter((r) => r.estado === 'activa' && r.fecha === fecha && chocan(r.hora, hora))
    .map((r) => r.mesa);
}

function disponibilidad(db, fecha, hora) {
  validarFecha(fecha);
  aMinutos(hora);
  const ocupadas = mesasOcupadas(db, fecha, hora);
  const libres = [];
  for (let m = 1; m <= TOTAL_MESAS; m += 1) if (!ocupadas.includes(m)) libres.push(m);
  return libres;
}

function crearReserva(db, { cliente, mesa, fecha, hora, personas }) {
  if (!cliente) throw new ErrorSigr('El nombre del cliente es obligatorio.');
  if (!Number.isInteger(personas) || personas < 1 || personas > 12) throw new ErrorSigr('El numero de personas debe estar entre 1 y 12.');
  if (!Number.isInteger(mesa) || mesa < 1 || mesa > TOTAL_MESAS) throw new ErrorSigr(`La mesa debe estar entre 1 y ${TOTAL_MESAS}.`);
  if (!disponibilidad(db, fecha, hora).includes(mesa)) throw new ErrorSigr('La mesa ya esta reservada en ese horario.', 409);
  const reserva = { id: db.siguienteId('reservas'), cliente, mesa, fecha, hora, personas, estado: 'activa' };
  db.datos.reservas.push(reserva);
  db.guardar();
  return reserva;
}

function cancelarReserva(db, id) {
  const r = db.datos.reservas.find((x) => x.id === id);
  if (!r) throw new ErrorSigr('La reserva no existe.', 404);
  r.estado = 'cancelada';
  db.guardar();
  return r;
}

module.exports = { TOTAL_MESAS, disponibilidad, crearReserva, cancelarReserva };
