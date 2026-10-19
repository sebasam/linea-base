'use strict';

class ErrorSigr extends Error {
  constructor(mensaje, estado = 400) {
    super(mensaje);
    this.estado = estado;
  }
}

module.exports = { ErrorSigr };
