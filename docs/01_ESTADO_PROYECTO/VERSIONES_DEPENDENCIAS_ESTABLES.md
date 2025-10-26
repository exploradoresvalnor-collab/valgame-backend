# 📦 Versiones de Dependencias Estables (Render)

> ⚠️ **CRÍTICO:** Estas versiones están probadas y funcionando en producción (Render). NO modificar sin hacer backup.

## **Fecha de Documentación:** 26 de octubre de 2025

---

## **Dependencias de Producción**

```json
{
  "dependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.3",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/mongoose": "^5.11.96",
    "@types/node": "^24.2.1",
    "@types/node-cron": "^3.0.11",
    "@types/nodemailer": "^7.0.2",
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.1",
    "express": "^5.1.0",
    "express-rate-limit": "^7.0.0",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.2",
    "mongodb": "6.10.0",
    "mongoose": "8.8.4",
    "node-cron": "^4.2.1",
    "nodemailer": "^7.0.6",
    "socket.io": "^4.8.1",
    "typescript": "^5.9.3",
    "zod": "^4.1.11"
  }
}
```

---

## **⚠️ Versiones Críticas (NO MODIFICAR)**

| Paquete | Versión Exacta | Razón |
|---------|----------------|-------|
| `mongodb` | **6.10.0** | Versión fija sin `^`. Problemas conocidos con versiones superiores en Render. |
| `mongoose` | **8.8.4** | Versión fija sin `^`. Compatible con MongoDB 6.10.0. |

---

## **Problemas Conocidos**

### **1. Error: Cannot find module './explainable_cursor'**
- **Causa:** Incompatibilidad entre versiones de `mongodb` y `mongoose` en desarrollo con `ts-node-dev`.
- **Solución:** 
  - En desarrollo: Usar `npm run build && npm start` en lugar de `npm run dev`.
  - En producción (Render): Funciona correctamente con las versiones actuales.

---

## **Comandos Seguros**

### **Reinstalar dependencias sin modificar versiones:**
```bash
rm -rf node_modules
npm install
```

### **Verificar versiones instaladas:**
```bash
npm list mongodb mongoose
```

---

## **Historial de Cambios**

### **26 de octubre de 2025**
- ✅ Documentadas versiones estables actuales
- ✅ MongoDB 6.10.0 y Mongoose 8.8.4 funcionando en Render
- ⚠️ Problema temporal con `ts-node-dev` en desarrollo local (no afecta producción)

---

## **Notas para el Futuro**

1. **Antes de actualizar cualquier dependencia:**
   - Crear una rama de prueba
   - Probar localmente con `npm run build && npm start`
   - Probar en Render antes de merge a main

2. **Si Render falla al desplegar:**
   - Revisar este documento
   - Restaurar versiones documentadas aquí
   - Ejecutar `npm install` de nuevo

3. **Backups importantes:**
   - `package.json` actual
   - `package-lock.json` actual
   - Este documento de versiones
