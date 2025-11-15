#!/bin/bash

# Script de pruebas básicas para los nuevos endpoints
# Fecha: 26 de octubre de 2025

echo "🧪 Iniciando pruebas de endpoints nuevos..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para probar endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    echo -n "Testing $method $endpoint - $description... "
    response=$(curl -s -w "\n%{http_code}" -X $method "http://localhost:8080$endpoint")
    status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 400 ]; then
        echo -e "${GREEN}✓ OK (${status_code})${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED (${status_code})${NC}"
        return 1
    fi
}

# Contadores
passed=0
failed=0

# 1. Health check
if test_endpoint "GET" "/health" "Server health"; then
    ((passed++))
else
    ((failed++))
fi

# 2. Settings endpoint (sin autenticación, debe fallar con 401)
echo -n "Testing GET /api/user/settings (sin auth)... "
response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:8080/api/user/settings")
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" -eq 401 ]; then
    echo -e "${GREEN}✓ OK (401 - Auth required)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAILED (Expected 401, got ${status_code})${NC}"
    ((failed++))
fi

# 3. Notifications endpoint (sin autenticación, debe fallar con 401)
echo -n "Testing GET /api/notifications (sin auth)... "
response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:8080/api/notifications")
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" -eq 401 ]; then
    echo -e "${GREEN}✓ OK (401 - Auth required)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAILED (Expected 401, got ${status_code})${NC}"
    ((failed++))
fi

# 4. Resources endpoint (sin autenticación, debe fallar con 401)
echo -n "Testing GET /api/users/resources (sin auth)... "
response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:8080/api/users/resources")
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" -eq 401 ]; then
    echo -e "${GREEN}✓ OK (401 - Auth required)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAILED (Expected 401, got ${status_code})${NC}"
    ((failed++))
fi

# 5. Dashboard endpoint (sin autenticación, debe fallar con 401)
echo -n "Testing GET /api/users/dashboard (sin auth)... "
response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:8080/api/users/dashboard")
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" -eq 401 ]; then
    echo -e "${GREEN}✓ OK (401 - Auth required)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAILED (Expected 401, got ${status_code})${NC}"
    ((failed++))
fi

# 6. Logout endpoint (sin autenticación, debe fallar con 401)
echo -n "Testing POST /api/auth/logout (sin auth)... "
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:8080/api/auth/logout")
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" -eq 401 ]; then
    echo -e "${GREEN}✓ OK (401 - Auth required)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAILED (Expected 401, got ${status_code})${NC}"
    ((failed++))
fi

# 7. Tutorial complete endpoint (sin autenticación, debe fallar con 401)
echo -n "Testing PUT /api/users/tutorial/complete (sin auth)... "
response=$(curl -s -w "\n%{http_code}" -X PUT "http://localhost:8080/api/users/tutorial/complete")
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" -eq 401 ]; then
    echo -e "${GREEN}✓ OK (401 - Auth required)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAILED (Expected 401, got ${status_code})${NC}"
    ((failed++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Resumen de pruebas:"
echo -e "${GREEN}✓ Passed: $passed${NC}"
echo -e "${RED}✗ Failed: $failed${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 Todas las pruebas básicas pasaron!${NC}"
    exit 0
else
    echo -e "${RED}❌ Algunas pruebas fallaron${NC}"
    exit 1
fi
