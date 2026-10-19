# Convenciones del proyecto

## Estructura de carpetas
```
sigr/
├── src/
│   ├── modules/      módulos de negocio (auth, menu, pedidos, reservas, caja)
│   ├── app.js        rutas y control de acceso
│   ├── server.js     servidor HTTP
│   ├── db.js         almacén de datos
│   ├── errores.js    error de negocio con código HTTP
│   └── seed.js       datos iniciales
├── test/             pruebas automáticas (*.test.js)
├── docs/             documentación técnica
├── data/             archivo de datos (ignorado por Git)
├── README.md
├── CHANGELOG.md
└── LICENSE.txt
```

## Código
- JavaScript con `'use strict'`, módulos CommonJS, indentación de 2 espacios.
- Nombres de funciones y variables en español, en `camelCase`.
- Los errores de negocio se lanzan con `ErrorSigr` y un código HTTP.
- Toda función nueva de un módulo lleva al menos una prueba en `test/`.

## Git
- Rama estable: `main`. El trabajo nuevo se hace en ramas `feature/<tema>` o `fix/<tema>` y se fusiona por revisión.
- Mensajes de commit con el formato `tipo(ámbito): descripción`, donde el tipo es `feat`, `fix`, `test`, `docs` o `chore`.
- Las líneas base se marcan con etiquetas anotadas `vX.Y.Z-linea-base`.
- Cambios posteriores a la línea base requieren una solicitud de cambio aprobada (ver informe del taller).
