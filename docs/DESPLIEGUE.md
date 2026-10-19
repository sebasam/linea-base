# Manual de despliegue

## Requisitos del servidor
- Node.js 21 o superior.
- Git.
- Un puerto TCP libre (por defecto 3000).

## Pasos
1. Clonar el repositorio y ubicarse en la etiqueta de la línea base:
   ```bash
   git clone https://github.com/equipoX/sigr.git
   cd sigr
   git checkout v1.0.0-linea-base
   ```
2. Ejecutar las pruebas antes de desplegar:
   ```bash
   npm test
   ```
3. Crear los datos iniciales (solo la primera vez):
   ```bash
   npm run seed
   ```
4. Iniciar el servicio:
   ```bash
   PORT=3000 SIGR_DB=/var/sigr/db.json npm start
   ```
5. Verificar que responde:
   ```bash
   curl http://localhost:3000/salud
   ```
   Respuesta esperada: `{"estado":"ok","version":"1.0.0"}`.

## Variables de entorno
| Variable | Uso | Valor por defecto |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `SIGR_DB` | Ruta del archivo de datos | `data/db.json` |

## Copias de seguridad
Copiar periódicamente el archivo indicado en `SIGR_DB`.

## Actualización
Detener el servicio, ejecutar `git fetch --tags`, cambiar a la etiqueta de la nueva versión, correr `npm test` y reiniciar.
