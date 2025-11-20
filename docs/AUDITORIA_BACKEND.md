# 🔍 AUDITORÍA COMPLETA DEL BACKEND - VALGAME RPG
**Fecha:** 2 de noviembre de 2025
**Objetivo:** Detectar vacíos, problemas de UX/DX y oportunidades de mejora

---

## 📋 RESUMEN EJECUTIVO

### ✅ Fortalezas Detectadas
1. ✅ Estructura modular bien organizada (21 archivos de rutas)
2. ✅ Middleware de autenticación implementado
3. ✅ Rate limiting configurado por tipo de operación
4. ✅ Sistema de websockets para tiempo real
5. ✅ Cron jobs para permadeath y marketplace
6. ✅ Graceful shutdown implementado

### ⚠️ Problemas Críticos Encontrados
1. ✅ **Login/Register NO devuelven recursos completos** - ✅ RESUELTO (2025-11-02)
2. ✅ **Sistema de diagnóstico de onboarding** - ✅ IMPLEMENTADO (2025-11-02)
3. ⚠️ **CORS abierto a todos los dominios** (temporal, debe corregirse en prod)
4. ⚠️ **Falta validación de entrada en varios endpoints**
5. ⚠️ **Mensajes de error inconsistentes**
6. ✅ **Falta endpoint de "reenviar correo de verificación"** - ✅ IMPLEMENTADO (2025-11-19)
7. ✅ **No hay endpoint para "recuperar contraseña"** - ✅ IMPLEMENTADO (2025-11-19)

### 🔧 Mejoras Recomendadas
1. 📝 Documentación API (Swagger/OpenAPI)
2. 🧪 Tests E2E para flujos completos
3. 🔐 Restringir CORS a dominios específicos en producción
4. 📊 Logging estructurado y monitoreo
5. 🎯 Validaciones consistentes con Zod en todos los endpoints

---

## 🚀 REVISIÓN POR FLUJO DE USUARIO

### 1️⃣ FLUJO: REGISTRO Y VERIFICACIÓN

#### Estado Actual
- ✅ POST `/auth/register` - Registra usuario y envía email
- ✅ GET `/auth/verify/:token` - Verifica email y entrega paquete pionero
- ❌ **FALTA:** POST `/auth/resend-verification` - Reenviar email

#### Problemas Detectados
```typescript
// ❌ PROBLEMA: No hay forma de reenviar el email de verificación
// Si el usuario no recibe el correo o expira, está bloqueado
```

#### Solución Recomendada
```typescript
// ✅ Agregar endpoint:
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) return res.status(404).json({ error: 'Email no registrado' });
  if (user.isVerified) return res.status(400).json({ error: 'Cuenta ya verificada' });
  
  // Generar nuevo token y reenviar email
  const newToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = newToken;
  user.verificationTokenExpires = new Date(Date.now() + 3600000);
  await user.save();
  
  await sendVerificationEmail(user.email, newToken);
  return res.json({ message: 'Email de verificación reenviado' });
});
```

---

### 2️⃣ FLUJO: LOGIN Y RECUPERACIÓN DE CONTRASEÑA

#### Estado Actual
- ✅ POST `/auth/login` - Login con email/password
- ✅ POST `/auth/logout` - Logout y blacklist de token
- ❌ **FALTA:** POST `/auth/forgot-password` - Solicitar reset
- ❌ **FALTA:** POST `/auth/reset-password/:token` - Resetear contraseña

#### Problemas Detectados
```typescript
// ❌ PROBLEMA: Si el usuario olvida su contraseña, no puede recuperarla
// No hay flujo de recuperación implementado
```

#### Experiencia de Usuario Afectada
- Usuario olvida contraseña → **NO PUEDE RECUPERARLA**
- Debe crear nueva cuenta → **PIERDE TODO SU PROGRESO**
- **Impacto:** Abandono de usuarios, frustración

#### Solución Recomendada (ALTA PRIORIDAD)
```typescript
// 1. Agregar campos al modelo User:
passwordResetToken?: string;
passwordResetExpires?: Date;

// 2. Endpoint: Solicitar reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) {
    // Por seguridad, no revelar si el email existe
    return res.json({ message: 'Si el email existe, recibirás instrucciones' });
  }
  
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hora
  await user.save();
  
  await sendPasswordResetEmail(user.email, resetToken);
  return res.json({ message: 'Si el email existe, recibirás instrucciones' });
});

// 3. Endpoint: Resetear contraseña
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  });
  
  if (!user) {
    return res.status(400).json({ error: 'Token inválido o expirado' });
  }
  
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  
  return res.json({ message: 'Contraseña actualizada exitosamente' });
});
```

---

### 3️⃣ FLUJO: ONBOARDING (PAQUETE PIONERO)

#### Estado Actual
- ✅ Se entrega automáticamente al verificar email
- ✅ Flag `receivedPioneerPackage` para evitar duplicados
- ⚠️ **PROBLEMA:** Si falla la entrega, el usuario queda sin recursos iniciales

#### Recomendación
```typescript
// ✅ Agregar endpoint de "reparación" para soporte
router.post('/admin/deliver-pioneer-package/:userId', adminAuth, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  
  if (user.receivedPioneerPackage) {
    return res.status(400).json({ error: 'Usuario ya tiene paquete pionero' });
  }
  
  const result = await deliverPioneerPackage(user);
  return res.json({ message: 'Paquete entregado', result });
});
```

---

### 4️⃣ FLUJO: GESTIÓN DE PERSONAJES

#### Estado Actual
- ✅ POST `/api/users/characters/add` - Agregar personaje
- ✅ PUT `/api/users/set-active-character/:personajeId` - Activar personaje
- ✅ GET `/api/characters` - Listar personajes del usuario
- ⚠️ **PROBLEMA:** No hay endpoint para eliminar personajes

#### Problemas Detectados
```typescript
// ❌ Usuario no puede eliminar personajes que no quiere
// ❌ No hay validación de límite de personajes antes de agregar
```

#### Solución Recomendada
```typescript
// 1. Validar límite en POST /users/characters/add
if (user.personajes.length >= user.limiteInventarioPersonajes) {
  return res.status(400).json({ 
    error: 'Límite de personajes alcanzado',
    limite: user.limiteInventarioPersonajes,
    actual: user.personajes.length
  });
}

// 2. Agregar endpoint de eliminación
router.delete('/characters/:personajeId', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  const index = user.personajes.findIndex(p => p.personajeId === req.params.personajeId);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Personaje no encontrado' });
  }
  
  // No permitir eliminar el personaje activo
  if (user.personajeActivoId === req.params.personajeId) {
    return res.status(400).json({ error: 'No puedes eliminar el personaje activo' });
  }
  
  user.personajes.splice(index, 1);
  await user.save();
  
  return res.json({ message: 'Personaje eliminado', personajes: user.personajes });
});
```

---

### 5️⃣ FLUJO: USO DE CONSUMIBLES (RESUELTO 2025-11-19)

#### Problema Original
- ✅ **RESUELTO:** Lógica buggy para eliminar consumibles cuando usos_restantes <= 0
- ✅ **RESUELTO:** Consumibles no aplicaban buffs temporales, solo curación inmediata

#### Solución Implementada
```typescript
// ✅ Lógica simplificada para eliminación:
if (inventoryItem.usos_restantes <= 0) {
  user.inventarioConsumibles.pull(inventoryItem._id);
}

// ✅ Aplicación de buffs temporales:
if (consumable.duracion_efecto_minutos) {
  const buff = {
    name: consumable.nombre,
    effects: { mejora_atk, mejora_defensa, mejora_xp_porcentaje },
    expiresAt: new Date(Date.now() + duracion * 60 * 1000)
  };
  character.activeBuffs.push(buff);
}
```

#### Integración en Combate
- Los buffs se aplican automáticamente en `startDungeon` antes del combate
- Permite usar consumibles fuera del combate para buffs temporales
- Combate sigue siendo automático, pero con stats mejoradas

---

### 6️⃣ FLUJO: MARKETPLACE

#### Pendiente de Revisión
- ⏳ Revisar `/api/marketplace/*` endpoints
- ⏳ Validar transacciones y seguridad
- ⏳ Verificar expiración automática

---

## 🔐 ANÁLISIS DE SEGURIDAD

### ✅ Implementado Correctamente
1. ✅ JWT en httpOnly cookies (protege contra XSS)
2. ✅ Token blacklist en logout
3. ✅ Rate limiting por tipo de operación
4. ✅ Helmet.js para headers de seguridad
5. ✅ Password hashing con bcrypt

### ⚠️ Vulnerabilidades Potenciales

#### 1. CORS Abierto (RESUELTO 2025-11-19)
```typescript
// ✅ RESUELTO: Ahora usa FRONTEND_ORIGIN si está definida
const frontendOrigin = process.env.FRONTEND_ORIGIN;
if (frontendOrigin) {
  const allowedOrigins = frontendOrigin.split(',').map(origin => origin.trim());
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
}
```

#### 2. Falta Validación de Entrada (EN PROGRESO)
```typescript
// ✅ AGREGADO: Validación con Zod en /api/users/characters/add
import { AddCharacterSchema } from '../validations/character.schemas';
router.post('/characters/add', auth, validateBody(AddCharacterSchema), ...);
```

#### 3. Rate Limiting Inconsistente
```typescript
// ⚠️ PENDIENTE: Algunos endpoints críticos no tienen rate limit específico
// Ejemplo: /api/users/characters/add (podría ser abusado)

// ✅ AGREGAR:
app.use('/api/users/characters', characterManagementLimiter);
```

---

## 📊 ANÁLISIS DE ERRORES Y MENSAJES

### ❌ Problemas de Consistencia

#### Mensajes de Error Variados
```typescript
// ❌ INCONSISTENTE:
return res.status(400).json({ error: 'Bad Request' });
return res.status(401).json({ error: 'No autenticado' });
return res.status(404).json({ error: 'Usuario no encontrado' });

// vs.

return res.status(400).json({ message: 'Faltan campos' });
return res.status(401).json({ message: 'Token inválido' });
```

#### Solución: Estandarizar Respuestas
```typescript
// ✅ FORMATO ESTÁNDAR:
interface ErrorResponse {
  ok: false;
  error: {
    code: string;        // 'INVALID_INPUT', 'NOT_FOUND', etc.
    message: string;     // Mensaje user-friendly
    details?: any;       // Detalles adicionales (opcional)
  };
}

interface SuccessResponse<T> {
  ok: true;
  data: T;
  message?: string;
}

// Ejemplo:
return res.status(400).json({
  ok: false,
  error: {
    code: 'INVALID_INPUT',
    message: 'El personajeId es requerido',
    details: { field: 'personajeId', received: undefined }
  }
});
```

---

## 🎯 PRIORIZACIÓN DE MEJORAS

### 🔴 CRÍTICAS (Implementar YA)
1. ❌ **Recuperación de contraseña** - Flujo completo falta
2. ❌ **Reenviar email de verificación** - Usuario puede quedar bloqueado
3. ⚠️ **Restringir CORS en producción** - Seguridad comprometida
4. ⚠️ **Validaciones con Zod en todos los endpoints** - Prevenir errores

### 🟡 IMPORTANTES (Próxima iteración)
1. 📝 Endpoint para eliminar personajes
2. 📊 Estandarizar formato de respuestas
3. 🔐 Rate limiting específico por recurso
4. 🧪 Tests E2E de flujos completos

### 🟢 MEJORAS (Backlog)
1. 📚 Documentación API con Swagger
2. 📈 Logging estructurado y monitoreo
3. 🎨 Mensajes de error más descriptivos
4. 🔍 Endpoint de health check detallado

---

## 📝 CHECKLIST DE ACCIÓN INMEDIATA

### Para Desarrollador
- [ ] Implementar POST `/auth/forgot-password` - ✅ IMPLEMENTADO (2025-11-19)
- [ ] Implementar POST `/auth/reset-password/:token` - ✅ IMPLEMENTADO (2025-11-19)
- [ ] Implementar POST `/auth/resend-verification` - ✅ IMPLEMENTADO (2025-11-19)
- [ ] Agregar validaciones Zod en endpoints sin validar
- [ ] Revisar y ajustar CORS para producción
- [ ] Agregar DELETE `/api/users/characters/:personajeId`
- [ ] Estandarizar formato de respuestas de error

### Para QA/Testing
- [ ] Probar flujo completo de registro → verificación → login
- [ ] Intentar flujo de "olvidé mi contraseña" (detectar falta)
- [ ] Verificar mensajes de error sean claros
- [ ] Probar límites de personajes/inventario

### Para DevOps/Deploy
- [ ] Configurar FRONTEND_ORIGIN con dominios específicos
- [ ] Verificar variables de entorno en Render
- [ ] Configurar alertas para errores 500
- [ ] Revisar logs de errores recientes

---

## 🔄 PRÓXIMOS PASOS

1. **Revisar este documento con el equipo**
2. **Priorizar las mejoras críticas**
3. **Crear issues/tickets para cada mejora**
4. **Implementar en sprints**
5. **Actualizar documentación**

---

## 🛠️ HERRAMIENTAS DE DIAGNÓSTICO IMPLEMENTADAS

### ✅ Sistema de Diagnóstico de Onboarding (2025-11-02)

Se implementó un sistema completo para detectar y reparar problemas en el flujo de onboarding de usuarios.

#### Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| **Diagnóstico** | `npm run diagnose:onboarding` | Detecta usuarios con problemas en onboarding |
| **Reparación (DRY RUN)** | `npm run fix:onboarding` | Simula corrección sin modificar DB |
| **Reparación (REAL)** | `npm run fix:onboarding:apply` | Aplica correcciones reales a la DB |

#### Problemas Detectados y Corregidos

✅ **Problema 1:** Usuarios verificados sin Paquete Pionero  
✅ **Problema 2:** Recursos NULL/undefined (val, boletos, evo)  
✅ **Problema 3:** Flag `receivedPioneerPackage` pero sin personaje  
✅ **Problema 4:** Flag `receivedPioneerPackage` pero inventario vacío  
✅ **Problema 5:** VAL en 0 después de recibir paquete  

#### Documentación Completa

📄 Ver: `docs/SISTEMA_DIAGNOSTICO_ONBOARDING.md`

#### Resultados en Base de Datos Local (2025-11-02)

```
📊 RESUMEN:
- Total usuarios: 31
- Verificados: 11
- Con paquete pionero: 10
- Problemas detectados: 1 usuario verificado sin paquete

🔧 REPARACIONES NECESARIAS:
- mchaustman@gmail.com: Usuario verificado sin paquete pionero
```

#### Próximos Pasos

- [ ] Ejecutar diagnóstico en base de datos de **PRODUCCIÓN**
- [ ] Aplicar correcciones si se detectan problemas
- [ ] Configurar monitoreo semanal automático
- [ ] Integrar diagnóstico en CI/CD pipeline

---

## 📊 ACTUALIZACIONES DEL DOCUMENTO

### 2025-11-19
- ✅ Implementado endpoint DELETE `/api/users/characters/:personajeId` para eliminar personajes
- ✅ Agregada validación Zod en `/api/users/characters/add`
- ✅ Corregida configuración CORS para usar FRONTEND_ORIGIN
- ✅ Simplificada lógica de eliminación de consumibles en `useConsumable`
- ✅ Implementados buffs temporales para consumibles con duración
- ✅ Integración de buffs en sistema de combate automático

---

**Documento vivo - Actualizar después de cada implementación**
