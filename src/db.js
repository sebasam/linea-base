'use strict';
const fs = require('fs');

/**
 * Almacen de datos en memoria con persistencia opcional en un archivo JSON.
 * Cada coleccion es un arreglo; los identificadores son enteros incrementales.
 */
function crearDb(archivo) {
  let datos = {
    usuarios: [], categorias: [], platos: [], pedidos: [],
    reservas: [], cierres: [], secuencias: {},
  };
  if (archivo && fs.existsSync(archivo)) {
    datos = JSON.parse(fs.readFileSync(archivo, 'utf8'));
  }
  return {
    datos,
    siguienteId(coleccion) {
      datos.secuencias[coleccion] = (datos.secuencias[coleccion] || 0) + 1;
      return datos.secuencias[coleccion];
    },
    guardar() {
      if (archivo) fs.writeFileSync(archivo, JSON.stringify(datos, null, 2));
    },
  };
}

module.exports = { crearDb };
