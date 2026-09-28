# Testes Automatizados - Gestão de Alunos API

## 📋 Visão Geral

Este diretório contém testes automatizados para a API de Gestão de Alunos, usando:
- **Mocha**: Framework de testes
- **SuperTest**: Teste de endpoints HTTP
- **Chai**: Biblioteca de assertions
- **Data-Driven Testing**: Dados de teste em JSON

## 🗂️ Estrutura do Projeto

```
test/
├── README.md                 # Este arquivo
├── fixtures/
│   └── test-data.json       # Dados de teste reutilizáveis (Data-Driven)
├── helpers/
│   └── auth.helper.js       # Helpers para autenticação
├── auth.test.js             # Testes de autenticação
├── integration.test.js      # Testes de integração completa
└── .mocharc.json            # Configuração do Mocha
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18.x ou superior
- MongoDB rodando localmente ou configurado em `MONGODB_URI`

### Instalação
```bash
npm install
```

### Executar Testes
```bash
# Executar todos os testes
npm test

# Executar apenas testes de integração
npm run test:integration

# Executar testes em modo watch (reexecuta ao salvar)
npm run test:watch
```

## 📁 Estrutura de Testes

### 1. **auth.test.js** - Testes de Autenticação
Testa o login como admin com diferentes cenários:
- ✅ Login bem-sucedido com credenciais corretas
- ❌ Login falhado com senha incorreta
- ❌ Login falhado com usuário inexistente

### 2. **integration.test.js** - Testes de Integração Completa
Fluxo completo de teste:

1. **Login como Admin** (Data-Driven)
   - Múltiplas tentativas de login com diferentes credenciais
   - Validação de resposta e token JWT

2. **Cadastrar Alunos** (Data-Driven)
   - Criar 3 alunos diferentes usando dados do JSON
   - Validar resposta e IDs retornados

3. **Login como Aluno**
   - Login bem-sucedido com aluno cadastrado
   - Falha ao logar com senha incorreta

4. **Registrar Entrega de Trabalho** (Data-Driven)
   - Registrar 3 trabalhos diferentes
   - Validar status, disciplina e aluno
   - Testar validações (campos obrigatórios)

5. **Validações Adicionais**
   - Testes de segurança
   - Testes de autorização

## 📊 Data-Driven Testing

### Arquivo: `test/fixtures/test-data.json`

Contém dados reutilizáveis para os testes:

```json
{
  "admin": {
    "email": "admin@escola.com",
    "senha": "admin123"
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

## 🔐 Helpers

### `test/helpers/auth.helper.js`

Funções auxiliares para autenticação:

```javascript
import { loginAsAdmin, loginAsStudent, createAuthHeader } from './helpers/auth.helper.js';

// Login como admin
const { token, usuario } = await loginAsAdmin('admin@escola.com', 'admin123');

// Login como aluno
const { token, usuario } = await loginAsStudent('joao@escola.com', 'senha123');

// Criar header de autorização
const header = createAuthHeader(token);
```

## 🌍 Variáveis de Ambiente

Configure no arquivo `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/gestao-de-alunos
PORT=3000
NODE_ENV=development
```

Para testes com MongoDB em Docker:
```env
MONGODB_URI=mongodb://mongodb:27017/gestao-de-alunos-test
```

## 🔄 GitHub Actions

Os testes rodam automaticamente:
- ✅ Em cada push para `main`, `master` ou `develop`
- ✅ Em cada Pull Request
- ✅ Com Node.js 18.x e 20.x
- ✅ Com MongoDB em container

**Arquivo**: `.github/workflows/test.yml`

## ✨ Boas Práticas

1. **Use dados do JSON**: Nunca hardcode dados de teste, use `test-data.json`
2. **Use Helpers**: Reutilize `auth.helper.js` para login
3. **Organize por suites**: Use `describe()` para agrupar testes relacionados
4. **Nomes descritivos**: Use `it()` com descrições claras do que está sendo testado
5. **Timeout adequado**: Configure timeout para operações demoradas

## 🐛 Troubleshooting

### MongoDB não conecta
```bash
# Verificar se MongoDB está rodando
mongosh
# ou com MongoDB local
mongo
```

### Testes com timeout
Aumente o timeout nos testes demorados:
```javascript
describe('Suite lenta', function() {
  this.timeout(15000); // 15 segundos
  it('teste', async () => {
    // seu teste
  });
});
```

### Limpar dados de teste
O seeder (seed.js) cria dados iniciais. Para limpar:
```bash
# Deletar database
db.dropDatabase()
```

## 📝 Adicionar Novos Testes

1. Crie um arquivo `nome.test.js` em `/test`
2. Importe as dependências necessárias
3. Use `describe()` e `it()` para estruturar
4. Adicione dados ao `test-data.json`
5. Use helpers quando necessário

Exemplo:
```javascript
import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import testData from './fixtures/test-data.json';

describe('Meus Testes', () => {
  it('deve fazer algo', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send(testData.alunos[0]);
    
    expect(response.status).to.equal(200);
  });
});
```

## 📚 Referências

- [Mocha](https://mochajs.org/) - Framework de testes
- [SuperTest](https://github.com/visionmedia/supertest) - Teste HTTP
- [Chai](https://www.chaijs.com/) - Assertions
- [Mongoose](https://mongoosejs.com/) - ODM MongoDB
