# 🧪 Guia de Testes - Gestão de Alunos API

## 📌 Resumo

Este projeto implementa uma suite de testes automatizados usando:
- **Mocha** para execução dos testes
- **SuperTest** para testes de endpoints HTTP
- **Chai** para assertions
- **Data-Driven Testing** com dados em JSON
- **GitHub Actions** para CI/CD

## ✅ Funcionalidades Testadas

### 1️⃣ Login como Administrador
```javascript
POST /api/auth/login
{
  "email": "admin@escola.com",
  "senha": "admin123"
}
```
- ✅ Login bem-sucedido com credenciais corretas
- ❌ Rejeita login com senha incorreta
- ❌ Rejeita login com email inexistente

### 2️⃣ Cadastrar Alunos (como Admin)
```javascript
POST /api/admin/alunos
Headers: Authorization: Bearer {adminToken}
{
  "nome": "João Silva",
  "email": "joao.silva@escola.com",
  "matricula": "2024001",
  "senha": "senha123"
}
```
- ✅ Cadastra aluno com dados válidos
- ✅ Retorna ID do aluno criado
- ❌ Rejeita duplicatas de email/matricula

### 3️⃣ Login como Aluno
```javascript
POST /api/auth/login
{
  "email": "joao.silva@escola.com",
  "senha": "senha123"
}
```
- ✅ Login bem-sucedido como aluno
- ❌ Rejeita login com credenciais inválidas

### 4️⃣ Registrar Entrega de Trabalho (como Aluno)
```javascript
POST /api/alunos/{alunoId}/trabalhos
Headers: Authorization: Bearer {alunoToken}
{
  "disciplinaId": "507f1f77bcf86cd799439011",
  "titulo": "Trabalho de Matemática",
  "descricao": "Resolver exercícios de álgebra"
}
```
- ✅ Registra trabalho com dados válidos
- ✅ Associa trabalho ao aluno e disciplina
- ❌ Rejeita trabalho sem disciplina obrigatória
- ❌ Rejeita trabalho se aluno não está matriculado

## 🚀 Quick Start

### Instalação
```bash
npm install
```

### Executar Testes Localmente
```bash
# Todos os testes
npm test

# Apenas testes de integração
npm run test:integration

# Modo watch
npm run test:watch
```

### Verificar Cobertura
```bash
# Com MongoDB rodando
npm test
```

## 📊 Estrutura de Dados (Data-Driven Testing)

### `test/fixtures/test-data.json`
```json
{
  "admin": {
    "email": "admin@escola.com",
    "senha": "admin123",
    "role": "admin"
  },
  "alunos": [
    {
      "nome": "João Silva",
      "email": "joao.silva@escola.com",
      "matricula": "2024001",
      "senha": "senha123"
    }
  ],
  "trabalhos": [
    {
      "titulo": "Trabalho de Matemática",
      "descricao": "Resolver exercícios de álgebra",
      "status": "entregue"
    }
  ],
  "loginAttempts": [
    {
      "email": "admin@escola.com",
      "senha": "admin123",
      "expectedStatus": 200,
      "shouldSucceed": true
    }
  ]
}
```

## 🔐 Helpers de Autenticação

### `test/helpers/auth.helper.js`

```javascript
import { loginAsAdmin, loginAsStudent, createAuthHeader } from './helpers/auth.helper.js';

// Fazer login
const { token, usuario } = await loginAsAdmin('admin@escola.com', 'admin123');

// Usar em requisições
const response = await request(app)
  .get('/api/admin/alunos')
  .set('Authorization', `Bearer ${token}`);
```

## 📋 Testes Implementados

### `test/auth.test.js` - Testes Básicos de Auth
- Login com credenciais corretas (admin)
- Login com senha incorreta
- Validação de resposta

### `test/integration.test.js` - Testes de Integração Completa
1. **Login Admin (Data-Driven)**: 3 tentativas diferentes
2. **Cadastro de Alunos (Data-Driven)**: 3 alunos do JSON
3. **Login como Aluno**: Sucesso e falha
4. **Registrar Trabalhos (Data-Driven)**: 3 trabalhos do JSON
5. **Validações**: Segurança, autorização, campos obrigatórios

## 🔄 GitHub Actions

### `.github/workflows/test.yml`

Executa automaticamente:
- ✅ Em cada push para `main`, `master` ou `develop`
- ✅ Em PRs
- ✅ Com Node.js 18.x e 20.x
- ✅ Com MongoDB em container

```bash
# Ver status
git log --oneline -5
# Cada commit pode ter testes rodando no GitHub Actions
```

## 🌍 Configuração de Variáveis de Ambiente

### `.env` (não commitado)
```env
MONGODB_URI=mongodb://127.0.0.1:27017/gestao-de-alunos
PORT=3000
NODE_ENV=development
```

### `.env.example` (commitado)
```env
MONGODB_URI=mongodb://127.0.0.1:27017/gestao-de-alunos
PORT=3000
NODE_ENV=development
```

## 📈 Executar em CI/CD

### GitHub Actions
Os testes rodam automaticamente em cada push/PR:

```yaml
# .github/workflows/test.yml
- MongoDB rodando em container
- Node.js 18.x e 20.x
- npm ci e npm test
```

## 🧩 Adicionar Novos Testes

1. **Criar arquivo**: `test/novo-teste.test.js`
2. **Adicionar dados**: Atualizar `test/fixtures/test-data.json`
3. **Usar helpers**: Importar do `test/helpers/auth.helper.js`
4. **Estruturar**: Use `describe()` e `it()`

Exemplo:
```javascript
import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import testData from './fixtures/test-data.json';
import { loginAsAdmin } from './helpers/auth.helper.js';

describe('Novo Teste', () => {
  let adminToken;

  before(async () => {
    const auth = await loginAsAdmin(testData.admin.email, testData.admin.senha);
    adminToken = auth.token;
  });

  testData.alunos.forEach((aluno) => {
    it(`criar aluno: ${aluno.nome}`, async () => {
      const response = await request(app)
        .post('/api/admin/alunos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(aluno);

      expect(response.status).to.equal(201);
    });
  });
});
```

## 🎯 Fluxo Completo de Teste

```
┌─────────────────────────────────────────────────┐
│  1. Login como Admin (Data-Driven)              │
│     3 tentativas do test-data.json              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  2. Cadastrar Alunos (Data-Driven)              │
│     3 alunos do test-data.json                  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  3. Login como Aluno                            │
│     Sucesso e tentativa com senha errada        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  4. Registrar Trabalhos (Data-Driven)           │
│     3 trabalhos do test-data.json               │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  5. Validações Adicionais                       │
│     Segurança, autorização, campos obrigatórios │
└─────────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### MongoDB não conecta
```bash
# Verificar se MongoDB está rodando
mongosh

# Ou iniciar MongoDB
brew services start mongodb-community
# ou
docker run -d -p 27017:27017 mongo:latest
```

### Timeout nos testes
Aumentar timeout no `.mocharc.json` ou no describe:
```javascript
describe('Suite lenta', function() {
  this.timeout(15000); // 15 segundos
});
```

### Falha de autorização
Verificar se:
1. Token está sendo passado corretamente no header
2. Token não expirou
3. User tem a role correta

## 📚 Referências

- [Mocha Docs](https://mochajs.org/)
- [SuperTest Docs](https://github.com/visionmedia/supertest)
- [Chai Docs](https://www.chaijs.com/)
- [Jest vs Mocha](https://blog.logrocket.com/jest-vs-mocha/)
- [Testing Best Practices](https://testingjavascript.com/)

## ✨ Checklist de Testes

- [x] Login Admin com credenciais corretas
- [x] Login Admin com credenciais incorretas
- [x] Cadastro de alunos (Data-Driven com 3 exemplos)
- [x] Login como Aluno
- [x] Registrar trabalho (Data-Driven com 3 exemplos)
- [x] Validação de campos obrigatórios
- [x] Testes de autorização
- [x] Helpers de autenticação
- [x] Dados em JSON (Data-Driven)
- [x] GitHub Actions pipeline
- [x] .env e .env.example
- [x] Configuração Mocha (.mocharc.json)

---

**Última atualização**: 2026-09-27  
**Versão**: 1.0.0
