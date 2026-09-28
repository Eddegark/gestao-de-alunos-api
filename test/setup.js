import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gestao-de-alunos';

export async function setupTestDB() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✓ MongoDB conectado em ${MONGODB_URI}`);
    }
  } catch (err) {
    console.error('✗ Erro ao conectar MongoDB:', err.message);
    throw err;
  }
}

export async function teardownTestDB() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('✓ MongoDB desconectado');
    }
  } catch (err) {
    console.error('✗ Erro ao desconectar MongoDB:', err.message);
  }
}

export async function clearTestDB() {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    console.log('✓ Banco de dados limpo');
  } catch (err) {
    console.error('✗ Erro ao limpar banco de dados:', err.message);
  }
}
