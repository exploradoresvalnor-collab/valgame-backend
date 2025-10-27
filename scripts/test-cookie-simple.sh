#!/bin/bash

echo "🔐 TEST SIMPLE DE COOKIES HTTP-ONLY"
echo "===================================="
echo ""

# Crear usuario único
TIMESTAMP=$(date +%s)
EMAIL="testuser_${TIMESTAMP}@example.com"
USERNAME="testuser_${TIMESTAMP}"
PASSWORD="SecurePass123!"

echo "1️⃣ Registrando usuario: $EMAIL"
curl -s -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" | head -1

echo ""
echo "2️⃣ Verificando usuario en BD..."
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/valgame').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  await User.updateOne({ email: '$EMAIL' }, { \$set: { isVerified: true } });
  console.log('✅ Usuario verificado');
  process.exit(0);
});
"

sleep 2

echo ""
echo "3️⃣ Haciendo LOGIN y verificando cookie..."
curl -i -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -c test_cookies.txt \
  2>&1 | grep -E "(HTTP/|Set-Cookie:|httponly|HttpOnly)" | head -10

echo ""
echo "4️⃣ Verificando archivo de cookies..."
if [ -f test_cookies.txt ]; then
  echo "Contenido de test_cookies.txt:"
  cat test_cookies.txt | grep -v "^#"
  
  if grep -q "token" test_cookies.txt; then
    echo "✅ Cookie 'token' guardada correctamente"
  else
    echo "❌ Cookie 'token' NO encontrada"
  fi
else
  echo "❌ Archivo de cookies no creado"
fi

echo ""
echo "5️⃣ Probando acceso CON cookie..."
curl -s -X GET http://localhost:8080/api/users/me \
  -b test_cookies.txt | head -5

echo ""
echo "6️⃣ Limpieza"
rm -f test_cookies.txt

echo ""
echo "✅ Test completado"
