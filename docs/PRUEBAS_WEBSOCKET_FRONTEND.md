# Pruebas de WebSocket en Frontend (socket.io)

## 1. Instalar socket.io-client

Si usas npm:
```bash
npm install socket.io-client
```

---

## 2. Código de conexión y autenticación

```javascript
// frontend/websocket-test.js
import { io } from 'socket.io-client';

// URL de tu backend (Render o local)
const socket = io('https://valgame-backend.onrender.com', {
  transports: ['websocket'],
  withCredentials: true
});

// JWT obtenido tras login
const token = 'TU_JWT_AQUI';

// Autenticación en tiempo real
socket.on('connect', () => {
  console.log('Conectado al WebSocket:', socket.id);
  socket.emit('auth', token);
});

// Eventos de autenticación
socket.on('auth:success', () => {
  console.log('Autenticación exitosa en tiempo real');
});

socket.on('auth:error', (err) => {
  console.error('Error de autenticación:', err);
});

// Eventos de juego en tiempo real
socket.on('marketplace:update', (data) => {
  console.log('Marketplace actualizado:', data);
});

socket.on('game:event', (eventData) => {
  console.log('Evento de juego:', eventData);
});

socket.on('rankings:update', (rankings) => {
  console.log('Rankings actualizados:', rankings);
});

// Desconexión
socket.on('disconnect', () => {
  console.log('Desconectado del WebSocket');
});
```

---

## 3. Pasos para probar

1. Instala `socket.io-client` en tu frontend.
2. Copia el código anterior en un archivo JS y pon tu JWT real donde dice `TU_JWT_AQUI`.
3. Ejecuta el archivo en el navegador o en una app de prueba.
4. Abre la consola y verifica:
   - Que se conecta y muestra el `socket.id`.
   - Que la autenticación es exitosa (`auth:success`).
   - Que recibes eventos en tiempo real cuando ocurren cambios en el juego.

---

## 4. Recomendaciones
- Usa la misma URL que tienes configurada en el backend para CORS/WebSocket.
- Si usas local, cambia la URL a `http://localhost:8080`.
- El JWT debe ser válido y generado por tu backend.
- Si ves errores de CORS, revisa la variable de entorno en el backend.

---

## 5. Debug
- Si no te conectas, revisa la consola del navegador y los logs del backend.
- Si no recibes eventos, haz acciones en el juego que los disparen (ejemplo: compra en marketplace, combate, etc.).
- Si el JWT es inválido, revisa el flujo de login y obtención del token.

---

## 6. Recursos
- [Documentación oficial socket.io-client](https://socket.io/docs/v4/client-api/)
- [Ejemplo de integración con JWT](https://socket.io/docs/v4/authentication/)

---

**¡Con esto puedes probar y validar la conexión en tiempo real entre tu frontend y backend!**
