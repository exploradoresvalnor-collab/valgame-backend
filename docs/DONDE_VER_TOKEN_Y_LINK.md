# 🚀 GUÍA RÁPIDA - Cómo Ver el Token y el Link

## 📍 TU PREGUNTA: "¿Dónde me meto para ver ese token y ese link?"

### ✅ RESPUESTA SIMPLE:

**Los ves en la CONSOLA/TERMINAL donde corre el servidor (`npm run dev`)**

---

## 🎬 PASO A PASO CON SCREENSHOTS

### **PASO 1: Asegúrate que el servidor está corriendo**

En tu terminal debes ver:
```
[API] Servidor corriendo en http://localhost:8080
```

✅ **YA LO TIENES** - Vi que tu servidor está corriendo

---

### **PASO 2: Abre el archivo `test-auth-recovery.http`**

📂 Ubicación: `C:\Users\Haustman\Desktop\valgame-backend\test-auth-recovery.http`

1. Abre VS Code
2. Abre el archivo `test-auth-recovery.http`
3. Verás varios bloques de código HTTP

---

### **PASO 3: Instala Thunder Client o REST Client (si no lo tienes)**

**Opción A: Thunder Client (Más fácil)**
1. Presiona `Ctrl+Shift+X` (Extensions)
2. Busca "Thunder Client"
3. Click en "Install"

**Opción B: REST Client**
1. Presiona `Ctrl+Shift+X`
2. Busca "REST Client"
3. Click en "Install"

---

### **PASO 4: Ejecuta la primera prueba - Registrar usuario**

En el archivo `test-auth-recovery.http`, busca este bloque:

```http
###
# 7. Registro de nuevo usuario (para probar flujo completo)
POST {{baseURL}}/auth/register
Content-Type: application/json

{
  "email": "nuevo@example.com",
  "username": "nuevoUsuario",
  "password": "password123"
}
```

**Si usas Thunder Client:**
- Verás un botón "Send" arriba del código
- Click en "Send"

**Si usas REST Client:**
- Verás un texto pequeño "Send Request" arriba del código
- Click en "Send Request"

---

### **PASO 5: ¡AQUÍ APARECE EL LINK! 👀**

**MIRA TU TERMINAL donde corre el servidor**

Verás algo como esto:

```
[MAILER] Correo de prueba enviado. Vista previa disponible en: https://ethereal.email/message/ZnK5BW3MZB...DpVyqA9zQ
```

**👉 ESE es el link que buscas**

---

### **PASO 6: Copia y abre el link en tu navegador**

1. **Selecciona TODO el enlace** desde `https://` hasta el final
2. **Copia** (Ctrl+C)
3. **Pega** en tu navegador (Ctrl+V)
4. **Presiona Enter**

---

### **PASO 7: ¡Verás el email! 📧**

En Ethereal verás:
- Un email completo y bonito
- Un botón que dice "Verificar Mi Cuenta" o "Cambiar Mi Contraseña"

---

### **PASO 8: ¿Cómo saco el TOKEN del email?**

**Método 1: Copiar del botón**
1. **Haz click DERECHO** en el botón del email
2. Selecciona **"Copiar dirección del enlace"**
3. Pega en un bloc de notas
4. Verás algo como: `http://localhost:4200/reset-password/a1b2c3d4e5f6...`
5. **El TOKEN es todo lo que viene después de `/reset-password/`**

**Método 2: Ver el código fuente**
1. En la página de Ethereal, busca el botón
2. El enlace está visible en el HTML

---

## 🎯 EJEMPLO REAL

### **En la terminal verás:**
```bash
[API] Servidor corriendo en http://localhost:8080
[MAILER] Correo de recuperación enviado. Vista previa disponible en: https://ethereal.email/message/ZnK5BW3MZB4gEQBOAAABLMkI2A9zQ
                                                                         ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                                                                         COPIA ESTE LINK COMPLETO
```

### **En el navegador (Ethereal) verás:**
```
┌─────────────────────────────────────────────────────┐
│  Recuperación de Contraseña                         │
│                                                     │
│  ¿Olvidaste tu contraseña?                         │
│  No te preocupes, haz clic en el botón:           │
│                                                     │
│  ┌──────────────────────────────────┐              │
│  │  Cambiar Mi Contraseña           │              │
│  └──────────────────────────────────┘              │
│      ↑↑↑ CLICK DERECHO AQUÍ          │
│      "Copiar dirección del enlace"                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### **El token copiado será:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## 🔥 AHORA SÍ, PRUEBA COMPLETA:

### **1. Registra un usuario:**
```http
POST http://localhost:8080/auth/register
Content-Type: application/json

{
  "email": "mitest@example.com",
  "username": "miUsuario",
  "password": "password123"
}
```
→ **Busca el link en la terminal**  
→ **Ábrelo en el navegador**  
→ **Verás el email de verificación**

---

### **2. Pide recuperación de contraseña:**
```http
POST http://localhost:8080/auth/forgot-password
Content-Type: application/json

{
  "email": "mitest@example.com"
}
```
→ **Busca el NUEVO link en la terminal**  
→ **Ábrelo en el navegador**  
→ **Copia el token del botón**

---

### **3. Resetea la contraseña con el token:**
```http
POST http://localhost:8080/auth/reset-password/PEGA_EL_TOKEN_AQUI
Content-Type: application/json

{
  "password": "nuevaPassword123"
}
```

---

## 🆘 TROUBLESHOOTING

### **No veo el link en la terminal**
- ✅ Verifica que el servidor esté corriendo
- ✅ Scroll hacia arriba en la terminal
- ✅ Busca la línea que dice `[MAILER]`

### **El link no funciona**
- ✅ Copia el link COMPLETO (desde https:// hasta el final)
- ✅ No copies espacios antes o después
- ✅ Pega directamente en la barra del navegador

### **No encuentro el token**
- ✅ Haz click DERECHO en el botón del email
- ✅ Selecciona "Copiar dirección del enlace"
- ✅ El token es la parte larga de letras/números después de `/reset-password/`

---

## ✅ RESUMEN DE 3 PASOS:

1. **Ejecuta el request** en `test-auth-recovery.http`
2. **Mira tu terminal** → Verás el link de Ethereal
3. **Abre el link** en el navegador → Verás el email con el token

---

¡Eso es todo! 🎉

**La magia está en la terminal donde corre el servidor** - ahí aparecen TODOS los links.
