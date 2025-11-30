import mongoose from 'mongoose';
require('dotenv').config();

async function testQuery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const User = mongoose.model('User') || require('../src/models/User').default;
    
    console.log('\n🔍 PROBANDO BÚSQUEDA DE USUARIO\n');
    
    // Test 1: Búsqueda directa
    const user = await User.findOne({ email: 'proyectoagesh@gmail.com' });
    
    if (user) {
      console.log('✅ Usuario encontrado:');
      console.log('   ID:', user._id);
      console.log('   Email:', user.email);
      console.log('   Username:', user.username);
    } else {
      console.log('❌ Usuario NO encontrado');
      
      // Debugging
      const allUsers = await User.find({});
      console.log('\nTotal de usuarios en BD:', allUsers.length);
      if (allUsers.length > 0) {
        console.log('Primer usuario:', allUsers[0].email);
      }
    }
    
    process.exit(0);
  } catch (err: any) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testQuery();
