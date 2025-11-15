#!/bin/bash

# Script de prueba para endpoints de recuperación de contraseña
# Uso: ./test-auth-recovery.sh

BASE_URL="http://localhost:8080"
EMAIL="test@example.com"

echo "🔐 PRUEBA DE SISTEMA DE RECUPERACIÓN DE AUTENTICACIÓN"
echo "=================================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Solicitar recuperación de contraseña
echo -e "${BLUE}📧 Test 1: Solicitar recuperación de contraseña${NC}"
echo "Endpoint: POST /auth/forgot-password"
echo "Request: {\"email\": \"$EMAIL\"}"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\"}")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""
echo "---------------------------------------------------"
echo ""

# 2. Reenviar email de verificación
echo -e "${BLUE}📨 Test 2: Reenviar email de verificación${NC}"
echo "Endpoint: POST /auth/resend-verification"
echo "Request: {\"email\": \"$EMAIL\"}"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/auth/resend-verification" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\"}")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""
echo "---------------------------------------------------"
echo ""

# 3. Test con token inválido (para validar error)
echo -e "${BLUE}❌ Test 3: Resetear contraseña con token inválido${NC}"
echo "Endpoint: POST /auth/reset-password/invalid-token-123"
echo "Request: {\"password\": \"newPassword123\"}"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/auth/reset-password/invalid-token-123" \
  -H "Content-Type: application/json" \
  -d "{\"password\": \"newPassword123\"}")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""
echo "---------------------------------------------------"
echo ""

# 4. Verificar logs del servidor
echo -e "${BLUE}📋 Test 4: Verificar logs del servidor${NC}"
echo "Busca en la consola del servidor mensajes como:"
echo "  - [MAILER] Correo de recuperación enviado. Vista previa disponible en: https://ethereal.email/..."
echo "  - [MAILER] Correo de prueba enviado. Vista previa disponible en: https://ethereal.email/..."
echo ""
echo "💡 Copia el enlace de Ethereal y ábrelo en el navegador para ver el email"
echo ""
echo "---------------------------------------------------"
echo ""

# Instrucciones finales
echo -e "${GREEN}✅ Tests completados${NC}"
echo ""
echo "📝 PRÓXIMOS PASOS:"
echo "1. Revisa los logs del servidor (npm run dev)"
echo "2. Abre el enlace de Ethereal en el navegador"
echo "3. Copia el token del botón del email"
echo "4. Ejecuta manualmente:"
echo "   curl -X POST $BASE_URL/auth/reset-password/TOKEN_AQUI \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"password\": \"nuevaPassword123\"}'"
echo ""
echo "5. Verifica que puedes hacer login con la nueva contraseña"
echo ""
