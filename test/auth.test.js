import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { setupTestDB, teardownTestDB } from './setup.js';

describe('POST /api/auth/login', function () {
  this.timeout(10000);

  before(async () => {
    await setupTestDB();
  });

  after(async () => {
    await teardownTestDB();
  });

  it('deve retornar 200 e um token quando o admin informar e-mail e senha corretos', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@escola.com', senha: 'admin123' });

    expect(resposta.status).to.equal(200);
    expect(resposta.body).to.have.property('token');
  });

  it('deve retornar 401 quando a senha informada for inválida', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@escola.com', senha: 'senha-incorreta' });

    expect(resposta.status).to.equal(401);
    expect(resposta.body.error).to.equal('E-mail ou senha inválidos.');
  });
});
