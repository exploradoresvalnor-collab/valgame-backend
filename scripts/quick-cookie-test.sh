#!/bin/bash

echo "🔐 TEST RÁPIDO DE COOKIES"
echo "========================="
echo ""

EMAIL="quicktest@test.com"
PASS="Pass123456!"

echo "1️⃣ Verificando usuario en BD..."
node -e "
const m = require('mongoose');
m.connect('mongodb://localhost:27017/valgame', {serverSelectionTimeoutMS: 3000})
  .then(async () => {
    const User = m.model('User', new m.Schema({}, {strict: false}));
    await User.updateOne({email: '$EMAIL'}, {\$set: {isVerified: true}});
    console.log('✅ Usuario verificado');
    await m.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Error:', err.message);
    process.exit(1);
  });
" 2>&1 | tail -1

sleep 1

echo ""
echo "2️⃣ Haciendo LOGIN..."
curl -i -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" \
  -c /tmp/test_cookies.txt \
  2>&1 | head -35

echo ""
echo "3️⃣ Verificando archivo de cookies..."
if [ -f /tmp/test_cookies.txt ]; then
  echo "Contenido:"
  cat /tmp/test_cookies.txt
  
  if grep -q "token" /tmp/test_cookies.txt; then
    echo ""
    echo "✅ Cookie 'token' guardada correctamente"
  else
    echo ""
    echo "❌ Cookie 'token' NO encontrada"
  fi
else
  echo "❌ Archivo de cookies no creado"
fi

echo ""
echo "4️⃣ Probando acceso CON cookie..."
curl -s -X GET http://localhost:8080/api/users/me \
  -b /tmp/test_cookies.txt | head -3

echo ""
echo ""
echo "========================="
echo "✅ TEST COMPLETADO"
