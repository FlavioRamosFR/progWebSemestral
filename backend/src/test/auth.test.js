const request = require('supertest');
const { app, logarComoAdm, logarComoFuncionario, PRODUTO_VALIDO } = require('./auxiliares');

describe('login', () => {
  test('entra com credenciais corretas e devolve o perfil, sem a senha', async () => {
    const resposta = await request(app)
      .post('/login')
      .send({ username: 'adm@teste.com', password: 'senha-adm' });

    expect(resposta.status).toBe(200);
    expect(resposta.body.usuario.perfil).toBe('ADM');
    expect(resposta.body.usuario.senhaHash).toBeUndefined();
    expect(resposta.headers['set-cookie'][0]).toMatch(/HttpOnly/);
  });

  test.each([
    ['senha errada', { username: 'adm@teste.com', password: 'errada' }],
    ['e-mail inexistente', { username: 'nao@existe.com', password: 'senha-adm' }],
    ['corpo vazio', undefined],
  ])('recusa %s', async (_caso, corpo) => {
    const resposta = await request(app).post('/login').send(corpo);

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro).toBe('Credenciais inválidas');
  });

  test('logout encerra a sessão', async () => {
    const agente = await logarComoFuncionario();

    await agente.get('/perfil').expect(200);
    await agente.post('/logout').expect(200);
    await agente.get('/perfil').expect(401);
  });
});

describe('middlewares de acesso', () => {
  test.each([
    ['get', '/products'],
    ['post', '/products'],
    ['get', '/providers'],
    ['get', '/reports?dataInicio=2026-01-01&dataFim=2026-01-31'],
  ])('sem login, %s %s responde 401', async (metodo, rota) => {
    await request(app)[metodo](rota).expect(401);
  });

  test('funcionário consulta, mas não altera o cadastro nem vê relatórios', async () => {
    const funcionario = await logarComoFuncionario();

    await funcionario.get('/products').expect(200);
    await funcionario.get('/providers').expect(200);
    await funcionario.post('/products').send(PRODUTO_VALIDO).expect(403);
    await funcionario.put('/products/1').send(PRODUTO_VALIDO).expect(403);
    await funcionario.delete('/products/1').expect(403);
    await funcionario.post('/providers').send({ nome: 'X', email: 'x@x.com' }).expect(403);
    await funcionario.get('/reports/sales/summary').expect(403);
  });

  test('ADM acessa tudo', async () => {
    const adm = await logarComoAdm();

    await adm.post('/products').send(PRODUTO_VALIDO).expect(201);
    await adm.get('/reports/sales/summary?dataInicio=2026-01-01&dataFim=2026-01-31').expect(200);
  });
});

test('rota desconhecida responde 404 em JSON', async () => {
  const resposta = await request(app).get('/nao-existe');

  expect(resposta.status).toBe(404);
  expect(resposta.body.erro).toBe('Rota não encontrada');
});

test('JSON malformado responde 400', async () => {
  await request(app)
    .post('/login')
    .set('Content-Type', 'application/json')
    .send('{quebrado')
    .expect(400);
});
