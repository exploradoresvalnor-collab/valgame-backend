const fs = require('fs');
const path = 'c:/Users/Haustman/Desktop/valgame-backend/docs_reorganizada/02_FRONTEND_INTEGRATION/Valnor-guia.md';

// Leer archivo
let content = fs.readFileSync(path, 'utf8');

// Encontrar el inicio de la sección 4
const section4Start = content.indexOf('### 4. Verificación (Link de Correo)');
const section5Start = content.indexOf('### 5. Login');

if (section4Start === -1 || section5Start === -1) {
  console.log('❌ No se encontraron las secciones');
  process.exit(1);
}

// Extraer todo lo que hay antes y después
const before = content.substring(0, section4Start);
const after = content.substring(section5Start);

// Nuevo contenido
const newSection = `### 4. Verificación (Link de Correo)

**Componentes Requeridos:**
- \`VerifyEmailComponent\` (página principal)
- \`VerifyingComponent\` (estado de espera)
- \`VerificationSuccessComponent\` (confirmación)

**Servicios Requeridos:**
- \`AuthService.verifyEmail()\`
- \`AuthService.resendVerificationEmail()\`

**Flujo de Verificación:**

1. **Usuario accede a link del email:** \`https://valgame.com/verify/TOKEN\`
2. **Frontend extrae token de URL**
3. **Frontend envía GET al backend:** \`GET /api/auth/verify/TOKEN\`
4. **Backend valida token y activa usuario**
5. **Backend entrega automáticamente "Paquete Pionero"**
6. **Frontend muestra confirmación con items recibidos**

**Componentes Necesarios:**
- VerifyEmailComponent para manejar el flujo de verificación
- Manejo de estados: pending, loading, success, error
- Visualización del Paquete Pionero (VAL, Boletos, EVO, Items)
- Opción para reenviar email si es necesario

**Endpoint Backend:**

\`\`\`
GET /api/auth/verify/:token
\`\`\`

**Respuesta Exitosa (200):**
\`\`\`json
{
  "ok": true,
  "message": "Email verificado exitosamente",
  "user": {
    "id": "user_id_here",
    "username": "player1",
    "email": "user@example.com",
    "isVerified": true
  },
  "pioneerPackage": {
    "val": 100,
    "boletos": 10,
    "evo": 2,
    "items": [
      { "name": "Poción de Vida", "quantity": 3 },
      { "name": "Espada de Principiante", "quantity": 1 }
    ]
  }
}
\`\`\`

**Respuesta Error (400):**
\`\`\`json
{
  "ok": false,
  "error": "Token inválido o expirado",
  "code": "INVALID_TOKEN"
}
\`\`\`

**Manejo de Errores:**

| Código HTTP | Acción |
|-------------|--------|
| **200** | Mostrar paquete pionero y redirigir a dashboard |
| **400** | Ofrecer reenvío o nuevo registro |
| **409** | Redirigir a login |
| **429** | Mostrar cooldown de reenvío |
| **500** | Mensaje genérico + soporte |

**WebSocket Events:** Ninguno en esta fase

**Notas Técnicas:**
- El paquete pionero se entrega **automáticamente** al verificar email
- El token tiene validez de **1 hora**
- Máximo **3 reenvíos por hora** (rate limit)
- Se recomienda guardar email en sessionStorage para facilitar reenvío

---

`;

// Guardar nuevo archivo
const newContent = before + newSection + after;
fs.writeFileSync(path, newContent, 'utf8');

console.log('✅ Reemplazo completado exitosamente');
console.log(`Section 4 starts at char: ${section4Start}`);
console.log(`Section 5 starts at char: ${section5Start}`);
