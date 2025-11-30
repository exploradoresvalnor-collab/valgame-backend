#!/bin/bash

echo ""
echo "══════════════════════════════════════════════════════════════════════════════════════════"
echo "��� TEST DEL FLUJO DE REGISTRO - VALGAME"
echo "══════════════════════════════════════════════════════════════════════════════════════════"
echo ""

API_URL="http://localhost:8080"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-${TIMESTAMP}@example.com"
TEST_USERNAME="testuser${TIMESTAMP}"
TEST_PASSWORD="SecurePassword123!"

echo "��� DATOS DE PRUEBA:"
echo "   Email: $TEST_EMAIL"
echo "   Username: $TEST_USERNAME"
echo "   Password: $TEST_PASSWORD"
echo ""
echo "──────────────────────────────────────────────────────────────────────────────────────────"
echo "��� PASO 1: Intentar registro"
echo "──────────────────────────────────────────────────────────────────────────────────────────"
echo ""

curl -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"$TEST_USERNAME\",
    \"password\": \"$TEST_PASSWORD\"
  }" 2>/dev/null | jq . || echo "curl o jq no disponible"

echo ""
echo "══════════════════════════════════════════════════════════════════════════════════════════"
echo "��� VERIFICACIÓN:"
echo "══════════════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "1. Revisa el terminal del backend para ver los logs:"
echo "   [REGISTER] ✅ Usuario creado"
echo "   [REGISTER] ��� Intentando enviar correo de verificación..."
echo ""
echo "2. Si ves [REGISTER] ❌ ERROR, copia ese error y comparte"
echo ""

