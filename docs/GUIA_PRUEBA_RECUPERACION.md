# 🧪 GUÍA DE PRUEBA - Recuperación de Contraseña y Reenvío de Verificación

## 📋 Pasos para Probar

### **OPCIÓN 1: Usando Thunder Client (VS Code) - RECOMENDADO ✅**

1. **Instalar Thunder Client (si no lo tienes):**
   - Ve a Extensions en VS Code (Ctrl+Shift+X)
   - Busca "Thunder Client"
   - Instala la extensión

2. **Abrir el archivo de pruebas:**
   - Abre el archivo: `test-auth-recovery.http`
   - Verás todos los endpoints listos para probar

3. **Ejecutar las pruebas paso a paso:**

---

### **PASO 1: Registrar un usuario de prueba**

```http
POST http://localhost:8080/auth/register
Content-Type: application/json

{
  "email": "prueba@test.com",
  "username": "usuarioPrueba",
  "password": "test123456"
}
```

**Click en "Send Request"**

✅ **Deberías ver:**
```json
{
  "message": "Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta."
}
```

🔍 **IMPORTANTE: Revisa la CONSOLA del servidor (terminal donde corre npm run dev)**

Verás algo como:
```
[MAILER] Correo de prueba enviado. Vista previa disponible en: https://ethereal.email/message/ZxYzAbc123...
```

**👉 COPIA ESE ENLACE y ÁBRELO EN EL NAVEGADOR** - Ahí verás el email con el token de verificación

---

### **PASO 2: Probar "Olvidé mi contraseña"**

```http
POST http://localhost:8080/auth/forgot-password
Content-Type: application/json

{
  "email": "prueba@test.com"
}
```

**Click en "Send Request"**

✅ **Deberías ver:**
```json
{
  "message": "Si el correo existe, se enviará un email con instrucciones para recuperar tu contraseña."
}
```

🔍 **BUSCA EN LA CONSOLA DEL SERVIDOR:**
```
[MAILER] Correo de recuperación enviado. Vista previa disponible en: https://ethereal.email/message/...
```

**👉 COPIA ESE ENLACE, ÁBRELO EN EL NAVEGADOR**

Verás un email bonito en rojo con un botón "Cambiar Mi Contraseña". 

**👉 HAZ CLICK DERECHO en el botón → "Copiar dirección del enlace"**

El enlace se verá así:
```
http://localhost:4200/reset-password/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...
```

**👉 COPIA SOLO LA PARTE DEL TOKEN** (todo lo que viene después de `/reset-password/`)

---

### **PASO 3: Resetear la contraseña con el token**

Abre el archivo `test-auth-recovery.http` y busca esta sección:

```http
POST http://localhost:8080/auth/reset-password/TOKEN_AQUI
Content-Type: application/json

{
  "password": "nuevaPassword123"
}
```

**👉 REEMPLAZA `TOKEN_AQUI` con el token que copiaste**

Ejemplo:
```http
POST http://localhost:8080/auth/reset-password/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Content-Type: application/json

{
  "password": "nuevaPassword123"
}
```

**Click en "Send Request"**

✅ **Deberías ver:**
```json
{
  "message": "Contraseña actualizada exitosamente. Ya puedes iniciar sesión."
}
```

---

### **PASO 4: Verificar que funciona haciendo login con la nueva contraseña**

```http
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "email": "prueba@test.com",
  "password": "nuevaPassword123"
}
```

**Click en "Send Request"**

✅ **Deberías ver:**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "...",
    "email": "prueba@test.com",
    "username": "usuarioPrueba",
    ...
  }
}
```

🎉 **¡FUNCIONA! Has recuperado tu contraseña exitosamente**

---

### **PASO 5: Probar reenvío de verificación**

Registra otro usuario:

```http
POST http://localhost:8080/auth/register
Content-Type: application/json

{
  "email": "otro@test.com",
  "username": "otroUsuario",
  "password": "test123456"
}
```

Ahora solicita reenviar la verificación:

```http
POST http://localhost:8080/auth/resend-verification
Content-Type: application/json

{
  "email": "otro@test.com"
}
```

✅ **Deberías ver:**
```json
{
  "message": "Email de verificación enviado. Revisa tu bandeja de entrada."
}
```

🔍 **Busca en la consola:**
```
[MAILER] Correo de prueba enviado. Vista previa disponible en: https://ethereal.email/...
```

---

## 🎯 RESUMEN: ¿Dónde ves los tokens y enlaces?

### **1. En la CONSOLA del servidor (Terminal)**
Cuando ejecutas `npm run dev`, cada vez que se envía un email verás:

```bash
[MAILER] Correo de recuperación enviado. Vista previa disponible en: https://ethereal.email/message/XYZ123
```

**👉 ESE enlace lo abres en tu navegador**

---

### **2. En Ethereal Email (navegador)**

Cuando abres el enlace de Ethereal, verás:
- El email completo renderizado
- Los botones funcionando
- Puedes copiar el token del enlace

**Para copiar el token:**
1. Haz click derecho en el botón del email
2. "Copiar dirección del enlace"
3. El enlace tendrá esta forma: `http://localhost:4200/reset-password/TOKEN`
4. Copia solo el TOKEN (todo después de `/reset-password/`)

---

## 🚨 ERRORES COMUNES

### **Error: "Token de recuperación inválido o expirado"**
- El token expira en 1 hora
- Si pasó más de 1 hora, solicita uno nuevo con `POST /auth/forgot-password`

### **Error: "Ya existe un email de verificación válido"**
- Significa que ya pediste reenvío hace poco
- Espera el tiempo que te indica (ejemplo: "Espera 45 minutos")
- O usa el token actual que ya tienes

### **Error: "La cuenta ya está verificada"**
- No puedes pedir reenvío de verificación en una cuenta ya verificada
- Normal después de verificar la cuenta

---

## 📸 SCREENSHOTS DE EJEMPLO

### Consola del servidor mostrando enlace:
```
[API] Servidor corriendo en http://localhost:8080
[MAILER] Correo de recuperación enviado. Vista previa disponible en: https://ethereal.email/message/ZnK5...
```

### Email en Ethereal:
- Verás un email profesional
- Header rojo (para recuperación) o morado (para verificación)
- Botón grande con el enlace
- Advertencia de que expira en 1 hora

---

## 🎓 TIPS

1. **Mantén la consola del servidor VISIBLE** mientras haces las pruebas
2. **Los enlaces de Ethereal son temporales** pero duran varios días
3. **Puedes hacer múltiples pruebas** - cada solicitud genera un nuevo token
4. **Los tokens NO se guardan en ningún archivo** - solo en la base de datos y el email
5. **En producción**, estos emails llegarán al correo real del usuario

---

## ✅ CHECKLIST DE PRUEBA

- [ ] Registrar usuario de prueba
- [ ] Ver enlace de verificación en consola
- [ ] Abrir enlace de Ethereal en navegador
- [ ] Solicitar recuperación de contraseña
- [ ] Ver enlace de recuperación en consola
- [ ] Abrir email de recuperación en Ethereal
- [ ] Copiar token del botón
- [ ] Resetear contraseña con el token
- [ ] Hacer login con nueva contraseña ✅
- [ ] Solicitar reenvío de verificación
- [ ] Verificar rate limiting (intentar reenviar dos veces seguidas)

---

## 🆘 ¿NECESITAS AYUDA?

Si algo no funciona:
1. Verifica que el servidor esté corriendo (`npm run dev`)
2. Revisa la consola para errores
3. Verifica que MongoDB esté conectado
4. Asegúrate de usar el token correcto (copia-pega sin espacios)

¡Listo! Ahora tienes todo para probar las nuevas funcionalidades 🚀
