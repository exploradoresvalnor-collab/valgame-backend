// Usar fetch global de Node.js (disponible en v18+)

const API_BASE = 'http://localhost:8080';

async function testTeamsSystem() {
  try {
    console.log('=== PRUEBA DEL SISTEMA DE EQUIPOS ===\n');

    // 1. Login de desarrollo
    console.log('1. HACIENDO LOGIN DE DESARROLLO...');
    const loginResponse = await fetch(`${API_BASE}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const { token, user } = loginData;
    console.log('✅ Login exitoso');
    console.log('Token obtenido:', token.substring(0, 50) + '...');
    console.log('Usuario:', user.email);
    console.log('Personajes:', user.personajes?.length || 0);
    console.log('');

    // 2. Obtener personajes del usuario
    console.log('2. OBTENIENDO PERSONAJES DEL USUARIO...');
    const charactersResponse = await fetch(`${API_BASE}/api/user-characters`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!charactersResponse.ok) {
      throw new Error(`Get characters failed: ${charactersResponse.status} ${charactersResponse.statusText}`);
    }

    const charactersData = await charactersResponse.json();
    const characters = charactersData.characters || [];
    console.log('✅ Personajes obtenidos:', characters.length);
    characters.forEach((char, index) => {
      console.log(`  ${index + 1}. ${char.nombre} (ID: ${char._id}) - Nivel ${char.nivel} ${char.rango}`);
    });
    console.log('');

    if (characters.length === 0) {
      console.log('❌ No hay personajes disponibles para crear equipos');
      return;
    }

    // 3. Crear un equipo
    console.log('3. CREANDO EQUIPO...');
    const teamData = {
      name: 'Equipo de Prueba',
      characters: characters.slice(0, 2).map(c => c._id) // Usar los primeros 2 personajes
    };

    console.log('Datos del equipo:', JSON.stringify(teamData, null, 2));

    const createTeamResponse = await fetch(`${API_BASE}/api/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(teamData)
    });

    if (!createTeamResponse.ok) {
      const errorData = await createTeamResponse.json();
      throw new Error(`Create team failed: ${createTeamResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const createTeamData = await createTeamResponse.json();
    console.log('✅ Equipo creado exitosamente');
    console.log('Equipo:', JSON.stringify(createTeamData.team, null, 2));
    console.log('');

    // 4. Obtener equipos del usuario
    console.log('4. OBTENIENDO EQUIPOS DEL USUARIO...');
    const teamsResponse = await fetch(`${API_BASE}/api/teams`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!teamsResponse.ok) {
      throw new Error(`Get teams failed: ${teamsResponse.status} ${teamsResponse.statusText}`);
    }

    const teamsData = await teamsResponse.json();
    const teams = teamsData.teams || [];
    console.log('✅ Equipos obtenidos:', teams.length);
    teams.forEach((team, index) => {
      console.log(`  ${index + 1}. ${team.name} - Personajes: ${team.characters?.length || 0}`);
    });
    console.log('');

    console.log('\n=== PRUEBA COMPLETADA EXITOSAMENTE ===');

  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:');
    console.error('Error:', error.message);
  }
}

// Ejecutar la prueba
testTeamsSystem();