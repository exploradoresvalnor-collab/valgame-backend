# 📧 Guía: Correos Sin Dominio Propio

## ✅ Configuración Actual

Tu sistema está configurado para funcionar **SIN necesidad de dominio propio** usando **Ethereal Email**.

---

## 🎯 ¿Cómo Funciona?

### **Modo Desarrollo (Actual)**
- ✅ **NO necesitas dominio**
- ✅ **NO necesitas credenciales SMTP**
- ✅ Los correos se generan automáticamente
- ✅ Puedes ver los correos en tu terminal

### **Ethereal Email**
Es un servicio de correos de prueba que:
- Crea cuentas temporales automáticamente
- Genera enlaces para ver los correos
- NO envía correos reales (perfecto para desarrollo)

---

## 📝 Configuración en .env

```env
# Modo desarrollo (actual)
NODE_ENV=development

# Cuando tengas dominio, cambiar a:
# NODE_ENV=production
# SMTP_HOST=smtp.tudominio.com
# SMTP_PORT=465
# EMAIL_USER=noreply@tudominio.com
# EMAIL_PASS=tu_contraseña
```

---

## 🧪 Cómo Probar el Sistema de Correos

### **1. Iniciar el Servidor**
```bash
npm run dev
```

### **2. Registrar un Usuario**
```bash
# Usando curl
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test1234!"
  }'
```

### **3. Ver el Correo en la Terminal**
Busca en la terminal una línea como esta:
```
[MAILER] Correo de prueba enviado. Vista previa disponible en: 
https://ethereal.email/message/xxxxx
```

### **4. Abrir el Enlace**
- Copia el enlace de la terminal
- Pégalo en tu navegador
- ¡Verás el correo de verificación!

---

## 🔍 Ejemplo Real

### **Terminal Output:**
```bash
[MAILER] Usando cuenta de prueba de Ethereal (no necesitas credenciales).
[MAILER] Correo de prueba enviado. Vista previa disponible en: 
https://ethereal.email/message/aOVgVow8PbMubryfaOVgYfCm3db-G6KtAAAAAZdSAhyjIBjl
```

### **En el Navegador:**
Verás el correo HTML completo con:
- ✅ Diseño profesional
- ✅ Botón de verificación
- ✅ Enlace funcional
- ✅ Información del remitente

---

## 🚀 Cuando Tengas Dominio

### **Opción 1: Gmail (Gratis)**
```env
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=contraseña-de-aplicacion
```

**Pasos:**
1. Ir a Google Account → Security
2. Activar "2-Step Verification"
3. Crear "App Password"
4. Usar esa contraseña en EMAIL_PASS

---

### **Opción 2: SendGrid (Gratis hasta 100 correos/día)**
```env
NODE_ENV=production
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=tu-api-key-de-sendgrid
```

**Pasos:**
1. Registrarse en https://sendgrid.com
2. Crear API Key
3. Verificar dominio (opcional)
4. Usar API Key en EMAIL_PASS

---

### **Opción 3: Mailgun (Gratis hasta 5,000 correos/mes)**
```env
NODE_ENV=production
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
EMAIL_USER=postmaster@tu-dominio.mailgun.org
EMAIL_PASS=tu-contraseña-mailgun
```

---

### **Opción 4: Tu Propio Dominio**
Cuando compres un dominio (ej: valgame.com):

```env
NODE_ENV=production
SMTP_HOST=smtp.tudominio.com
SMTP_PORT=465
EMAIL_USER=noreply@tudominio.com
EMAIL_PASS=contraseña-del-correo
```

**Proveedores recomendados:**
- **Namecheap**: ~$10/año (dominio + email)
- **Google Workspace**: $6/mes (email profesional)
- **Zoho Mail**: Gratis hasta 5 usuarios

---

## 🎨 Personalizar los Correos

Los correos se generan en: `src/config/mailer.ts`

### **Cambiar el Diseño:**
```typescript
const getHtmlTemplate = (verificationLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Tu CSS personalizado aquí */
  </style>
</head>
<body>
  <!-- Tu HTML personalizado aquí -->
</body>
</html>
`;
```

### **Cambiar el Remitente:**
```typescript
await transporter.sendMail({
  from: '"Tu Nombre" <noreply@tudominio.com>',  // Cambiar aquí
  to: email,
  subject: 'Tu Asunto Personalizado',
  html: getHtmlTemplate(verificationLink),
});
```

---

## 🐛 Solución de Problemas

### **Problema: No veo el enlace en la terminal**
**Solución:**
```bash
# Asegúrate de que NODE_ENV=development
cat .env | grep NODE_ENV

# Debe mostrar:
# NODE_ENV=development
```

---

### **Problema: Error "SMTP connection failed"**
**Solución:**
```bash
# En modo development, NO deberías ver este error
# Si lo ves, verifica que NODE_ENV=development
```

---

### **Problema: Quiero enviar correos reales en desarrollo**
**Solución:**
```bash
# Usa Gmail temporalmente
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=contraseña-de-aplicacion-de-google
```

---

## 📊 Comparación de Opciones

| Opción | Costo | Correos/Mes | Dominio Propio | Dificultad |
|--------|-------|-------------|----------------|------------|
| **Ethereal (Actual)** | Gratis | Ilimitado | ❌ No | ⭐ Muy Fácil |
| **Gmail** | Gratis | ~500/día | ❌ No | ⭐⭐ Fácil |
| **SendGrid** | Gratis | 100/día | ✅ Opcional | ⭐⭐ Fácil |
| **Mailgun** | Gratis | 5,000 | ✅ Opcional | ⭐⭐⭐ Media |
| **Dominio Propio** | $10-50/año | Ilimitado | ✅ Sí | ⭐⭐⭐⭐ Difícil |

---

## ✅ Checklist de Configuración

### **Modo Desarrollo (Actual)** ✅
- [x] NODE_ENV=development en .env
- [x] Sistema usa Ethereal automáticamente
- [x] Correos visibles en terminal
- [x] No necesitas credenciales

### **Cuando Tengas Dominio** ⏳
- [ ] Comprar dominio
- [ ] Configurar correo en el dominio
- [ ] Actualizar .env con credenciales reales
- [ ] Cambiar NODE_ENV=production
- [ ] Probar envío de correos reales

---

## 🎯 Recomendación

### **Para Desarrollo (Ahora)**
✅ **Usar Ethereal** (configuración actual)
- No necesitas nada más
- Funciona perfectamente
- Gratis e ilimitado

### **Para Producción (Futuro)**
🎯 **Opción Recomendada: SendGrid**
- Gratis hasta 100 correos/día
- Fácil de configurar
- Profesional y confiable
- No necesitas dominio propio (opcional)

### **Para Largo Plazo**
🏆 **Dominio Propio + Google Workspace**
- Más profesional
- Email tipo: noreply@valgame.com
- Confiable y escalable

---

## 📞 Soporte

Si tienes dudas:
1. Revisa los logs en la terminal
2. Busca el enlace de Ethereal
3. Verifica que NODE_ENV=development

---

**¡Tu sistema de correos está funcionando perfectamente sin dominio! 🎉**

**Próximo paso**: Cuando estés listo para producción, elige una de las opciones de correo real.
