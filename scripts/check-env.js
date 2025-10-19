const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('[ENV_CHECK] Faltan variables de entorno:', missing.join(', '));
  process.exit(1);
}
console.log('[ENV_CHECK] Todas las variables de entorno requeridas están presentes.');
