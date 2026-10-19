# Estructura de datos

La línea base guarda la información en un archivo JSON (`data/db.json`) con las colecciones siguientes. Cada documento tiene un `id` entero incremental generado por la colección `secuencias`.

| Colección | Campos principales |
|---|---|
| `usuarios` | `id`, `nombre`, `email` (único), `rol` (`cliente`, `mesero`, `administrador`), `sal`, `hash` |
| `categorias` | `id`, `nombre` (único sin distinguir mayúsculas) |
| `platos` | `id`, `nombre`, `precio` (> 0), `categoriaId`, `disponible` |
| `pedidos` | `id`, `mesa`, `items[]` (`platoId`, `nombre`, `precio`, `cantidad`), `total`, `estado`, `meseroId`, `creadoEn`, `pagadoEn` |
| `reservas` | `id`, `cliente`, `mesa` (1 a 10), `fecha` (AAAA-MM-DD), `hora` (HH:MM), `personas` (1 a 12), `estado` (`activa`, `cancelada`) |
| `cierres` | `id`, `fecha` (único), `pedidos`, `total`, `platosVendidos`, `pedidosSinPagar`, `responsable`, `cerradoEn` |
| `secuencias` | contador por colección |

## Relaciones

- `platos.categoriaId` referencia `categorias.id`.
- `pedidos.items[].platoId` referencia `platos.id`; el nombre y el precio se copian al pedido para conservar el valor vendido aunque el plato cambie después.
- `pedidos.meseroId` referencia `usuarios.id`.

## Reglas de negocio

- Los estados de un pedido avanzan en orden: `recibido`, `en_preparacion`, `listo`, `entregado`, `pagado`.
- Una mesa no puede tener dos reservas activas con menos de 120 minutos de diferencia el mismo día.
- Solo existe un cierre de caja por fecha.
