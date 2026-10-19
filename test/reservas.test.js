'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { crearDb } = require('../src/db');
const reservas = require('../src/modules/reservas');

const base = { cliente: 'Luis', mesa: 4, fecha: '2026-11-20', hora: '19:00', personas: 4 };

test('crea una reserva y marca la mesa como ocupada', () => {
  const db = crearDb();
  reservas.crearReserva(db, base);
  assert.ok(!reservas.disponibilidad(db, '2026-11-20', '19:30').includes(4));
  assert.ok(reservas.disponibilidad(db, '2026-11-20', '22:00').includes(4));
});

test('rechaza una reserva que choca en horario', () => {
  const db = crearDb();
  reservas.crearReserva(db, base);
  assert.throws(() => reservas.crearReserva(db, { ...base, cliente: 'Eva', hora: '20:00' }), /ya esta reservada/);
});

test('cancelar libera la mesa', () => {
  const db = crearDb();
  const r = reservas.crearReserva(db, base);
  reservas.cancelarReserva(db, r.id);
  assert.ok(reservas.disponibilidad(db, '2026-11-20', '19:00').includes(4));
});

test('valida formato de fecha, hora y personas', () => {
  const db = crearDb();
  assert.throws(() => reservas.crearReserva(db, { ...base, hora: '7pm' }), /HH:MM/);
  assert.throws(() => reservas.crearReserva(db, { ...base, fecha: '20/11/2026' }), /AAAA-MM-DD/);
  assert.throws(() => reservas.crearReserva(db, { ...base, personas: 0 }), /personas/);
});
