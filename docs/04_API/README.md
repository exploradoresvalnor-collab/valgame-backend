# 🌐 API - REFERENCIA DE ENDPOINTS

Esta carpeta contiene la **documentación completa de la API REST** y sistemas de integración.

---

## 📄 Documentos en Esta Carpeta

### 1. 📚 Referencia Completa de API
**Archivo:** `../API_REFERENCE_COMPLETA.md` (en carpeta raíz docs/)  
**Lectura:** 40-50 minutos (referencia - no leer todo de una vez)  
**Contenido:**
- ⚙️ Configuración del sistema (Cookies httpOnly, Gmail SMTP)
- 🔐 Endpoints de autenticación (`/auth`) - **Actualizado nov 2025**
- 👤 Endpoints de usuarios (`/users`)
- 🎭 Endpoints de personajes (`/characters`) - **Con fórmulas dinámicas**
- 🎒 Endpoints de inventario (`/inventory`)
- 🏪 Endpoints de marketplace (`/marketplace`)
- 🏰 Endpoints de mazmorras (`/dungeons`)
- 📦 Endpoints de paquetes (`/packages`) - **Paquete Pionero actualizado**
- 🏆 Endpoints de ranking (`/rankings`) - **NUEVO**
- ⚡ WebSocket events

**✅ Estado:** Actualizado al 3 de noviembre de 2025 (incluye todos los cambios recientes)

**Cuándo usar:**
- Para conocer todos los endpoints disponibles
- Antes de hacer llamadas a la API
- Para integrar frontend
- Como referencia durante desarrollo

---

### 2. INTEGRACION_PAGOS.md 💳 **SISTEMA DE PAGOS**
**Lectura:** 15-20 minutos  
**Contenido:**
- 💳 Integración con Stripe
- 🔒 Seguridad en transacciones
- 📝 Flujo de compra paso a paso
- 🧪 Testing de pagos
- 🌍 Configuración para producción

**Cuándo leer:**
- Antes de implementar pagos reales
- Para configurar Stripe
- Al testear compras con tarjetas
- Para entender flujo de checkout

---

## 🎯 Endpoints por Categoría

### 🔐 Autenticación (`/auth`)
```
POST   /auth/register      - Crear cuenta
POST   /auth/login         - Iniciar sesión
POST   /auth/logout        - Cerrar sesión
GET    /auth/me            - Info del usuario actual
POST   /auth/refresh       - Refrescar token
```

**Ver detalles:** `../API_REFERENCE_COMPLETA.md` → Sección "Autenticación"

---

### 🎭 Personajes (`/characters`)
```
GET    /characters              - Listar mis personajes
POST   /characters              - Crear personaje
GET    /characters/:id          - Ver un personaje
PUT    /characters/:id          - Actualizar personaje
DELETE /characters/:id          - Eliminar personaje
POST   /characters/:id/equip    - Equipar items
POST   /characters/:id/unequip  - Desequipar items
GET    /characters/:id/stats    - Ver stats detallados
POST   /characters/:id/heal     - Curar personaje (costo dinámico)
```

**Ver detalles:** `../API_REFERENCE_COMPLETA.md` → Sección "Personajes"

---

### 🏰 Mazmorras (`/dungeons`)
```
GET    /dungeons                    - Listar mazmorras disponibles
GET    /dungeons/:id                - Info de mazmorra
POST   /dungeons/:id/start          - Iniciar nivel
POST   /dungeons/:id/complete       - Completar nivel
GET    /dungeons/:id/progress       - Ver progreso
GET    /dungeons/leaderboard        - Top jugadores
```

**Ver detalles:** `../API_REFERENCE_COMPLETA.md` → Sección "Mazmorras"

---

### 🏪 Marketplace (`/marketplace`)
```
GET    /marketplace                 - Listar items en venta
POST   /marketplace                 - Publicar item
GET    /marketplace/:id             - Ver listado
DELETE /marketplace/:id             - Cancelar venta
POST   /marketplace/:id/purchase    - Comprar item
```

**Ver detalles:** `../API_REFERENCE_COMPLETA.md` → Sección "Marketplace"

---

### 📦 Paquetes (`/packages`)
```
GET    /packages                    - Listar paquetes disponibles
POST   /packages/:id/purchase       - Comprar paquete
POST   /packages/:id/open           - Abrir paquete
GET    /packages/owned              - Mis paquetes sin abrir
```

**⚠️ IMPORTANTE:** Este sistema tiene vulnerabilidades  
**Ver:** `../02_SEGURIDAD/AUDITORIA_SEGURIDAD_PAQUETES.md`

---

### ⚡ WebSocket Events
```
EMIT:
- dungeon:start        - Iniciar mazmorra
- dungeon:action       - Acción en combate
- chat:message         - Mensaje de chat

LISTEN:
- dungeon:update       - Actualización de estado
- dungeon:complete     - Nivel completado
- chat:new_message     - Nuevo mensaje
- system:notification  - Notificación del sistema
```

**Ver detalles:** `../API_REFERENCE_COMPLETA.md` → Sección "WebSocket"

---

## 🎯 Rutas Rápidas

### "Necesito el endpoint para [ACCIÓN]"
→ `../API_REFERENCE_COMPLETA.md` → Buscar por categoría o nombre

### "¿Cómo integro PAGOS?"
→ `INTEGRACION_PAGOS.md` (guía completa)

### "¿Qué formato tienen las RESPONSES?"
→ `../API_REFERENCE_COMPLETA.md` → Cada endpoint tiene ejemplos

### "¿Cómo funciona la autenticación con cookies?"
→ `../API_REFERENCE_COMPLETA.md` → Sección "0. Configuración y Sistema"
```
// Frontend debe incluir:
withCredentials: true  // o credentials: 'include'
```

---

## 📋 Ejemplos Rápidos

### Login y Obtener Token
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "_id": "...", "email": "..." }
}
```

### Crear Personaje (Autenticado)
```bash
curl -X POST http://localhost:5000/characters \
  -H "Authorization: Bearer <tu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Warrior",
    "class": "Warrior",
    "stats": { "hp": 100, "attack": 20, "defense": 15 }
  }'
```

### Listar Mazmorras
```bash
curl -X GET http://localhost:5000/dungeons \
  -H "Authorization: Bearer <tu_token>"
```

---

## 🔒 Seguridad

### Autenticación Requerida
Todos los endpoints excepto `/auth/register` y `/auth/login` requieren token JWT.

**Header:**
```
Authorization: Bearer <token>
```

### Rate Limiting
```
100 requests por 15 minutos por IP
```

### Validación de Datos
Todos los endpoints validan:
- Tipos de datos
- Campos requeridos
- Formatos (email, etc.)
- Longitudes máximas/mínimas

---

## 🧪 Testing de la API

### Con cURL
```bash
# Ver ejemplos en API_REFERENCE.md
```

### Con Postman
1. Importar colección (crear una si no existe)
2. Configurar variables de entorno:
   - `baseURL`: `http://localhost:5000`
   - `token`: Tu JWT token
3. Ejecutar requests

### Con Tests Automatizados
```bash
# Tests E2E
npm run test -- tests/e2e/

# Tests de seguridad
npm run test -- tests/security/
```

---

## 🌍 Ambientes

### Development
```
Base URL: http://localhost:5000
Database: MongoDB local
Stripe: Test keys
```

### Production
```
Base URL: https://api.tudominio.com
Database: MongoDB Atlas
Stripe: Live keys
```

**Ver configuración:** `INTEGRACION_PAGOS.md`

---

## 📊 Códigos de Respuesta

### Exitosos
```
200 OK              - Request exitoso
201 Created         - Recurso creado
204 No Content      - Eliminación exitosa
```

### Errores del Cliente
```
400 Bad Request     - Datos inválidos
401 Unauthorized    - No autenticado
403 Forbidden       - Sin permisos
404 Not Found       - Recurso no existe
```

### Errores del Servidor
```
500 Internal Error  - Error del servidor
503 Service Unavailable - Servicio no disponible
```

---

## 🔗 Documentos Relacionados

**Frontend:**  
→ `../05_FRONTEND/` (ejemplos de integración)

**Sistemas:**  
→ `../03_SISTEMAS/` (lógica de negocio detrás de cada endpoint)

**Seguridad:**  
→ `../02_SEGURIDAD/` (vulnerabilidades a corregir)

---

## 📝 Agregar Nuevo Endpoint

### Checklist
1. [ ] Crear ruta en `/src/routes/`
2. [ ] Crear controlador en `/src/controllers/`
3. [ ] Crear servicio en `/src/services/`
4. [ ] Agregar validaciones en `/src/validations/`
5. [ ] Documentar en `API_REFERENCE.md`
6. [ ] Crear tests en `/tests/`
7. [ ] Actualizar este README si es necesario

---

**Última actualización:** 22 de octubre de 2025  
**Volver al índice:** `../00_INICIO/README.md`
