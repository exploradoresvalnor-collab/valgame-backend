# Documentación del Proyecto: valgame-backend

## Estado Actual
- El servidor está corriendo correctamente con Nodemon y ts-node.
- Se han configurado las rutas de autenticación (`/register` y `/login`) usando Express, Zod y Mongoose.
- El archivo `.env` contiene las variables necesarias para la conexión a MongoDB, JWT y CORS.
- El modelo `User` está definido en `src/models/User.ts` con todos los campos requeridos.
- Se han instalado las dependencias y tipos necesarios para TypeScript y desarrollo.

## Estructura del Proyecto

A continuación, se detalla la arquitectura de carpetas y la responsabilidad de cada componente clave del backend.

```text
valgame-backend/
├── .env                # Fichero de variables de entorno. Contiene datos sensibles como claves de API y configuración de la base de datos. NO debe ser versionado en Git.
├── package.json        # Manifiesto del proyecto: lista de dependencias (Express, Mongoose, etc.) y scripts (dev, build, start).
├── tsconfig.json       # Archivo de configuración para el compilador de TypeScript. Define cómo se transpila el código de .ts a .js.
├── DOCUMENTACION.md    # Este mismo archivo de documentación.
├── src/
│   ├── app.ts          # Punto de entrada principal de la aplicación. Configura el servidor Express, los middlewares (seguridad, CORS) y registra todas las rutas de la API.
│   ├── config/
│   │   ├── db.ts       # Contiene la lógica para establecer la conexión con la base de datos MongoDB usando Mongoose.
│   │   └── mailer.ts   # Configura 'nodemailer' para el envío de correos transaccionales (ej. verificación de cuenta).
│   ├── middlewares/
│   │   └── auth.ts     # Middleware de autenticación. Protege las rutas verificando la validez del JSON Web Token (JWT) enviado en las cabeceras.
│   ├── models/         # Define la estructura de los datos. Cada archivo corresponde a un "Schema" de Mongoose que se mapea a una colección en MongoDB.
│   │   ├── User.ts
│   │   ├── Equipment.ts
│   │   ├── Consumable.ts
│   │   ├── Dungeon.ts
│   │   └── ... (y todos los demás modelos de datos)
│   └── routes/         # Define los endpoints (URLs) de la API. Cada archivo agrupa las rutas para un recurso específico (usuarios, ítems, etc.).
│       ├── auth.routes.ts
│       ├── equipment.routes.ts
│       ├── consumables.routes.ts
│       ├── dungeons.routes.ts
│       └── ... (y todas las demás rutas)
└── dist/               # Carpeta de distribución. Contiene el código JavaScript compilado que se genera automáticamente al ejecutar `npm run build`. Este es el código que se ejecuta en producción.
```

## Glosario de Términos
- **Usuario (User)**: Entidad principal que representa a cada persona registrada en la plataforma.
- **email**: Correo electrónico del usuario.
- **username**: Nombre de usuario único.
- **passwordHash**: Contraseña cifrada del usuario.
- **val**: Valor numérico asociado al usuario (definición específica según lógica de negocio).
- **boletos**: Cantidad de boletos que posee el usuario.
- **evo**: Puntos o nivel de evolución del usuario.
- **minadoTotal**: Total minado por el usuario.
- **invocaciones**: Número de invocaciones realizadas.
- **evoluciones**: Número de evoluciones realizadas.
- **boletosDiarios**: Boletos obtenidos diariamente.
- **ultimoReinicio**: Fecha del último reinicio de datos.
- **personajeActivoId**: ID del personaje activo del usuario.
- **personajes**: Lista de personajes asociados al usuario.
  - **personajeId**: Identificador único del personaje.
  - **rango**: Rango del personaje (D, C, B, A, S, SS, SSS).
  - **nivel**: Nivel actual del personaje.
  - **etapa**: Etapa del personaje (1, 2, 3).
  - **progreso**: Progreso actual del personaje.
  - **ultimoMinado**: Fecha del último minado realizado por el personaje.
  - **stats**: Estadísticas del personaje (atk, vida, defensa).
- **fechaRegistro**: Fecha de registro del usuario.
- **ultimaActualizacion**: Fecha de la última actualización de datos.


## Endpoints por módulo

### Usuarios
- **GET /api/users**: Listar todos los usuarios
- **GET /api/users/:id**: Consultar usuario por ID
- **POST /api/users**: Registrar nuevo usuario
- **PUT /api/users/:id**: Actualizar usuario
- **DELETE /api/users/:id**: Eliminar usuario

### Personajes base
- **GET /api/base-characters**: Listar todos los personajes base

### Categorías
- **GET /api/categories**: Listar todas las categorías

### Ítems
- **GET /api/items**: Listar todos los ítems

### Paquetes
- **GET /api/packages**: Listar todos los paquetes

### Asignación de paquetes a usuario
**POST /api/user-packages/por-correo**: Listar paquetes de un usuario por correo electrónico

### Configuración del juego
- **GET /api/configuracion-juego**: Consultar configuración del juego

### Requisitos de nivel
- **GET /api/requisitos-nivel**: Listar requisitos de nivel

### Eventos

## Ejemplo de solicitud POST para consultar paquetes por correo
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Descripción:**
Este endpoint permite consultar los paquetes asignados a un usuario usando su correo electrónico. Es útil cuando no se conoce el userId y se desea obtener los paquetes directamente por el email del usuario.

### Ejemplo de llamada con curl
```bash
curl -X POST http://localhost:8080/api/user-packages/por-correo \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@ejemplo.com"}'
```

### Ejemplo de llamada GET por userId
```bash
curl -X GET http://localhost:8080/api/user-packages/ID_DEL_USUARIO
```
- **GET /api/eventos**: Listar eventos

### Minado (playerstats)
- **POST /api/player-stats**: Registrar sesión de minado
- **GET /api/player-stats/usuario/:userId**: Consultar minados por usuario
- **GET /api/player-stats/personaje/:personajeId**: Consultar minados por personaje

---

## Actualizaciones realizadas

- Se crearon modelos y rutas para todas las colecciones estáticas y dinámicas del juego.
- Se corrigieron nombres de colecciones para coincidir con MongoDB (`categorias`, `paquetes`, `personajes_base`, `configuracion_juego`, `requisitos_nivel`, `eventos`, `playerstats`).
- Se agregaron endpoints POST y GET para registrar y consultar minados.
- Se crearon endpoints para asignar y quitar paquetes a usuarios.
- Se revisaron y conectaron correctamente los modelos y rutas.
- Se documentaron todos los endpoints y cambios realizados.

---

## Comandos usados y acciones

- Se usaron comandos para crear archivos de modelos y rutas:
  - Modelos: `PlayerStats`, `UserPackage`, `BaseCharacter`, `Category`, `Item`, `Package`, `GameSetting`, `LevelRequirement`, `Event`
  - Rutas: `/api/player-stats`, `/api/user-packages`, `/api/base-characters`, `/api/categories`, `/api/items`, `/api/packages`, `/api/configuracion-juego`, `/api/requisitos-nivel`, `/api/eventos`
- Se actualizaron los nombres de las colecciones y rutas para mantener consistencia.
- Se revisó la conexión entre modelos y rutas para asegurar funcionalidad.
- Se eliminaron duplicados y se dejaron solo los modelos funcionales.

---

## Ejemplo de solicitud POST para minado
```json
{
  "userId": "ID_DEL_USUARIO",
  "personajeId": "ID_DEL_PERSONAJE",
  "cantidadMinada": 100,
  "fecha": "2025-08-11T12:00:00Z",
  "valAcumulado": 500,
  "fuente": "mineria"
}
```

## Ejemplo de solicitud POST para agregar paquete
```json
{
  "userId": "ID_DEL_USUARIO",
  "paqueteId": "ID_DEL_PAQUETE"
}
```

## Ejemplo de solicitud POST para quitar paquete
```json
{
  "userId": "ID_DEL_USUARIO",
  "paqueteId": "ID_DEL_PAQUETE"
}
```

---

*Actualizado: 11 de agosto de 2025*
