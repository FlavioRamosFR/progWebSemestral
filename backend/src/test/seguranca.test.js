const request = require('supertest');
const { app } = require('./auxiliares');

test('/saude confirma que a API e o banco estão no ar', async () => {
  const resposta = await request(app).get('/saude').expect(200);

  expect(resposta.body).toEqual({ status: 'ok' });
});

test('envia cabeçalhos de segurança e proíbe cache das respostas', async () => {
  const resposta = await request(app).get('/products');

  expect(resposta.headers['x-content-type-options']).toBe('nosniff');
  expect(resposta.headers['cache-control']).toBe('no-store');
});

test('informa o limite de requisições restante', async () => {
  const resposta = await request(app).get('/saude');

  expect(resposta.headers.ratelimit).toMatch(/r=\d+/);
});

test('bloqueia o login após 10 tentativas erradas em 15 minutos', async () => {
  const tentar = (senha) => request(app)
    .post('/login')
    .send({ username: 'adm@teste.com', password: senha });

  for (let tentativa = 1; tentativa <= 10; tentativa += 1) {
    await tentar('senha-errada').expect(401);
  }

  const bloqueada = await tentar('senha-errada').expect(429);
  expect(bloqueada.body.erro).toMatch(/Muitas tentativas/);

  // Bloqueado, nem a senha certa entra até o prazo acabar
  await tentar('senha-adm').expect(429);
});
