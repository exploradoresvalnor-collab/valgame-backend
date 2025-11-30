require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:8080';

console.log('\n' + '‚ïê'.repeat(90));
console.log('Ì≥ù TEST COMPLETO DEL FLUJO DE REGISTRO');
console.log('‚ïê'.repeat(90) + '\n');

console.log(`Ìºê API URL: ${API_URL}\n`);

async function testRegistration() {
  try {
    // Generar email √∫nico
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    const testUsername = `testuser${timestamp}`;
    const testPassword = 'SecurePassword123!';

    console.log('Ì≥ã DATOS DE PRUEBA:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Username: ${testUsername}`);
    console.log(`   Password: ${testPassword}\n`);

    console.log('‚îÄ'.repeat(90));
    console.log('Ì¥ó PASO 1: Intentar registro\n');

    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      email: testEmail,
      username: testUsername,
      password: testPassword
    }, {
      validateStatus: () => true // No lanzar error por status
    });

    console.log(`Status: ${registerResponse.status}`);
    console.log('Respuesta:');
    console.log(JSON.stringify(registerResponse.data, null, 2));

    if (registerResponse.status === 201) {
      console.log('\n‚úÖ Registro exitoso\n');

      if (registerResponse.data.warning === 'Email no enviado') {
        console.log('‚ùå PROBLEMA DETECTADO: Email no fue enviado');
        console.log('\nRevisa los logs del backend para ver el error exacto:\n');
        console.log('Busca estos mensajes en el terminal del backend:');
        console.log('   [REGISTER] ‚úÖ Usuario creado');
        console.log('   [REGISTER] Ì≥ß Intentando enviar correo de verificaci√≥n...');
        console.log('   [REGISTER] ‚ùå ERROR al enviar correo: <error aqu√≠>\n');
      } else {
        console.log('‚úÖ Email deber√≠a haber sido enviado correctamente\n');
      }
    } else {
      console.log('\n‚ùå Error en el registro\n');
    }

    console.log('‚ïê'.repeat(90));
    console.log('Ì≤° PR√ìXIMOS PASOS:');
    console.log('‚ïê'.repeat(90) + '\n');
    console.log('1. Revisa los logs del terminal del backend');
    console.log('2. Copia exactamente el mensaje de error de [REGISTER] ‚ùå');
    console.log('3. Si el email lleg√≥, haz clic en el enlace de verificaci√≥n');
    console.log('4. Despu√©s deber√≠as recibir el Paquete Pionero\n');

  } catch (error) {
    console.error('\n‚ùå ERROR EN LA PRUEBA:\n');
    console.error(`Tipo: ${error.code || error.name}`);
    console.error(`Mensaje: ${error.message}`);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n‚ö†Ô∏è No se puede conectar al backend');
      console.error('Aseg√∫rate de que est√© corriendo:');
      console.error(`   npm run dev (debe escuchar en ${API_URL})\n`);
    }
  }
}

testRegistration();
