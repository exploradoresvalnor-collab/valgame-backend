# 🚀 VALGAME BACKEND - Guía de Inicio Rápido

**Para:** Desarrolladores nuevos en el proyecto  
**Tiempo de lectura:** 5 minutos  
**Resultado:** Proyecto funcionando localmente

---

## 🎯 OBJETIVO

Tener el backend de Valgame corriendo en tu máquina en **5 minutos**.

---

## 📋 PRERREQUISITOS

### Sistema Operativo
- ✅ **Windows 10/11** (recomendado)
- ✅ **macOS** (compatible)
- ✅ **Linux** (compatible)

### Software Requerido
```bash
# Node.js 18+ (LTS)
node --version  # Debe ser 18.x.x o superior

# npm incluido con Node.js
npm --version   # Debe ser 9.x.x o superior

# Git
git --version   # Debe ser 2.x.x o superior
```

### Base de Datos
- ✅ **MongoDB Atlas** (recomendado para desarrollo)
- ✅ **MongoDB Local** (opcional)

---

## ⚡ SETUP RÁPIDO (3 minutos)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/exploradoresvalnor-collab/valgame-backend.git
cd valgame-backend
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores
code .env
```

**Contenido mínimo del `.env`:**
```bash
# Base de datos (MongoDB Atlas recomendado)
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/valgame-dev

# JWT Secret (genera uno seguro)
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# Puerto del servidor
PORT=8080

# Entorno
NODE_ENV=development

# Email (opcional para desarrollo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
```

### 4. Ejecutar el Servidor
```bash
# Modo desarrollo con hot-reload
npm run dev

# O modo producción
npm start
```

### 5. Verificar que Funciona
```bash
# Abrir en navegador
http://localhost:8080/health

# Debe responder: {"status":"ok","timestamp":"2025-11-20T..."}
```

---

## 🔧 CONFIGURACIÓN DETALLADA

### MongoDB Atlas (Recomendado)
1. Ve a [mongodb.com/atlas](https://mongodb.com/atlas)
2. Crea cuenta gratuita
3. Crea un cluster gratuito (M0)
4. Crea usuario de base de datos
5. Whitelist tu IP (0.0.0.0/0 para desarrollo)
6. Copia la connection string

### Variables de Entorno Completas
```bash
# Base de datos
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/valgame-dev

# Autenticación
JWT_SECRET=mi_jwt_secret_super_seguro_2025
JWT_EXPIRES_IN=7d

# Servidor
PORT=8080
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3000

# Email (Gmail recomendado)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password-de-gmail
SMTP_FROM=tu-email@gmail.com

# Opcionales
LOG_LEVEL=debug
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🧪 PRUEBA RÁPIDA DE FUNCIONAMIENTO

### 1. Health Check
```bash
curl http://localhost:8080/health
# Respuesta esperada: {"status":"ok"}
```

### 2. Registro de Usuario
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Ver Perfil (con cookie)
```bash
# Usar la cookie del login anterior
curl http://localhost:8080/api/users/me \
  -H "Cookie: token=eyJhbGciOiJIUzI1NiIs..."
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
valgame-backend/
├── src/
│   ├── controllers/     # Lógica de negocio
│   ├── models/         # Modelos de datos
│   ├── routes/         # Definición de rutas API
│   ├── middlewares/    # Middlewares personalizados
│   ├── services/       # Servicios reutilizables
│   ├── config/         # Configuraciones
│   ├── validations/    # Validaciones Zod
│   └── utils/          # Utilidades
├── tests/              # Tests automatizados
├── scripts/            # Scripts de mantenimiento
├── docs_reorganizada/  # 📚 Documentación organizada
└── package.json        # Dependencias y scripts
```

---

## 🎮 FUNCIONALIDADES DISPONIBLES

### ✅ Implementadas y Probadas
- 🔐 **Autenticación completa** (registro, login, logout, recuperación)
- 👤 **Sistema de usuarios** con perfiles
- 🎒 **Inventario de personajes** y equipamiento
- ⚔️ **Sistema de combate** y mazmorras
- 💰 **Economía** (VAL, EVO, Energía)
- 🏆 **Sistema de ranking** competitivo
- 🏪 **Marketplace** P2P
- 📧 **Emails reales** con Gmail
- 🍪 **Cookies httpOnly** seguras

### 🔄 En Desarrollo
- 🤝 **Sistema de gremios**
- ⚔️ **PVP real-time**
- 🎯 **Misiones diarias**
- 🏟️ **Arena y torneos**

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "MongoDB connection failed"
```bash
# Verificar conexión a internet
ping google.com

# Verificar MongoDB URI en .env
cat .env | grep MONGODB

# Probar conexión manual
mongosh "tu-mongodb-uri"
```

### Error: "Port 8080 already in use"
```bash
# Matar proceso en el puerto
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# O cambiar puerto en .env
PORT=8081
```

### Error: "JWT secret not found"
```bash
# Generar JWT secret seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Actualizar .env
JWT_SECRET=tu_jwt_secret_generado
```

---

## 📚 DOCUMENTACIÓN RELACIONADA

### Próximos Pasos
- 📖 **[Arquitectura General](../01_BACKEND_CORE/ARQUITECTURA_BACKEND.md)** - Entender el sistema
- 🔧 **[API Reference Completa](../01_BACKEND_CORE/API_REFERENCE_COMPLETA.md)** - Endpoints disponibles
- 🎨 **[Integración Frontend](../02_FRONTEND_INTEGRATION/INTEGRACION_ANGULAR.md)** - Conectar con frontend

### Desarrollo Avanzado
- 🧪 **[Guía de Testing](../01_BACKEND_CORE/TESTING_GUIA.md)** - Estrategia de tests
- 🚀 **[Deployment](../05_DEPLOYMENT/DEPLOYMENT_RENDER.md)** - Producción
- 🔒 **[Seguridad](../04_SECURITY/AUDITORIA_SEGURIDAD.md)** - Auditorías

---

## 🎯 ¿QUÉ HACER AHORA?

### Si eres Backend Developer:
1. ✅ **Proyecto corriendo** ✓
2. 📖 **Lee:** Arquitectura Backend
3. 🔧 **Explora:** Código en `/src`
4. 🧪 **Ejecuta:** Tests disponibles

### Si eres Frontend Developer:
1. ✅ **API disponible** ✓
2. 📖 **Lee:** Integración Frontend
3. 🔧 **Crea:** Cliente API
4. 🎮 **Desarrolla:** Interfaz de usuario

### Si eres DevOps/Security:
1. ✅ **Entorno listo** ✓
2. 📖 **Lee:** Deployment y Seguridad
3. 🚀 **Configura:** CI/CD
4. 🔒 **Audita:** Vulnerabilidades

---

## 💬 SOPORTE

### Canales de Comunicación
- 📧 **Email:** equipo@valgame.com
- 💬 **Discord:** [Servidor de Valgame]
- 📋 **Issues:** [GitHub Issues]

### Documentos de Ayuda
- 🐛 **[Debugging](../01_BACKEND_CORE/DEBUGGING.md)** - Solución de problemas
- ❓ **[FAQ](../00_INICIO/FAQ.md)** - Preguntas frecuentes
- 📖 **[Glosario](../00_INICIO/GLOSARIO.md)** - Términos técnicos

---

## 🎉 ¡FELICITACIONES!

Has completado el setup básico del backend de Valgame. El servidor está corriendo y listo para desarrollo.

**¿Qué quieres hacer ahora?**

- 🔍 **Explorar la API** → Ve a `/docs_reorganizada/01_BACKEND_CORE/API_REFERENCE_COMPLETA.md`
- 🎨 **Integrar frontend** → Ve a `/docs_reorganizada/02_FRONTEND_INTEGRATION/`
- 🧪 **Ejecutar tests** → Corre `npm test`
- 🚀 **Deploy a producción** → Ve a `/docs_reorganizada/05_DEPLOYMENT/`

---

**⏰ Tiempo total:** 5 minutos  
**📅 Última actualización:** 20 de noviembre de 2025  
**👥 Mantenedor:** Equipo Valgame</content>
<parameter name="filePath">c:\Users\Haustman\Desktop\valgame-backend\docs_reorganizada\00_INICIO\GUIA_RAPIDA_SETUP.md