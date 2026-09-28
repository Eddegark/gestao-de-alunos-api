import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gestao-de-alunos';

mongoose.connection.on('error', (err) => {
  console.error('Erro de conexão com o MongoDB:', err.message);
});

if (process.env.NODE_ENV !== 'test') {
  await mongoose.connect(MONGODB_URI);
  console.log(`MongoDB conectado em ${MONGODB_URI}`);
} else {
  mongoose.connect(MONGODB_URI).catch((err) => {
    console.log('Aguardando MongoDB estar disponível...');
  });
}

export default mongoose;
