# Solución: Error 500 al Crear Equipo

## Problemas Identificados

### 1. URL de API Incorrecta
- **Actual**: `http://localhost:5173/api/teams` (puerto del frontend)
- **Correcta**: `http://localhost:8080/api/teams` (puerto del backend)

### 2. Error 500 en Backend
El error cambió de 400 a 500, lo que significa que ahora llega al backend pero falla internamente.

## Soluciones

### 1. Configurar URL de API Correcta

#### En tu proyecto de React/Vite, crea o modifica `.env`:

```bash
# Para React
REACT_APP_API_URL=http://localhost:8080

# Para Vite
VITE_API_URL=http://localhost:8080
```

#### En tu servicio de API (`api.service.ts`):

```typescript
// Configuración correcta de base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || 'http://localhost:8080';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Asegurar que todas las llamadas usen la URL correcta
  private getFullUrl(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }

  async post(endpoint: string, data: any) {
    const url = this.getFullUrl(endpoint);
    console.log('API Call to:', url); // Para debugging

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(data)
    });
  }
}
```

### 2. Verificar que el Backend esté Corriendo

Asegúrate de que el backend esté activo en el puerto 8080:

```bash
cd valgame-backend
npm run dev
```

Deberías ver: `[API] Servidor corriendo en puerto 8080`

### 3. Debugging del Error 500

#### Agregar logging en el backend

En `src/controllers/teams.controller.ts`, agrega más logs:

```typescript
export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    logToFile('[CREATE-TEAM] Starting team creation');
    const userId = req.userId;
    logToFile(`[CREATE-TEAM] userId: ${userId}`);

    // ... existing code ...

    // Agregar log antes de crear el equipo
    logToFile(`[CREATE-TEAM] About to create team with characters: ${JSON.stringify(characters)}`);

    const team = await Team.create({
      userId: new Types.ObjectId(userId),
      name,
      characters: characters.map(id => new Types.ObjectId(id))
    });

    logToFile(`[CREATE-TEAM] Team created successfully: ${team._id}`);

    // ... rest of code ...
  } catch (error: any) {
    logToFile(`[CREATE-TEAM] Error: ${error.message}`);
    logToFile(`[CREATE-TEAM] Stack: ${error.stack}`);
    console.error('[CREATE-TEAM] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al crear equipo',
      details: error.message
    });
  }
};
```

#### Revisar logs del backend

Después de intentar crear el equipo, revisa los logs en `logs/teams.log` para ver dónde falla exactamente.

### 4. Verificar Datos Enviados

En tu frontend, antes de enviar la petición, verifica los datos:

```typescript
// En team.service.ts o donde creas el equipo
const createTeam = async (name: string, characterIds: string[]) => {
  console.log('Creating team with:', { name, characterIds });

  // Validar que los IDs sean ObjectIds válidos
  const invalidIds = characterIds.filter(id => !/^[0-9a-fA-F]{24}$/.test(id));
  if (invalidIds.length > 0) {
    throw new Error(`IDs inválidos: ${invalidIds.join(', ')}`);
  }

  return api.post('/api/teams', {
    name: name.trim(),
    characters: characterIds
  });
};
```

### 5. Verificar Autenticación

Asegúrate de que el token JWT sea válido:

```typescript
// En api.service.ts
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};
```

## Pasos para Resolver

1. **Configurar URL correcta** en `.env` del frontend
2. **Reiniciar el frontend** para que tome la nueva configuración
3. **Verificar que el backend esté corriendo** en puerto 8080
4. **Agregar logs** en el backend para identificar el error exacto
5. **Revisar logs** después de intentar crear el equipo
6. **Verificar autenticación** y datos enviados

## Verificación

Después de aplicar los cambios, deberías ver en la consola del navegador:
- `API Call to: http://localhost:8080/api/teams` (URL correcta)
- Respuesta exitosa del backend en lugar del error 500

Si el error persiste, los logs del backend te dirán exactamente dónde está fallando la creación del equipo.</content>
<parameter name="filePath">c:\Users\Usuario\Desktop\trabajo\Valnor-full\gui a de ejempli\valgame-backend\SOLUCION_ERROR_500_EQUIPOS.md