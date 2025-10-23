# 🔐 Guía de Rotación de Secretos y Limpieza de Git

## ⚠️ PROBLEMA CRÍTICO DETECTADO

El archivo `.env` fue rastreado en Git y contiene información sensible. Aunque ahora está en `.gitignore`, **su historial permanece en Git**, exponiendo:

- `MONGODB_URI` (credenciales de base de datos)
- `JWT_SECRET` (clave de firma de tokens)
- `SMTP_HOST`, `SMTP_PORT`, `EMAIL_USER`, `EMAIL_PASS` (credenciales de correo)

---

## 📋 PASOS OBLIGATORIOS

### **1. Rotar Todos los Secretos**

#### A. JWT_SECRET
```bash
# Generar nuevo secreto (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# O usando OpenSSL
openssl rand -hex 64
```

**Actualizar en `.env`:**
```env
JWT_SECRET=<NUEVO_SECRET_GENERADO>
```

⚠️ **IMPORTANTE**: Esto invalidará todos los tokens JWT existentes. Los usuarios deberán volver a iniciar sesión.

---

#### B. MongoDB URI
1. **Ir a MongoDB Atlas Dashboard**
2. **Database Access** → Seleccionar usuario → **Edit**
3. **Change Password** → Generar nueva contraseña
4. **Actualizar `.env`** con la nueva URI

```env
MONGODB_URI=mongodb+srv://<usuario>:<NUEVA_PASSWORD>@cluster.mongodb.net/<database>?retryWrites=true&w=majority
```

---

#### C. Credenciales SMTP
1. **Acceder al panel de tu proveedor de correo**
2. **Generar nueva contraseña de aplicación**
3. **Actualizar `.env`:**

```env
SMTP_HOST=smtp.tudominio.com
SMTP_PORT=465
EMAIL_USER=noreply@tudominio.com
EMAIL_PASS=<NUEVA_PASSWORD_APLICACION>
```

---

### **2. Limpiar `.env` del Historial de Git**

#### Opción A: BFG Repo-Cleaner (Recomendado)

```bash
# 1. Descargar BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# 2. Hacer backup del repositorio
git clone --mirror https://github.com/tu-usuario/valgame-backend.git valgame-backend-backup.git

# 3. Limpiar el archivo .env
java -jar bfg.jar --delete-files .env valgame-backend-backup.git

# 4. Limpiar referencias
cd valgame-backend-backup.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Forzar push (⚠️ DESTRUCTIVO)
git push --force
```

---

#### Opción B: git filter-branch (Manual)

```bash
# ⚠️ ADVERTENCIA: Esto reescribe TODO el historial de Git

# 1. Backup
git clone https://github.com/tu-usuario/valgame-backend.git valgame-backend-backup

# 2. Eliminar .env del historial
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Limpiar referencias
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. Forzar push (⚠️ DESTRUCTIVO - notifica a tu equipo)
git push origin --force --all
git push origin --force --tags
```

---

### **3. Verificar que `.env` Está Ignorado**

```bash
# Verificar que .env está en .gitignore
cat .gitignore | grep .env

# Verificar que .env NO está en staging
git status

# Si aparece, eliminarlo:
git rm --cached .env
git commit -m "Remove .env from tracking"
```

---

### **4. Notificar al Equipo**

Si trabajas en equipo, **TODOS** deben:

```bash
# 1. Hacer backup de su trabajo local
git stash

# 2. Forzar actualización del repositorio limpio
git fetch origin
git reset --hard origin/main  # o la rama principal

# 3. Recuperar cambios locales
git stash pop
```

---

## 🔒 MEJORES PRÁCTICAS FUTURAS

### **1. Usar Variables de Entorno en Producción**

**Nunca** subir archivos `.env` a producción. Usar:

- **Heroku**: `heroku config:set JWT_SECRET=xxx`
- **AWS**: AWS Secrets Manager
- **Azure**: Azure Key Vault
- **Vercel/Netlify**: Variables de entorno en el dashboard

---

### **2. Template de `.env`**

Crear `.env.example` (SIN valores reales):

```env
# Database
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/<database>

# JWT
JWT_SECRET=<generar_con_crypto.randomBytes(64).toString('hex')>

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=465
EMAIL_USER=noreply@example.com
EMAIL_PASS=<password_de_aplicacion>

# Server
PORT=8080
NODE_ENV=development
```

---

### **3. Pre-commit Hook**

Crear `.git/hooks/pre-commit`:

```bash
#!/bin/sh
if git diff --cached --name-only | grep -q "^\.env$"; then
    echo "❌ ERROR: Intentando commitear .env"
    echo "Por favor, remuévelo del staging:"
    echo "  git reset HEAD .env"
    exit 1
fi
```

```bash
chmod +x .git/hooks/pre-commit
```

---

### **4. Escaneo de Secretos**

Instalar `git-secrets`:

```bash
# macOS
brew install git-secrets

# Linux
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
make install

# Configurar
git secrets --install
git secrets --register-aws
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Nuevo `JWT_SECRET` generado y actualizado
- [ ] Password de MongoDB rotada
- [ ] Credenciales SMTP actualizadas
- [ ] `.env` eliminado del historial de Git
- [ ] `.env` confirmado en `.gitignore`
- [ ] `.env.example` creado (sin valores reales)
- [ ] Equipo notificado (si aplica)
- [ ] Pre-commit hook instalado
- [ ] Usuarios notificados de re-login (por JWT_SECRET nuevo)

---

## 🆘 EN CASO DE EMERGENCIA

Si detectas que secretos fueron expuestos públicamente:

1. **Rotar INMEDIATAMENTE** todos los secretos
2. **Revisar logs** de acceso a MongoDB/servicios
3. **Cambiar contraseñas** de cuentas administrativas
4. **Monitorear** actividad sospechosa
5. **Considerar** notificar a usuarios si hubo brecha

---

## 📞 CONTACTO

Para dudas sobre seguridad, contactar al equipo de DevOps o al líder técnico del proyecto.

**Última actualización**: 2025-01-07
