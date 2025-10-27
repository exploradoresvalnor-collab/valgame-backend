#!/bin/bash

# Script de pruebas para verificar cookies httpOnly
# Fecha: 27 de octubre de 2025

echo "🔐 Iniciando pruebas de seguridad con cookies httpOnly..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8080"
COOKIE_JAR="cookies.txt"

# Limpiar cookies anteriores
rm -f $COOKIE_JAR

# Contadores
passed=0
failed=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Registro de usuario de prueba"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RANDOM_USER="testuser_$(date +%s)"
EMAIL="${RANDOM_USER}@test.com"
PASSWORD="test123456"

echo "Usuario: $EMAIL"
echo -n "Registrando... "

register_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"username\":\"$RANDOM_USER\",\"password\":\"$PASSWORD\"}")

status_code=$(echo "$register_response" | tail -n1)
response_body=$(echo "$register_response" | head -n-1)

if [ "$status_code" -eq 201 ]; then
    echo -e "${GREEN}✓ Usuario registrado${NC}"
    ((passed++))
else
    echo -e "${RED}✗ Falló registro (${status_code})${NC}"
    echo "Response: $response_body"
    ((failed++))
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Login y verificación de cookie httpOnly"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Crear usuario verificado directamente en la base de datos para testing
echo "Creando usuario verificado para pruebas..."
mongo valgame --eval "db.users.updateOne({email:'$EMAIL'},{$set:{isVerified:true}})" > /dev/null 2>&1

echo -n "Intentando login... "

login_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -c $COOKIE_JAR \
  -D -)

status_code=$(echo "$login_response" | grep "HTTP/" | awk '{print $2}')
cookie_header=$(echo "$login_response" | grep -i "set-cookie:")

if [ "$status_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Login exitoso (200)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ Falló login (${status_code})${NC}"
    ((failed++))
fi

echo ""
echo "Verificando cookie httpOnly en respuesta..."
echo "$cookie_header"

if echo "$cookie_header" | grep -q "HttpOnly"; then
    echo -e "${GREEN}✓ Cookie tiene flag HttpOnly${NC}"
    ((passed++))
else
    echo -e "${RED}✗ Cookie NO tiene flag HttpOnly${NC}"
    ((failed++))
fi

if echo "$cookie_header" | grep -q "SameSite=Strict"; then
    echo -e "${GREEN}✓ Cookie tiene SameSite=Strict${NC}"
    ((passed++))
else
    echo -e "${YELLOW}⚠ Cookie NO tiene SameSite=Strict${NC}"
fi

if echo "$cookie_header" | grep -q "token="; then
    echo -e "${GREEN}✓ Cookie 'token' presente${NC}"
    ((passed++))
else
    echo -e "${RED}✗ Cookie 'token' NO encontrada${NC}"
    ((failed++))
fi

# Verificar que el token NO está en el body de la respuesta
response_body=$(echo "$login_response" | tail -n1)
if echo "$response_body" | grep -q '"token"'; then
    echo -e "${RED}✗ INSEGURO: Token presente en JSON response${NC}"
    ((failed++))
else
    echo -e "${GREEN}✓ Token NO está en JSON response (seguro)${NC}"
    ((passed++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Acceso a endpoint protegido CON cookie"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "Accediendo a /api/users/me con cookie... "

me_response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/users/me" \
  -b $COOKIE_JAR)

status_code=$(echo "$me_response" | tail -n1)

if [ "$status_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Acceso autorizado con cookie (200)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ Acceso denegado (${status_code})${NC}"
    echo "Response: $(echo "$me_response" | head -n-1)"
    ((failed++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Acceso a endpoint protegido SIN cookie"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "Accediendo a /api/users/dashboard sin cookie... "

dashboard_response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/users/dashboard")

status_code=$(echo "$dashboard_response" | tail -n1)

if [ "$status_code" -eq 401 ]; then
    echo -e "${GREEN}✓ Acceso denegado correctamente (401)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ Debería denegar acceso (${status_code})${NC}"
    ((failed++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Logout y limpieza de cookie"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "Ejecutando logout... "

logout_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/logout" \
  -b $COOKIE_JAR \
  -c $COOKIE_JAR \
  -D -)

status_code=$(echo "$logout_response" | grep "HTTP/" | awk '{print $2}')
cookie_header=$(echo "$logout_response" | grep -i "set-cookie:")

if [ "$status_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Logout exitoso (200)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ Falló logout (${status_code})${NC}"
    ((failed++))
fi

# Verificar que la cookie se elimina (Max-Age=0 o Expires en el pasado)
if echo "$cookie_header" | grep -q "Max-Age=0\|Expires=.*1970"; then
    echo -e "${GREEN}✓ Cookie marcada para eliminación${NC}"
    ((passed++))
else
    echo -e "${YELLOW}⚠ Cookie podría no eliminarse correctamente${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 6: Acceso después de logout (debe fallar)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "Intentando acceder a /api/users/me... "

me_after_logout=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/users/me" \
  -b $COOKIE_JAR)

status_code=$(echo "$me_after_logout" | tail -n1)

if [ "$status_code" -eq 401 ]; then
    echo -e "${GREEN}✓ Acceso denegado después de logout (401)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ Debería denegar acceso (${status_code})${NC}"
    ((failed++))
fi

# Limpiar
rm -f $COOKIE_JAR

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "RESUMEN DE PRUEBAS DE SEGURIDAD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ Passed: $passed${NC}"
echo -e "${RED}✗ Failed: $failed${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 Todas las pruebas de seguridad pasaron!${NC}"
    echo -e "${GREEN}✅ Sistema de cookies httpOnly funcionando correctamente${NC}"
    exit 0
else
    echo -e "${RED}❌ Algunas pruebas fallaron${NC}"
    exit 1
fi
