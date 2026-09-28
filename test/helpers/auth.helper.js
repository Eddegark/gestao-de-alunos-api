import request from 'supertest';
import app from '../../src/app.js';

export async function loginAsAdmin(email, password) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, senha: password });

  if (response.status !== 200) {
    throw new Error(`Failed to login as admin: ${response.body.error || response.body.message}`);
  }

  return {
    token: response.body.token,
    usuario: response.body.usuario,
  };
}

export async function loginAsStudent(email, password) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, senha: password });

  if (response.status !== 200) {
    throw new Error(`Failed to login as student: ${response.body.error || response.body.message}`);
  }

  return {
    token: response.body.token,
    usuario: response.body.usuario,
  };
}

export function createAuthHeader(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export default { loginAsAdmin, loginAsStudent, createAuthHeader };
