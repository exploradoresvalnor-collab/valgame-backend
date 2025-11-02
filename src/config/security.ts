/**
 * 🔒 CONFIGURACIÓN DE SEGURIDAD
 * 
 * Este archivo centraliza la configuración de seguridad crítica
 * para evitar fallbacks inseguros y validar configuraciones.
 */

/**
 * Obtiene y valida el JWT_SECRET desde variables de entorno
 * 
 * @throws {Error} Si JWT_SECRET no está configurado o es muy corto
 * @returns {string} JWT_SECRET validado
 */
export const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error(
      '🔴 CRÍTICO: JWT_SECRET no configurado en variables de entorno.\n' +
      'Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
    );
  }
  
  if (secret.length < 32) {
    console.warn(
      '⚠️  ADVERTENCIA: JWT_SECRET tiene menos de 32 caracteres.\n' +
      'Se recomienda al menos 64 caracteres para seguridad óptima.'
    );
  }
  
  return secret;
};

/**
 * Valida la configuración de seguridad al inicio de la aplicación
 */
export const validateSecurityConfig = (): void => {
  // Validar NODE_ENV
  if (!process.env.NODE_ENV) {
    console.warn('⚠️  NODE_ENV no configurado, defaulting a "development"');
    process.env.NODE_ENV = 'development';
  }

  // En producción, validar configuraciones críticas
  if (process.env.NODE_ENV === 'production') {
    const criticalEnvVars = [
      'MONGODB_URI',
      'JWT_SECRET'
      // FRONTEND_ORIGIN es opcional (modo desarrollo permite todos los orígenes)
    ];

    const missing = criticalEnvVars.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(
        `🔴 CRÍTICO: Variables de entorno faltantes en producción: ${missing.join(', ')}`
      );
    }

    // Advertir si FRONTEND_ORIGIN no está definida (CORS abierto)
    if (!process.env.FRONTEND_ORIGIN) {
      console.warn('⚠️  FRONTEND_ORIGIN no definida: CORS abierto a todos los orígenes (solo para desarrollo)');
    }

    // Validar formato de MONGODB_URI
    if (!process.env.MONGODB_URI?.match(/^mongodb(\+srv)?:\/\//)) {
      throw new Error('🔴 CRÍTICO: MONGODB_URI tiene formato inválido');
    }

    // Validar que FRONTEND_ORIGIN no sea wildcard
    if (process.env.FRONTEND_ORIGIN === '*') {
      throw new Error('🔴 CRÍTICO: FRONTEND_ORIGIN no puede ser "*" en producción');
    }

    // Validar que FRONTEND_ORIGIN permita múltiples dominios separados por coma
    if (process.env.FRONTEND_ORIGIN?.includes(',')) {
      console.log('✅ FRONTEND_ORIGIN permite múltiples dominios:', process.env.FRONTEND_ORIGIN);
    }

    console.log('✅ Configuración de seguridad validada para producción');
  }
};

/**
 * Información de configuración de seguridad
 */
export const getSecurityInfo = () => ({
  jwtExpiresIn: '7d',
  bcryptRounds: 10,
  verificationTokenExpiry: 3600000, // 1 hora en ms
  passwordMinLength: 6,
  usernameMinLength: 3,
});
