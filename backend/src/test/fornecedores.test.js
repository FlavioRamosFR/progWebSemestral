const { logarComoAdm, PRODUTO_VALIDO } = require('./auxiliares');

const FORNECEDOR_VALIDO = {
  nome: 'Malharia Brasil LTDA',
  nomeFantasia: 'Malharia Brasil',
  documento: '12.345.678/0001-90',
  telefone: '(67) 99999-0000',
  email: 'contato@malharia.com',
  cep: '79000-000',
  endereco: 'Rua das Flores, 100',
  cidade: 'Campo Grande',
  estado: 'ms',
  observacoes: 'Entrega em 5 dias',
};

let adm;

beforeAll(async () => {
  adm = await logarComoAdm();
});

test('faz o CRUD completo', async () => {
  const criado = await adm.post('/providers').send(FORNECEDOR_VALIDO).expect(201);
  expect(criado.body).toMatchObject({ ...FORNECEDOR_VALIDO, estado: 'MS' });
  expect(criado.body.id).toEqual(expect.any(String));

  const rota = `/providers/${criado.body.id}`;

  const lista = await adm.get('/providers').expect(200);
  expect(lista.body.map((item) => item.id)).toContain(criado.body.id);

  const buscado = await adm.get(rota).expect(200);
  expect(buscado.body.nome).toBe(FORNECEDOR_VALIDO.nome);

  const atualizado = await adm.put(rota).send({ ...FORNECEDOR_VALIDO, cidade: 'Dourados' }).expect(200);
  expect(atualizado.body.cidade).toBe('Dourados');

  await adm.delete(rota).expect(204);
  await adm.get(rota).expect(404);
});

test('exige nome e pelo menos um contato', async () => {
  await adm.post('/providers').send({ email: 'a@a.com' }).expect(400);
  await adm.post('/providers').send({ nome: 'Sem contato' }).expect(400);
});

test('não exclui fornecedor com produtos vinculados', async () => {
  const fornecedor = await adm.post('/providers').send(FORNECEDOR_VALIDO).expect(201);

  // O id chega como texto, igual ao que o formulário do front envia
  const produto = await adm
    .post('/products')
    .send({ ...PRODUTO_VALIDO, fornecedorId: fornecedor.body.id })
    .expect(201);
  expect(produto.body.fornecedorId).toBe(fornecedor.body.id);

  await adm.delete(`/providers/${fornecedor.body.id}`).expect(409);

  await adm.delete(`/products/${produto.body.id}`).expect(204);
  await adm.delete(`/providers/${fornecedor.body.id}`).expect(204);
});
