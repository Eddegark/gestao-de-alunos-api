import request from 'supertest';
import { expect } from 'chai';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import app from '../src/app.js';
import { setupTestDB, teardownTestDB } from './setup.js';
import { loginAsAdmin, loginAsStudent } from './helpers/auth.helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testData = JSON.parse(readFileSync(path.join(__dirname, 'fixtures', 'test-data.json'), 'utf8'));

// Disciplina seedada em src/database/seed.js, usada para matricular o aluno criado no teste.
const DISCIPLINA_SEED_ID = 'disciplina-matematica';

describe('Integração Completa: Admin, Aluno, Trabalhos', function () {
  this.timeout(15000);
  let adminToken;
  let criadoAlunoId;
  let loginAlunoToken;

  before(async () => {
    await setupTestDB();

    // Login como admin via helper, usado nos passos seguintes (cadastro de aluno, matrícula).
    const admin = await loginAsAdmin(testData.admin.email, testData.admin.senha);
    adminToken = admin.token;
  });

  after(async () => {
    await teardownTestDB();
  });

  describe('1. Login como Admin - Data-Driven Tests', () => {
    testData.loginAttempts.forEach((attempt, index) => {
      it(`tentativa ${index + 1}: login com email "${attempt.email}" esperando status ${attempt.expectedStatus}`, async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: attempt.email, senha: attempt.senha });

        expect(response.status).to.equal(attempt.expectedStatus);

        if (attempt.shouldSucceed) {
          expect(response.body).to.have.property('token');
          expect(response.body).to.have.property('usuario');
          expect(response.body.usuario.role).to.equal('admin');
        } else {
          expect(response.body).to.have.property('error');
          expect(response.body.error).to.include('E-mail ou senha inválidos');
        }
      });
    });
  });

  describe('2. Cadastrar Alunos como Admin', () => {
    testData.alunos.forEach((aluno, index) => {
      it(`cadastrar aluno ${index + 1}: ${aluno.nome}`, async () => {
        const response = await request(app)
          .post('/api/admin/alunos')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            nome: aluno.nome,
            email: aluno.email,
            matricula: aluno.matricula,
            senha: aluno.senha,
          });

        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body.nome).to.equal(aluno.nome);
        expect(response.body.email).to.equal(aluno.email);
        expect(response.body.matricula).to.equal(aluno.matricula);

        // Salvar o ID do primeiro aluno criado para usar nos próximos testes
        if (index === 0) {
          criadoAlunoId = response.body.id;
        }
      });
    });
  });

  describe('3. Login como Aluno', () => {
    it('fazer login com o aluno cadastrado', async () => {
      const primeiroAluno = testData.alunos[0];
      const { token, usuario } = await loginAsStudent(primeiroAluno.email, primeiroAluno.senha);

      expect(token).to.be.a('string');
      expect(usuario.role).to.equal('aluno');
      expect(usuario.nome).to.equal(primeiroAluno.nome);

      loginAlunoToken = token;
    });

    it('falhar ao fazer login com senha incorreta', async () => {
      const primeiroAluno = testData.alunos[0];
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: primeiroAluno.email, senha: 'senhaincorreta' });

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('error');
    });
  });

  describe('4. Registrar Entrega de Trabalho como Aluno', () => {
    before(async () => {
      // Matricular o aluno recém-criado na disciplina seedada, pré-requisito para registrar trabalho.
      const matriculaResponse = await request(app)
        .post(`/api/admin/disciplinas/${DISCIPLINA_SEED_ID}/matriculas`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ alunoId: criadoAlunoId });

      expect(matriculaResponse.status).to.equal(201);
    });

    testData.trabalhos.forEach((trabalho, index) => {
      it(`registrar trabalho ${index + 1}: "${trabalho.titulo}"`, async () => {
        const response = await request(app)
          .post(`/api/alunos/${criadoAlunoId}/trabalhos`)
          .set('Authorization', `Bearer ${loginAlunoToken}`)
          .send({
            disciplinaId: DISCIPLINA_SEED_ID,
            titulo: trabalho.titulo,
            descricao: trabalho.descricao,
          });

        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body.titulo).to.equal(trabalho.titulo);
        expect(response.body.descricao).to.equal(trabalho.descricao);
        expect(response.body.status).to.equal('entregue');
        expect(response.body.alunoId).to.equal(criadoAlunoId);
      });
    });
  });

  describe('5. Validações e Testes Adicionais', () => {
    it('não permitir registrar trabalho sem disciplina', async () => {
      const response = await request(app)
        .post(`/api/alunos/${criadoAlunoId}/trabalhos`)
        .set('Authorization', `Bearer ${loginAlunoToken}`)
        .send({
          titulo: 'Trabalho sem disciplina',
          descricao: 'Teste de validação',
        });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.include('obrigatórios');
    });

    it('listar trabalhos do aluno', async () => {
      const response = await request(app)
        .get(`/api/alunos/${criadoAlunoId}/trabalhos`)
        .set('Authorization', `Bearer ${loginAlunoToken}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
    });

    it('não permitir acesso a trabalhos de outro aluno', async () => {
      const outroAlunoId = '507f1f77bcf86cd799439011'; // ID fake
      const response = await request(app)
        .get(`/api/alunos/${outroAlunoId}/trabalhos`)
        .set('Authorization', `Bearer ${loginAlunoToken}`);

      expect(response.status).to.equal(403);
    });
  });
});
