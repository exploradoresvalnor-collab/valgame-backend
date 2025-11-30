const mongoose = require('mongoose');
require('dotenv').config();

async function testForgotPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('\n🔍 TEST FORGET PASSWORD FLOW\n');
    
    // 1. Buscar usuario directamente en MongoDB
    const user = await db.collection('users').findOne({ 
      email: 'proyectoagesh@gmail.com' 
    });
    
    console.log('1️⃣ Búsqueda en MongoDB directo:');
    if (user) {
      console.log('   ✅ Usuario encontrado');
      console.log('   Email:', user.email);
      console.log('   Username:', user.username);
    } else {
      console.log('   ❌ Usuario NO encontrado');
    }
    
    // 2. Intentar buscar sin índice (case-sensitive)
    const userCase = await db.collection('users').findOne({ 
      email: { $regex: 'proyectoagesh', $options: 'i' } 
    });
    
    console.log('\n2️⃣ Búsqueda case-insensitive:');
    if (userCase) {
      console.log('   ✅ Encontrado');
      console.log('   Email guardado:', userCase.email);
    } else {
      console.log('   ❌ No encontrado');
    }
    
    // 3. Ver todos los usuarios
    const allUsers = await db.collection('users').find({}).toArray();
    console.log('\n3️⃣ Total de usuarios en BD:', allUsers.length);
    if (allUsers.length > 0) {
      console.log('   Primeros 3 usuarios:');
      allUsers.slice(0, 3).forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} (${u.username})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testForgotPassword();
