// tests/websocket/test-auth-and-events.js
// Script de prueba para conexión, autenticación y recepción de eventos WebSocket en backend

const { io } = require('socket.io-client');

const SOCKET_URL = 'http://localhost:8080'; // Cambia a tu backend en producción si lo necesitas
const JWT = 'TU_JWT_AQUI'; // Reemplaza por un token válido

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  withCredentials: true
});

socket.on('connect', () => {
  console.log('✅ Conectado:', socket.id);
  socket.emit('auth', JWT);
});

socket.on('auth:success', () => {
  console.log('✅ Autenticación exitosa');
});

socket.on('auth:error', (err) => {
  console.error('❌ Error de autenticación:', err);
});

// Eventos críticos
socket.on('character:update', (data) => {
  console.log('🔔 character:update', data);
});
socket.on('character:coinUpdate', (data) => {
  console.log('🔔 character:coinUpdate', data);
});
socket.on('dungeon:update', (data) => {
  console.log('🔔 dungeon:update', data);
});
socket.on('dungeon:complete', (data) => {
  console.log('🔔 dungeon:complete', data);
});
socket.on('game:event', (data) => {
  console.log('🔔 game:event', data);
});
socket.on('marketplace:new', (data) => {
  console.log('🔔 marketplace:new', data);
});
socket.on('marketplace:sold', (data) => {
  console.log('🔔 marketplace:sold', data);
});
socket.on('system:notification', (data) => {
  console.log('🔔 system:notification', data);
});

socket.on('disconnect', () => {
  console.log('🔌 Desconectado');
});
