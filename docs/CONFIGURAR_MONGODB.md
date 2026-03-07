# 🚀 Guía Rápida: Configuración de MongoDB para Valgame

## 📊 Estado Actual del Sistema

El sistema **Valgame** tiene **dos modos de funcionamiento**:

### ✅ **Modo Desarrollo** (Actual)
- ✅ Funciona **sin base de datos**
- ✅ Usa datos ficticios en memoria
- ✅ Ideal para desarrollo y pruebas rápidas
- ✅ **Ya está funcionando perfectamente**

### 🗄️ **Modo Producción** (Con MongoDB Real)
- ✅ Usa MongoDB Atlas o local
- ✅ Almacena datos reales persistentemente
- ✅ Requiere configuración de base de datos

---

## 🔄 Cambiar Entre Modos

### Ver Modo Actual
```bash
node switch-mode.js status
```

### Cambiar a Modo Desarrollo (Sin BD)
```bash
node switch-mode.js dev
npm run dev
```

### Cambiar a Modo Producción (Con BD)
```bash
node switch-mode.js prod
npm run dev
```

---

## 🗄️ Configurar MongoDB Local (Recomendado)

### Paso 1: Instalar MongoDB (si no lo tienes)
```bash
# Windows con Chocolatey
choco install mongodb

# O descarga manualmente desde: https://www.mongodb.com/try/download/community
```

### Paso 2: Iniciar MongoDB
```bash
net start MongoDB
```

### Paso 3: Configurar Base de Datos
```bash
node setup-mongodb-local.js
```

### Paso 4: Poblar con Datos Iniciales
```bash
npm run seed
```

### Paso 5: Reiniciar Servidor
```bash
npm run dev
```

---

## ☁️ Usar MongoDB Atlas (Cloud)

### Verificar Conexión
1. **IP en Whitelist**: Agrega tu IP pública a Atlas
2. **Credenciales**: Verifica usuario y contraseña
3. **Conexión**: Asegúrate de tener internet

### Configurar en `.env`
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/valgame?retryWrites=true&w=majority
NODE_ENV=production
```

### Poblar Base de Datos
```bash
npm run seed
npm run dev
```

---

## 📋 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `switch-mode.js` | Cambiar entre modo dev/prod |
| `setup-mongodb-local.js` | Configurar MongoDB local automáticamente |
| `npm run seed` | Poblar base de datos con datos iniciales |
| `npm run dev` | Iniciar servidor en modo desarrollo |
| `npm run check-env` | Verificar configuración del entorno |

---

## ✅ Verificación

### Probar Conexión
```bash
npm run check-env
```

### Ver Datos en Base de Datos
```bash
node scripts/check-real-data.ts
```

### Ejecutar Tests
```bash
npm run test:e2e
```

---

## 🔧 Solución de Problemas

### "MongoDB no está ejecutándose"
```bash
# Iniciar servicio
net start MongoDB

# Verificar estado
netstat -ano | findstr :27017
```

### "Error de conexión"
- Verifica `MONGODB_URI` en `.env`
- Para Atlas: verifica IP whitelist y credenciales
- Para local: verifica que MongoDB esté corriendo

### "Datos no aparecen"
```bash
# Repoblar base de datos
npm run seed

# Verificar datos
node scripts/check-real-data.ts
```

---

## 🎯 Resumen

**El sistema SÍ funciona con MongoDB** - solo necesitas configurar la conexión:

1. **Para desarrollo rápido**: usa `node switch-mode.js dev`
2. **Para producción**: configura MongoDB y usa `node switch-mode.js prod`

¿Necesitas ayuda con algún paso específico? 🤔

## Scripts disponibles para poblar datos:

- `seed_minimal_e2e.ts` - Datos básicos para pruebas
- `seed-base-characters.js` - Personajes base
- `seed-items.js` - Items del juego
- `seed-packages.js` - Paquetes de inicio
- `init-db.ts` - Configuración completa (requiere ajustes)