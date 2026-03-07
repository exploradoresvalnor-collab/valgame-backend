# Guía Completa: Implementación del Sistema de Equipos en Frontend

## Resumen
Esta guía proporciona la implementación completa del sistema de equipos en el frontend de Valgame, incluyendo configuración, tipos, hooks, componentes y estilos.

## 1. Configuración del Proyecto

### Estructura de Carpetas
```
frontend-valgame/
├── src/
│   ├── components/
│   │   ├── TeamBuilder.tsx
│   │   └── TeamBuilder.css
│   ├── hooks/
│   │   ├── useTeams.ts
│   │   └── useCharacters.ts
│   ├── types/
│   │   └── team.types.ts
│   ├── services/
│   │   └── api.service.ts
│   └── utils/
│       └── auth.utils.ts
├── .env
└── package.json
```

### Variables de Entorno (.env)
```bash
# Configuración de API
REACT_APP_API_URL=http://localhost:8080
VITE_API_URL=http://localhost:8080

# Configuración de autenticación (si usas JWT)
REACT_APP_JWT_SECRET=your_jwt_secret
```

### Dependencias (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "react-router-dom": "^6.20.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0"
  }
}
```

## 2. Utilidades de Autenticación

### src/utils/auth.utils.ts
```typescript
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
```

## 3. Servicio de API

### src/services/api.service.ts
```typescript
import { getAuthHeaders } from '../utils/auth.utils';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || 'http://localhost:8080';
  }

  private getFullUrl(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }

  async get(endpoint: string) {
    const url = this.getFullUrl(endpoint);
    console.log('[API] GET:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async post(endpoint: string, data: any) {
    const url = this.getFullUrl(endpoint);
    console.log('[API] POST:', url, data);

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async put(endpoint: string, data: any) {
    const url = this.getFullUrl(endpoint);
    console.log('[API] PUT:', url, data);

    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async delete(endpoint: string) {
    const url = this.getFullUrl(endpoint);
    console.log('[API] DELETE:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async patch(endpoint: string, data?: any) {
    const url = this.getFullUrl(endpoint);
    console.log('[API] PATCH:', url, data);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      ...(data && { body: JSON.stringify(data) }),
    });

    return this.handleResponse(response);
  }

  private async handleResponse(response: Response) {
    const data = await response.json();

    if (!response.ok) {
      console.error('[API] Error:', response.status, data);
      throw {
        status: response.status,
        message: data.message || data.error || 'Error en la API',
        data
      };
    }

    console.log('[API] Success:', data);
    return data;
  }
}

export const api = new ApiService();
```

## 4. Tipos TypeScript

### src/types/team.types.ts
```typescript
export interface TeamCharacter {
  _id: string;
  personajeId: string;
  nombre: string;
  rango: string;
  nivel: number;
  etapa: number;
  stats?: {
    salud: number;
    ataque: number;
    defensa: number;
  };
}

export interface Team {
  _id: string;
  userId: string;
  name: string;
  characters: TeamCharacter[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamDto {
  name: string;
  characters: string[]; // Array de character IDs
}

export interface UpdateTeamDto {
  name?: string;
  characters?: string[];
}

export interface TeamApiResponse {
  success: boolean;
  teams?: Team[];
  team?: Team;
  activeTeam?: Team;
  total?: number;
  message?: string;
  error?: string;
}
```

## 5. Hook para Personajes

### src/hooks/useCharacters.ts
```typescript
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.service';

export interface Character {
  _id: string;
  personajeId: string;
  nombre: string;
  rango: string;
  nivel: number;
  etapa: number;
  stats: {
    salud: number;
    ataque: number;
    defensa: number;
  };
}

interface UseCharactersReturn {
  characters: Character[];
  loading: boolean;
  error: string | null;
  getMyCharacters: () => Promise<void>;
  clearError: () => void;
}

export const useCharacters = (): UseCharactersReturn => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const getMyCharacters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/user-characters');
      setCharacters(response.characters || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener personajes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getMyCharacters();
  }, [getMyCharacters]);

  return {
    characters,
    loading,
    error,
    getMyCharacters,
    clearError,
  };
};
```

## 6. Hook para Equipos

### src/hooks/useTeams.ts
```typescript
import { useState, useEffect, useCallback } from 'react';
import { Team, CreateTeamDto, UpdateTeamDto, TeamApiResponse } from '../types/team.types';
import { api } from '../services/api.service';

interface UseTeamsReturn {
  teams: Team[];
  activeTeam: Team | null;
  loading: boolean;
  error: string | null;
  getMyTeams: () => Promise<void>;
  getActiveTeam: () => Promise<void>;
  createTeam: (data: CreateTeamDto) => Promise<Team | null>;
  updateTeam: (id: string, data: UpdateTeamDto) => Promise<Team | null>;
  deleteTeam: (id: string) => Promise<boolean>;
  activateTeam: (id: string) => Promise<boolean>;
  getTeamById: (id: string) => Promise<Team | null>;
  clearError: () => void;
}

export const useTeams = (): UseTeamsReturn => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const getMyTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/teams');
      setTeams(response.teams || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener equipos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getActiveTeam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/teams/active');
      setActiveTeam(response.activeTeam || null);
    } catch (err: any) {
      // Si no hay equipo activo, no es un error
      if (err.message?.includes('No hay equipo activo')) {
        setActiveTeam(null);
      } else {
        setError(err.message || 'Error al obtener equipo activo');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeam = useCallback(async (teamData: CreateTeamDto): Promise<Team | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/teams', teamData);

      if (response.team) {
        // Actualizar la lista de equipos
        await getMyTeams();
        // Si el equipo creado es activo, actualizar el equipo activo
        if (response.team.isActive) {
          setActiveTeam(response.team);
        }
        return response.team;
      }
      return null;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear equipo';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getMyTeams]);

  const updateTeam = useCallback(async (id: string, updateData: UpdateTeamDto): Promise<Team | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/api/teams/${id}`, updateData);

      if (response.team) {
        // Actualizar la lista de equipos
        await getMyTeams();
        // Si este equipo es el activo, actualizarlo
        if (response.team.isActive && activeTeam?._id === id) {
          setActiveTeam(response.team);
        }
        return response.team;
      }
      return null;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar equipo';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getMyTeams, activeTeam]);

  const deleteTeam = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(`/api/teams/${id}`);

      // Actualizar la lista de equipos
      await getMyTeams();
      // Si el equipo eliminado era el activo, limpiar el estado
      if (activeTeam?._id === id) {
        setActiveTeam(null);
      }
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar equipo';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getMyTeams, activeTeam]);

  const activateTeam = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await api.patch(`/api/teams/${id}/activate`);

      // Actualizar equipos y equipo activo
      await Promise.all([getMyTeams(), getActiveTeam()]);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al activar equipo';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getMyTeams, getActiveTeam]);

  const getTeamById = useCallback(async (id: string): Promise<Team | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/teams/${id}`);
      return response.team || null;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener equipo';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar equipos al inicializar
  useEffect(() => {
    getMyTeams();
    getActiveTeam();
  }, [getMyTeams, getActiveTeam]);

  return {
    teams,
    activeTeam,
    loading,
    error,
    getMyTeams,
    getActiveTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    activateTeam,
    getTeamById,
    clearError,
  };
};
```

## 7. Componente TeamBuilder

### src/components/TeamBuilder.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { useTeams } from '../hooks/useTeams';
import { useCharacters } from '../hooks/useCharacters';
import { Team, TeamCharacter, CreateTeamDto } from '../types/team.types';
import './TeamBuilder.css';

const TeamBuilder: React.FC = () => {
  const { teams, activeTeam, loading: teamsLoading, error: teamsError, createTeam, activateTeam, deleteTeam } = useTeams();
  const { characters, loading: charsLoading } = useCharacters();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || selectedCharacters.length === 0) {
      alert('Por favor ingresa un nombre y selecciona al menos un personaje');
      return;
    }

    setCreating(true);
    try {
      const teamData: CreateTeamDto = {
        name: newTeamName.trim(),
        characters: selectedCharacters,
      };

      const newTeam = await createTeam(teamData);
      if (newTeam) {
        setNewTeamName('');
        setSelectedCharacters([]);
        setShowCreateForm(false);
        alert('Equipo creado exitosamente!');
      }
    } catch (err) {
      alert('Error al crear el equipo');
    } finally {
      setCreating(false);
    }
  };

  const handleActivateTeam = async (teamId: string) => {
    try {
      const success = await activateTeam(teamId);
      if (success) {
        alert('Equipo activado exitosamente!');
      }
    } catch (err) {
      alert('Error al activar el equipo');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
      return;
    }

    try {
      const success = await deleteTeam(teamId);
      if (success) {
        alert('Equipo eliminado exitosamente!');
      }
    } catch (err) {
      alert('Error al eliminar el equipo');
    }
  };

  const toggleCharacterSelection = (characterId: string) => {
    setSelectedCharacters(prev =>
      prev.includes(characterId)
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    );
  };

  if (teamsLoading || charsLoading) {
    return <div className="team-builder-loading">Cargando equipos...</div>;
  }

  if (teamsError) {
    return <div className="team-builder-error">Error: {teamsError}</div>;
  }

  return (
    <div className="team-builder">
      <div className="team-builder-header">
        <h2>Gestión de Equipos</h2>
        <button
          className="create-team-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancelar' : 'Crear Equipo'}
        </button>
      </div>

      {activeTeam && (
        <div className="active-team-section">
          <h3>Equipo Activo</h3>
          <div className="team-card active">
            <h4>{activeTeam.name}</h4>
            <div className="team-characters">
              {activeTeam.characters.map((char: TeamCharacter) => (
                <div key={char._id} className="character-item">
                  <span className="character-name">{char.nombre}</span>
                  <span className="character-level">Nv. {char.nivel}</span>
                  <span className="character-rank">{char.rango}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="create-team-form">
          <h3>Crear Nuevo Equipo</h3>
          <div className="form-group">
            <label>Nombre del Equipo:</label>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Ej: Equipo Élite"
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label>Seleccionar Personajes (máx. 5):</label>
            <div className="characters-selection">
              {characters.map((char) => (
                <div
                  key={char._id}
                  className={`character-option ${selectedCharacters.includes(char._id) ? 'selected' : ''}`}
                  onClick={() => toggleCharacterSelection(char._id)}
                >
                  <span className="character-name">{char.nombre}</span>
                  <span className="character-level">Nv. {char.nivel}</span>
                  <span className="character-rank">{char.rango}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              onClick={handleCreateTeam}
              disabled={creating || selectedCharacters.length === 0}
              className="create-btn"
            >
              {creating ? 'Creando...' : 'Crear Equipo'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="cancel-btn"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="teams-list">
        <h3>Mis Equipos ({teams.length})</h3>
        {teams.length === 0 ? (
          <p>No tienes equipos creados. ¡Crea tu primer equipo!</p>
        ) : (
          <div className="teams-grid">
            {teams.map((team: Team) => (
              <div key={team._id} className={`team-card ${team.isActive ? 'active' : ''}`}>
                <h4>{team.name}</h4>
                <div className="team-characters">
                  {team.characters.map((char: TeamCharacter) => (
                    <div key={char._id} className="character-item">
                      <span className="character-name">{char.nombre}</span>
                      <span className="character-level">Nv. {char.nivel}</span>
                      <span className="character-rank">{char.rango}</span>
                    </div>
                  ))}
                </div>
                <div className="team-actions">
                  {!team.isActive && (
                    <button
                      onClick={() => handleActivateTeam(team._id)}
                      className="activate-btn"
                    >
                      Activar
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTeam(team._id)}
                    className="delete-btn"
                    disabled={team.isActive}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamBuilder;
```

## 8. Estilos CSS

### src/components/TeamBuilder.css
```css
.team-builder {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.team-builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.team-builder-header h2 {
  margin: 0;
  color: #333;
}

.create-team-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.create-team-btn:hover {
  background: #45a049;
}

.active-team-section {
  margin-bottom: 30px;
}

.active-team-section h3 {
  color: #333;
  margin-bottom: 15px;
}

.team-card {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background: white;
}

.team-card.active {
  border-color: #4CAF50;
  background: #f8fff8;
}

.team-card h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.team-characters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.character-item {
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.character-name {
  font-weight: bold;
  margin-right: 8px;
}

.character-level, .character-rank {
  color: #666;
  margin-right: 8px;
}

.team-actions {
  display: flex;
  gap: 10px;
}

.activate-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.activate-btn:hover {
  background: #1976D2;
}

.delete-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background: #d32f2f;
}

.delete-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.create-team-form {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.create-team-form h3 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.characters-selection {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.character-option {
  border: 2px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.character-option:hover {
  border-color: #4CAF50;
  background: #f8fff8;
}

.character-option.selected {
  border-color: #4CAF50;
  background: #e8f5e8;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.create-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.create-btn:hover:not(:disabled) {
  background: #45a049;
}

.create-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background: #757575;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.cancel-btn:hover {
  background: #616161;
}

.teams-list h3 {
  color: #333;
  margin-bottom: 15px;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.team-builder-loading, .team-builder-error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.team-builder-error {
  color: #f44336;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 4px;
}
```

## 9. Integración en la Aplicación

### src/App.tsx (o tu componente principal)
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TeamBuilder from './components/TeamBuilder';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/teams" element={<TeamBuilder />} />
          {/* Otras rutas */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

### src/index.tsx
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## 10. Configuración de TypeScript

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
```

## 11. Archivo de Inicio (index.html)

### public/index.html
```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Valgame - Sistema de Equipos" />
    <title>Valgame - Equipos</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

## 12. Funcionalidades Implementadas

- ✅ **Ver equipo activo** creado automáticamente durante onboarding
- ✅ **Listar todos los equipos** del usuario
- ✅ **Crear nuevos equipos** con selección de personajes
- ✅ **Activar/desactivar equipos** (solo uno activo a la vez)
- ✅ **Eliminar equipos** (excepto el activo)
- ✅ **Interfaz responsive** y amigable
- ✅ **Validación de formularios** y datos
- ✅ **Manejo de errores** y estados de carga
- ✅ **Autenticación JWT** integrada
- ✅ **Integración completa** con el backend

## 13. Endpoints del Backend Utilizados

- `GET /api/teams` - Lista equipos del usuario
- `GET /api/teams/active` - Obtiene equipo activo
- `POST /api/teams` - Crea nuevo equipo
- `GET /api/teams/:id` - Obtiene equipo específico
- `PUT /api/teams/:id` - Actualiza equipo
- `DELETE /api/teams/:id` - Elimina equipo
- `PATCH /api/teams/:id/activate` - Activa equipo
- `GET /api/user-characters` - Lista personajes del usuario

## 14. Comandos para Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests (si los tienes)
npm test
```

## 15. Solución de Problemas Comunes

### Error: "Failed to fetch" o "Network Error"
- Verificar que el backend esté corriendo en `http://localhost:8080`
- Verificar que `REACT_APP_API_URL` esté configurado correctamente

### Error: "401 Unauthorized"
- Verificar que el token JWT esté guardado en localStorage
- Verificar que el token no haya expirado

### Error: "400 Bad Request" al crear equipo
- Verificar que los IDs de personajes sean válidos (ObjectIds de MongoDB)
- Verificar que el usuario tenga esos personajes

### Error: "500 Internal Server Error"
- Verificar logs del backend para detalles específicos
- Verificar que la base de datos esté conectada

Esta implementación proporciona un sistema completo de gestión de equipos integrado con tu backend existente. Los usuarios pueden crear, gestionar y activar equipos de manera intuitiva mientras el sistema mantiene la lógica de un solo equipo activo a la vez.</content>
<parameter name="filePath">c:\Users\Usuario\Desktop\trabajo\Valnor-full\gui a de ejempli\valgame-backend\GUIA_COMPLETA_FRONTEND_EQUIPOS.md