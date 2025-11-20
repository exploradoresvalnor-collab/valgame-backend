# 🧪 GUÍA DE TESTING - Valgame Backend

**Última actualización:** 20 de noviembre de 2025  
**Tiempo de lectura:** 20 minutos

---

## 🎯 VISIÓN GENERAL

Guía completa para testing del backend Valgame, incluyendo estrategias de testing, herramientas, ejemplos y mejores prácticas.

---

## 🏗️ ESTRATEGIA DE TESTING

### Pirámide de Tests
```
┌─────────────────────────────────┐
│         🏠 E2E TESTS            │
│   • Flujos completos de usuario │
│   • Integración full-stack     │
│   • Base de datos real         │
│   • ~5-10 tests                │
└─────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│     🔗 INTEGRATION TESTS       │
│   • API endpoints completos    │
│   • Base de datos de test      │
│   • Servicios externos mocks   │
│   • ~20-30 tests               │
└─────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│       ⚙️ UNIT TESTS            │
│   • Funciones individuales     │
│   • Lógica de negocio          │
│   • Validaciones               │
│   • ~100-150 tests             │
└─────────────────────────────────┘
```

### Cobertura Objetivo
- **Unit Tests:** 70-80%
- **Integration Tests:** 15-20%
- **E2E Tests:** 5-10%
- **Total:** 85%+ cobertura

---

## 🛠️ HERRAMIENTAS DE TESTING

### Stack Principal
```json
{
  "testing": {
    "framework": "Jest",
    "assertions": "Jest expect",
    "http_testing": "Supertest",
    "database": "MongoDB Memory Server",
    "mocks": "Jest mocks",
    "coverage": "Jest coverage"
  }
}
```

### Dependencias de Testing
```json
// package.json
{
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/supertest": "^2.0.12",
    "jest": "^29.5.0",
    "mongodb-memory-server": "^8.12.0",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0"
  }
}
```

---

## ⚙️ CONFIGURACIÓN DE TESTING

### Jest Configuration (`jest.config.cjs`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/database/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000
};
```

### Setup Global (`tests/setup.ts`)
```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../src/app';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Iniciar MongoDB en memoria
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Conectar mongoose
  await mongoose.connect(mongoUri);

  // Configurar app de test
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret';
});

afterAll(async () => {
  // Cerrar conexiones
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  // Limpiar base de datos entre tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

---

## 🧪 EJEMPLOS DE TESTS

### Unit Test - Servicio de Energía
```typescript
// tests/unit/services/energy.service.test.ts
import { energyService } from '../../../src/services/energy.service';
import { User } from '../../../src/models/User';

describe('EnergyService', () => {
  describe('consumeEnergy', () => {
    it('should consume energy successfully', async () => {
      // Arrange
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        energia: 100,
        energiaMaxima: 100
      });

      // Act
      const result = await energyService.consumeEnergy(user._id, 20);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newEnergy).toBe(80);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.energia).toBe(80);
    });

    it('should fail when insufficient energy', async () => {
      // Arrange
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        energia: 10,
        energiaMaxima: 100
      });

      // Act & Assert
      await expect(
        energyService.consumeEnergy(user._id, 20)
      ).rejects.toThrow('Energía insuficiente');
    });

    it('should reset energy when expired', async () => {
      // Arrange
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        energia: 50,
        energiaMaxima: 100,
        ultimoReinicioEnergia: yesterday
      });

      // Act
      const result = await energyService.consumeEnergy(user._id, 10);

      // Assert
      expect(result.newEnergy).toBe(90); // 100 - 10 (reseteado)
    });
  });
});
```

### Integration Test - API de Autenticación
```typescript
// tests/integration/auth.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import { User } from '../../src/models/User';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.token).toBeDefined();

      // Verificar en base de datos
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.username).toBe(userData.username);
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'TestPass123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with duplicate email', async () => {
      // Crear usuario primero
      await User.create({
        username: 'existing',
        email: 'test@example.com',
        password: 'hashedpassword'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'test@example.com',
          password: 'TestPass123!'
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Crear usuario para login
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'TestPass123!'
        });
    });

    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPass123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPass123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
```

### E2E Test - Flujo Completo de Juego
```typescript
// tests/e2e/game-flow.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import { User } from '../../src/models/User';
import { Character } from '../../src/models/Character';

describe('Game Flow E2E', () => {
  let authToken: string;
  let userId: string;
  let characterId: string;

  beforeAll(async () => {
    // 1. Registrar usuario
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'gametest',
        email: 'game@example.com',
        password: 'GameTest123!'
      })
      .expect(201);

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;

    // 2. Crear personaje
    const baseCharacter = await request(app)
      .get('/api/characters/base')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const characterResponse = await request(app)
      .post('/api/characters')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        baseCharacterId: baseCharacter.body.data.characters[0].id
      })
      .expect(201);

    characterId = characterResponse.body.data.character.id;
  });

  it('should complete full game flow', async () => {
    // 3. Ver perfil inicial
    const profileResponse = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(profileResponse.body.data.user.val).toBe(1000);
    expect(profileResponse.body.data.user.energia).toBe(100);

    // 4. Entrar a mazmorra
    const dungeonResponse = await request(app)
      .get('/api/dungeons')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const dungeonId = dungeonResponse.body.data.dungeons[0].id;

    const combatResponse = await request(app)
      .post(`/api/dungeons/${dungeonId}/enter`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ characterId })
      .expect(200);

    expect(combatResponse.body.success).toBe(true);
    expect(['victoria', 'derrota']).toContain(combatResponse.body.data.result);

    // 5. Verificar cambios
    const updatedProfile = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Energía debería haber disminuido
    expect(updatedProfile.body.data.user.energia).toBeLessThan(100);

    // Personaje debería tener experiencia
    const character = await request(app)
      .get(`/api/characters/${characterId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(character.body.data.character.experiencia).toBeGreaterThanOrEqual(0);
  });

  it('should handle marketplace transaction', async () => {
    // 6. Crear anuncio en marketplace
    const equipment = await request(app)
      .get('/api/equipment')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const listingResponse = await request(app)
      .post('/api/marketplace')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        itemId: equipment.body.data.equipment[0].id,
        precio: 100
      })
      .expect(201);

    const listingId = listingResponse.body.data.listing.id;

    // 7. Crear segundo usuario para comprar
    const buyerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'buyertest',
        email: 'buyer@example.com',
        password: 'BuyerTest123!'
      })
      .expect(201);

    const buyerToken = buyerResponse.body.data.token;

    // 8. Realizar compra
    const buyResponse = await request(app)
      .post(`/api/marketplace/${listingId}/buy`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(buyResponse.body.success).toBe(true);

    // 9. Verificar transacción
    const sellerProfile = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(sellerProfile.body.data.user.val).toBe(1100); // 1000 + 100

    const buyerProfile = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(buyerProfile.body.data.user.val).toBe(900); // 1000 - 100
  });
});
```

---

## 🏃‍♂️ EJECUCIÓN DE TESTS

### Comandos Básicos
```bash
# Ejecutar todos los tests
npm test

# Ejecutar con coverage
npm run test:coverage

# Ejecutar tests específicos
npm test -- auth.test.ts
npm test -- --testNamePattern="should register user"

# Ejecutar en modo watch
npm run test:watch

# Ejecutar solo unit tests
npm run test:unit

# Ejecutar solo integration tests
npm run test:integration

# Ejecutar solo E2E tests
npm run test:e2e
```

### Scripts en package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e",
    "test:ci": "jest --coverage --watchAll=false --passWithNoTests"
  }
}
```

---

## 📊 COBERTURA DE TESTS

### Reporte de Cobertura
```bash
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
src/controllers/   |     100 |      100 |     100 |     100 |                   
src/services/      |      95 |       90 |      95 |      95 | 45-47, 102       
src/models/        |     100 |      100 |     100 |     100 |                   
src/utils/         |      90 |       85 |      90 |      90 | 12, 34-36        
src/middlewares/   |      95 |       95 |      95 |      95 | 78                
-------------------|---------|----------|---------|---------|-------------------
All files          |    96.5 |     94.2 |    96.8 |    96.5 |                   
-------------------|---------|----------|---------|---------|-------------------
```

### Mejora de Cobertura
```typescript
// Para líneas no cubiertas, agregar tests específicos
describe('Edge Cases', () => {
  it('should handle null input', () => {
    expect(() => service.method(null)).toThrow('Input cannot be null');
  });

  it('should handle empty array', () => {
    const result = service.processArray([]);
    expect(result).toEqual([]);
  });
});
```

---

## 🐛 DEBUGGING DE TESTS

### Debugging con VS Code
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceRoot}/node_modules/.bin/jest",
      "args": ["--runInBand", "--testNamePattern", "should register user"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Logging en Tests
```typescript
// Para debugging, agregar logs temporales
describe('Debug Test', () => {
  it('should debug step by step', () => {
    console.log('Starting test...');

    const result = someFunction(input);
    console.log('Result:', result);

    expect(result).toBe(expected);
  });
});
```

### Tests Flaky
```typescript
// Para tests inestables, agregar retries
describe('Flaky Test', () => {
  jest.retryTimes(3);

  it('should eventually pass', async () => {
    // Test que puede fallar por timing
    await unstableAsyncOperation();
    expect(true).toBe(true);
  });
});
```

---

## 🔄 MOCKS Y STUBS

### Mock de Servicios Externos
```typescript
// Mock de email service
jest.mock('../../src/services/email.service', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendPasswordReset: jest.fn().mockResolvedValue(true)
}));

// Mock de JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked_token'),
  verify: jest.fn().mockReturnValue({ userId: 'mock_user_id' })
}));
```

### Mock de Base de Datos
```typescript
// Para tests que no necesitan DB real
const mockUser = {
  _id: 'mock_id',
  username: 'mockuser',
  email: 'mock@example.com'
};

jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
```

---

## 🚀 CI/CD INTEGRATION

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Pre-commit Hooks
```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test:unit
```

---

## 📋 CHECKLIST DE TESTING

### Antes de Commit
- [ ] Tests pasan localmente
- [ ] Cobertura > 85%
- [ ] No hay tests skipped
- [ ] Linting pasa
- [ ] Tipos TypeScript correctos

### Para Nuevas Features
- [ ] Tests unitarios para lógica nueva
- [ ] Tests de integración para endpoints nuevos
- [ ] Tests E2E para flujos críticos
- [ ] Documentación de tests actualizada

### Para Bugs
- [ ] Test que reproduce el bug
- [ ] Test que verifica el fix
- [ ] Regression tests para casos similares

---

## 📊 MÉTRICAS DE CALIDAD

### Objetivos de Calidad
- **Code Coverage:** > 85%
- **Test Execution Time:** < 2 minutos
- **Flaky Tests:** 0%
- **Test-to-Code Ratio:** 1:1 mínimo

### Monitoreo Continuo
```typescript
// Script para métricas de calidad
const { execSync } = require('child_process');

function getTestMetrics() {
  const coverage = execSync('npm run test:coverage --silent', { encoding: 'utf8' });
  const lines = coverage.split('\n');
  const allFilesLine = lines.find(line => line.includes('All files'));

  if (allFilesLine) {
    const matches = allFilesLine.match(/(\d+\.\d+)/g);
    return {
      statements: parseFloat(matches[0]),
      branches: parseFloat(matches[1]),
      functions: parseFloat(matches[2]),
      lines: parseFloat(matches[3])
    };
  }
}
```

---

## 🐛 TESTS PROBLEMÁTICOS

### Tests Lentos
```typescript
// Evitar timeouts largos
it('should complete within timeout', async () => {
  jest.setTimeout(5000); // Máximo 5 segundos

  const result = await slowOperation();
  expect(result).toBeDefined();
}, 5000);
```

### Tests Dependientes
```typescript
// ❌ Mal - tests dependientes
describe('Dependent Tests', () => {
  let sharedState;

  it('test 1', () => { sharedState = 'value'; });
  it('test 2', () => { expect(sharedState).toBe('value'); });
});

// ✅ Bien - tests independientes
describe('Independent Tests', () => {
  it('test 1', () => {
    const state = setupState();
    expect(state).toBeDefined();
  });

  it('test 2', () => {
    const state = setupState();
    expect(state.value).toBe('expected');
  });
});
```

---

## 📚 REFERENCIAS

### Documentación Relacionada
- **[Arquitectura General](../00_INICIO/ARQUITECTURA_GENERAL.md)** - Visión sistema
- **[API Reference](../01_BACKEND_CORE/API_REFERENCE_COMPLETA.md)** - Endpoints para testing
- **[Modelos de Datos](../01_BACKEND_CORE/MODELOS_DATOS.md)** - Schemas para tests

### Recursos Externos
- **[Jest Docs](https://jestjs.io/docs/getting-started)** - Documentación oficial
- **[Testing Library](https://testing-library.com/)** - Buenas prácticas
- **[Kent C. Dodds Blog](https://kentcdodds.com/blog/)** - Testing best practices

---

**🧪 Testing:** Estrategia completa  
**⚙️ Herramientas:** Jest + Supertest  
**📊 Cobertura:** 85%+ objetivo  
**🚀 CI/CD:** Automatizado  
**🐛 Debugging:** Herramientas incluidas  

---

**📅 Última actualización:** 20 de noviembre de 2025  
**👥 QA Lead:** Equipo Valgame  
**📖 Estado:** ✅ Implementado y probado</content>
<parameter name="filePath">c:\Users\Haustman\Desktop\valgame-backend\docs_reorganizada\01_BACKEND_CORE\TESTING_GUIA.md