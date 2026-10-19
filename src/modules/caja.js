'use strict';
const { ErrorSigr } = require('../errores');

function pedidosPagadosDelDia(db, fecha) {
  return db.datos.pedidos.filter((p) => p.estado === 'pagado' && p.pagadoEn && p.pagadoEn.slice(0, 10) === fecha);
}

function reporteVentas(db, fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) throw new ErrorSigr('La fecha debe tener el formato AAAA-MM-DD.');
  const pedidos = pedidosPagadosDelDia(db, fecha);
  const porPlato = {};
  for (const p of pedidos) {
    for (const i of p.items) porPlato[i.nombre] = (porPlato[i.nombre] || 0) + i.cantidad;
  }
  const total = pedidos.reduce((s, p) => s + p.total, 0);
  return { fecha, pedidos: pedidos.length, total, platosVendidos: porPlato };
}

function cierreCaja(db, fecha, responsable, ahora = () => new Date()) {
  const reporte = reporteVentas(db, fecha);
  if (db.datos.cierres.some((c) => c.fecha === fecha)) throw new ErrorSigr('La caja de esa fecha ya fue cerrada.', 409);
  const sinPagar = db.datos.pedidos.filter((p) => p.estado !== 'pagado' && p.creadoEn.slice(0, 10) === fecha).length;
  const cierre = { id: db.siguienteId('cierres'), ...reporte, pedidosSinPagar: sinPagar,
    responsable, cerradoEn: ahora().toISOString() };
  db.datos.cierres.push(cierre);
  db.guardar();
  return cierre;
}

module.exports = { reporteVentas, cierreCaja };
