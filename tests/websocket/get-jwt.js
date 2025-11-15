// tests/websocket/get-jwt.js
// Script para obtener un JWT válido usando login en modo test

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const EMAIL = 'mchaustman@gmail.com';
const PASSWORD = '5803113haus.';
const LOGIN_URL = 'http://localhost:8080/auth/login';

async function getJWT() {
  const res = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  const data = await res.json();
  if (data.token) {
    console.log('✅ JWT obtenido:', data.token);
    return data.token;
  } else {
    console.error('❌ No se obtuvo JWT:', data);
    return null;
  }
}

getJWT();
