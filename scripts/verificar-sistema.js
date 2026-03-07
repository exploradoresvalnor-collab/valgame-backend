const http = require('http');

console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA VALNOR\n');

// Verificar backend
console.log('📡 Verificando Backend (localhost:8080)...');
const backendReq = http.request({
  hostname: 'localhost',
  port: 8080,
  path: '/health',
  method: 'GET',
  timeout: 5000
}, (res) => {
  console.log('✅ Backend: CONECTADO');
  console.log('   Status:', res.statusCode);

  // Verificar frontend
  console.log('\n🌐 Verificando Frontend (localhost:5174)...');
  const frontendReq = http.request({
    hostname: 'localhost',
    port: 5174,
    path: '/',
    method: 'GET',
    timeout: 5000
  }, (res) => {
    console.log('✅ Frontend: CONECTADO');
    console.log('   Status:', res.statusCode);
    console.log('\n🎉 ¡SISTEMA COMPLETO FUNCIONANDO!');
  });

  frontendReq.on('error', () => {
    console.log('❌ Frontend: NO CONECTADO');
    console.log('   Ejecuta: cd "C:\\Users\\Usuario\\Desktop\\trabajo\\Valnor-full" && npm run dev');
  });

  frontendReq.end();
});

backendReq.on('error', () => {
  console.log('❌ Backend: NO CONECTADO');
  console.log('   Ejecuta: cd "C:\\Users\\Usuario\\Desktop\\trabajo\\Valnor-full\\gui a de ejempli\\valgame-backend" && npm run dev');
});

backendReq.end();