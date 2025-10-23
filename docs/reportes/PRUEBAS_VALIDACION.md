# GUÍA DE PRUEBAS Y VALIDACIÓN - EXPLORADORES DE VALNOR

## PREPARACIÓN DEL ENTORNO

### 1. Configuración del Entorno de Pruebas
```bash
# Instalar todas las dependencias necesarias
npm install

# Verificar versiones de dependencias críticas
npm list mongoose socket.io express

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Inicializar la base de datos
npm run seed
```

2. **Iniciar el Servidor**
```bash
npm run dev
```

## Flujo de Pruebas

### 1. Sistema de Onboarding y Autenticación

1. **Registro de Usuario**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "username": "TestPlayer"
  }'
```
*Resultado Esperado:*
- Status 201
- Token JWT
- Datos del usuario con personaje inicial
- Paquete del Pionero asignado

2. **Login**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```
*Resultado Esperado:*
- Status 200
- Token JWT válido

### 2. Sistema de Inventario y Items

1. **Verificar Inventario Inicial**
```bash
curl -X GET http://localhost:3000/api/users/me/inventory \
  -H "Authorization: Bearer TU_TOKEN"
```
*Resultado Esperado:*
- Poción de Vida inicial
- Equipamiento básico
- Límites de inventario correctos

2. **Usar Consumible**
```bash
curl -X POST http://localhost:3000/api/items/use/68dc525adb5c735854b5659d \
  -H "Authorization: Bearer TU_TOKEN"
```
*Resultado Esperado:*
- Reducción de usos_restantes
- Efecto aplicado
- Notificación de usos restantes

### 3. Sistema de Personajes y Supervivencia

1. **Obtener Estado del Personaje**
```bash
curl -X GET http://localhost:3000/api/characters/TU_CHARACTER_ID \
  -H "Authorization: Bearer TU_TOKEN"
```
*Resultado Esperado:*
- Stats base correctos
- Nivel inicial 1
- Rango D

2. **Curar Personaje**
```bash
curl -X POST http://localhost:3000/api/characters/TU_CHARACTER_ID/heal \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"amount": 50}'
```
*Resultado Esperado:*
- HP recuperada
- Costo en VAL deducido
- Estado actualizado

3. **Revivir Personaje**
```bash
curl -X POST http://localhost:3000/api/characters/TU_CHARACTER_ID/revive \
  -H "Authorization: Bearer TU_TOKEN"
```
*Resultado Esperado:*
- Personaje revivido
- Penalizaciones aplicadas
- Costo en VAL deducido

### 4. PRUEBAS EXHAUSTIVAS DEL MARKETPLACE

#### 4.1 Creación de Listings

1. **Crear Listing de Personaje**
```bash
curl -X POST http://localhost:3000/api/marketplace/listings \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "ID_DEL_PERSONAJE",
    "precio": 1000,
    "destacar": true
  }'
```
*Validaciones:*
- [ ] Listing creado correctamente
- [ ] Personaje removido del inventario del vendedor
- [ ] No se puede listar personaje activo
- [ ] Metadata incluye stats, nivel y rango
- [ ] Impuesto del 5% calculado
- [ ] Costo de destacado aplicado si corresponde

2. **Crear Listing de Equipamiento**
```bash
curl -X POST http://localhost:3000/api/marketplace/listings \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "ID_DEL_EQUIPO",
    "precio": 500,
    "destacar": false
  }'
```
*Validaciones:*
- [ ] Listing creado correctamente
- [ ] Equipo removido del inventario
- [ ] Metadata incluye stats del equipo
- [ ] Precio dentro de rangos permitidos

3. **Crear Listing de Consumible**
```bash
curl -X POST http://localhost:3000/api/marketplace/listings \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "ID_DEL_CONSUMIBLE",
    "precio": 100,
    "destacar": false
  }'
```
*Validaciones:*
- [ ] Listing creado correctamente
- [ ] Consumible removido del inventario
- [ ] Metadata incluye usos restantes
- [ ] Precio acorde a usos restantes

#### 4.2 Compra de Items

1. **Comprar Personaje**
```bash
curl -X POST http://localhost:3000/api/marketplace/listings/ID_LISTING/buy \
  -H "Authorization: Bearer TU_TOKEN"
```
*Validaciones:*
- [ ] Fondos suficientes verificados
- [ ] VAL deducido del comprador
- [ ] VAL (menos impuesto) agregado al vendedor
- [ ] Personaje transferido correctamente
- [ ] Stats y nivel preservados
- [ ] Notificaciones enviadas a ambas partes

2. **Comprar Equipamiento**
```bash
curl -X POST http://localhost:3000/api/marketplace/listings/ID_LISTING/buy \
  -H "Authorization: Bearer TU_TOKEN"
```
*Validaciones:*
- [ ] Espacio en inventario verificado
- [ ] Transacción de VAL correcta
- [ ] Equipo agregado al inventario del comprador
- [ ] Listing marcado como vendido

3. **Comprar Consumible**
```bash
curl -X POST http://localhost:3000/api/marketplace/listings/ID_LISTING/buy \
  -H "Authorization: Bearer TU_TOKEN"
```
*Validaciones:*
- [ ] Espacio para consumibles verificado
- [ ] Usos restantes transferidos correctamente
- [ ] Transacción monetaria completada

#### 4.3 Escenarios de Error

1. **Validaciones de Compra**
- [ ] Intento de compra propia
- [ ] Fondos insuficientes
- [ ] Inventario lleno
- [ ] Item ya vendido
- [ ] Listing expirado

2. **Validaciones de Listado**
- [ ] Item no existe
- [ ] Item no es propiedad del vendedor
- [ ] Precio fuera de rango
- [ ] Tipo de item inválido

#### 4.4 Pruebas de Concurrencia

1. **Compras Simultáneas**
```bash
# Script para simular múltiples compradores
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/marketplace/listings/ID_LISTING/buy \
    -H "Authorization: Bearer TOKEN_USUARIO_$i" &
done
```
*Validaciones:*
- [ ] Solo una compra exitosa
- [ ] Transacciones atómicas
- [ ] Sin duplicación de items
- [ ] Estado consistente de inventarios

2. **Actualizaciones en Tiempo Real**
- [ ] Notificaciones WebSocket enviadas
- [ ] UI actualizada para todos los usuarios
- [ ] Estado de listings sincronizado

2. **Buscar Listings**
```bash
curl -X GET "http://localhost:3000/api/marketplace/listings?type=equipamiento&precioMax=1000" \
  -H "Authorization: Bearer TU_TOKEN"
```
*Resultado Esperado:*
- Lista paginada de listings
- Filtros aplicados correctamente
- Destacados primero

3. **Comprar Item**
```bash
curl -X POST http://localhost:3000/api/marketplace/listings/ID_LISTING/buy \
  -H "Authorization: Bearer TU_TOKEN"
```
*Resultado Esperado:*
- Transacción completada
- VAL transferido
- Item movido al nuevo dueño
- Impuesto aplicado

### 5. Sistema de Evolución

1. **Verificar Requisitos**
```bash
curl -X GET http://localhost:3000/api/characters/TU_CHARACTER_ID/evolution-requirements \
  -H "Authorization: Bearer TU_TOKEN"
```
*Resultado Esperado:*
- Lista de requisitos
- Costos de evolución
- Estado actual vs requerido

2. **Evolucionar Personaje**
```bash
curl -X POST http://localhost:3000/api/characters/TU_CHARACTER_ID/evolve \
  -H "Authorization: Bearer TU_TOKEN"
```
*Resultado Esperado:*
- Evolución exitosa
- Stats actualizados
- Recursos consumidos

## Pruebas de Rate Limiting

### 1. Prueba de Límites de Autenticación
```bash
# Ejecutar script para probar rate limiting
for i in {1..6}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "wrongpass"
    }'
  sleep 1
done
```
*Resultado Esperado:*
- 5 intentos permitidos
- 6to intento bloqueado (429 Too Many Requests)

### 2. Prueba de Límites de API
```bash
# Ejecutar múltiples requests rápidos
for i in {1..31}; do
  curl -X GET http://localhost:3000/api/marketplace/listings \
    -H "Authorization: Bearer TU_TOKEN"
  sleep 0.1
done
```
*Resultado Esperado:*
- 30 requests exitosos por minuto
- Requests adicionales bloqueados

## Flujo de Prueba Completo

1. **Inicio**
   - Registrar usuario nuevo
   - Verificar paquete inicial
   - Comprobar personaje base

2. **Ciclo Básico**
   - Usar consumibles
   - Curar personaje
   - Simular muerte y revivir
   - Verificar penalizaciones

3. **Economía**
   - Crear listing en marketplace
   - Buscar items
   - Realizar transacción
   - Verificar impuestos

4. **Progresión**
   - Subir de nivel
   - Cumplir requisitos
   - Evolucionar personaje
   - Verificar mejoras

5. **Seguridad**
   - Probar rate limits
   - Verificar validaciones
   - Comprobar manejo de errores

## VALIDACIONES FINALES Y MONITOREO

### 1. Validación de Integridad de Datos

1. **Verificación de Inventarios**
```bash
# Consultar inventario del vendedor
db.users.findOne(
  { _id: ObjectId("SELLER_ID") },
  { inventarioEquipamiento: 1, inventarioConsumibles: 1, personajes: 1 }
)

# Consultar inventario del comprador
db.users.findOne(
  { _id: ObjectId("BUYER_ID") },
  { inventarioEquipamiento: 1, inventarioConsumibles: 1, personajes: 1 }
)
```

2. **Verificación de Transacciones**
```bash
# Verificar balance de VAL
db.users.find(
  { _id: { $in: [ObjectId("SELLER_ID"), ObjectId("BUYER_ID")] } },
  { val: 1, username: 1 }
)

# Verificar historial de transacciones
db.transactions.find(
  { $or: [
    { sellerId: ObjectId("SELLER_ID") },
    { buyerId: ObjectId("BUYER_ID") }
  ]}
)
```

3. **Verificación de Listings**
```bash
# Verificar estado de listings
db.listings.find(
  { estado: "activo" },
  { itemId: 1, sellerId: 1, precio: 1, estado: 1 }
)
```

### 2. Monitoreo de Rendimiento

1. **Métricas de Base de Datos**
- [ ] Tiempo de respuesta de queries
- [ ] Índices utilizados
- [ ] Tamaño de colecciones

2. **Métricas de API**
- [ ] Tiempo de respuesta de endpoints
- [ ] Tasa de errores
- [ ] Uso de memoria

3. **Métricas de WebSocket**
- [ ] Conexiones activas
- [ ] Latencia de mensajes
- [ ] Tasa de reconexiones

### 3. Variables de Entorno y Configuración

1. **Variables Requeridas**
```env
MONGODB_URI=mongodb://localhost:27017/valgame
JWT_SECRET=tu_secret_key
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

2. **Variables de Testing**
```env
NODE_ENV=test
TEST_MONGODB_URI=mongodb://localhost:27017/valgame_test
TEST_JWT_SECRET=test_secret_key
```

### 4. Comandos de Testing

```bash
# Ejecutar todos los tests
npm run test:e2e

# Ejecutar tests específicos del marketplace
npm run test:e2e -- -t "marketplace"

# Ejecutar tests con coverage
npm run test:coverage
```

### 5. Logs y Depuración

1. **Logs de Transacciones**
```bash
tail -f logs/transactions.log
```

2. **Logs de Errores**
```bash
tail -f logs/error.log
```

3. **Logs de WebSocket**
```bash
tail -f logs/websocket.log
```

### 6. Recuperación y Backup

1. **Backup de Base de Datos**
```bash
mongodump --db valgame --out ./backup
```

2. **Restauración**
```bash
mongorestore --db valgame ./backup/valgame
```

3. **Limpieza de Datos**
```bash
# Limpiar listings expirados
npm run cleanup:listings

# Resetear estado de pruebas
npm run reset:test-data
```

2. **Códigos de Error**
   - 400: Error de validación
   - 401: No autorizado
   - 403: Prohibido
   - 404: No encontrado
   - 429: Demasiados intentos

3. **Monitoreo**
   - Revisar logs para errores
   - Verificar métricas de rate limiting
   - Comprobar integridad de datos

4. **Herramientas Recomendadas**
   - Postman/Insomnia para pruebas manuales
   - Jest para pruebas automatizadas
   - MongoDB Compass para verificar datos