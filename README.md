# SIGR - Sistema Integral de Gestión de Restaurante

Aplicación web (API REST) para gestionar pedidos, reservas, menús, control de caja y reportes de ventas de un restaurante. Esta versión corresponde a la **línea base 1.0.0** del código fuente (etiqueta `v1.0.0-linea-base`).

## Módulos incluidos

| Módulo | Archivo | Descripción |
|---|---|---|
| Autenticación | `src/modules/auth.js` | Registro, inicio de sesión y control de acceso por rol (cliente, mesero, administrador). |
| Menú digital | `src/modules/menu.js` | CRUD de categorías y platos. |
| Pedidos | `src/modules/pedidos.js` | Registro y seguimiento del estado de cada pedido. |
| Reservas | `src/modules/reservas.js` | Reservas por fecha y hora con control de disponibilidad de mesas. |
| Caja y reportes | `src/modules/caja.js` | Reporte diario de ventas y cierre de caja. |

## Requisitos

- Node.js 21 o superior (no se necesitan dependencias externas).
- Git.

## Cómo clonar y ejecutar

```bash
git clone https://github.com/equipoX/sigr.git
cd sigr
npm run seed     # crea usuarios y menú de ejemplo (opcional)
npm start        # inicia el servidor en http://localhost:3000
npm test         # ejecuta las pruebas automáticas
```

Usuarios creados por `npm run seed`: `admin@sigr.local` (clave `Admin12345`) y `mesero@sigr.local` (clave `Mesero12345`). **Cámbielos antes de cualquier uso real.**

## Resumen de la API

| Método y ruta | Rol requerido |
|---|---|
| `GET /salud` | Público |
| `POST /auth/registro`, `POST /auth/login` | Público |
| `GET /menu` | Público |
| `POST /menu/categorias`, `POST/PUT/DELETE /menu/platos` | Administrador |
| `POST /pedidos`, `GET /pedidos?estado=`, `PATCH /pedidos/:id/estado` | Mesero o administrador |
| `GET /reservas/disponibilidad?fecha=&hora=`, `POST /reservas`, `DELETE /reservas/:id` | Público |
| `GET /reportes/ventas?fecha=`, `POST /caja/cierre` | Administrador |

El seguimiento de pedidos se hace consultando `GET /pedidos?estado=`; esta versión no usa conexiones persistentes.

## Documentación adicional

- `docs/BASE_DE_DATOS.md`: estructura de datos.
- `docs/DESPLIEGUE.md`: manual de despliegue.
- `docs/CONVENCIONES.md`: estructura de carpetas, código y commits.
- `CHANGELOG.md`: historial de cambios incluidos en la línea base.

## Licencia

MIT (ver `LICENSE.txt`).
