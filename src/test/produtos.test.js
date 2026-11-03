const { logarComoAdm, logarComoFuncionario, PRODUTO_VALIDO } = require('./auxiliares');

let adm;
let contador = 0;

beforeAll(async () => {
  adm = await logarComoAdm();
});

// Cada teste cria o seu produto, com SKU próprio
async function criarProduto(campos = {}) {
  contador += 1;
  const resposta = await adm
    .post('/products')
    .send({ ...PRODUTO_VALIDO, sku: `SKU-${contador}`, ...campos })
    .expect(201);

  return resposta.body;
}

describe('CRUD de produtos', () => {
  test('cria e devolve os campos em português e em inglês', async () => {
    const produto = await criarProduto();

    expect(produto).toMatchObject({
      nome: 'Camiseta', categoria: 'Camisa', valor: 50, quantidade: 30,
      name: 'Camiseta', category: 'Camisa', price: 50, quantity: 30,
    });
    expect(produto.id).toEqual(expect.any(Number));
  });

  test('lista dentro de { data }, formato lido pelo dashboard', async () => {
    const produto = await criarProduto();
    const resposta = await adm.get('/products').expect(200);

    expect(resposta.body.data.map((item) => item.id)).toContain(produto.id);
  });

  test('aceita o formato em inglês enviado pelo dashboard', async () => {
    const produto = await criarProduto({
      nome: undefined, categoria: undefined, valor: undefined, quantidade: undefined,
      name: 'Boné', category: 'Acessório', price: 25.5, quantity: 3, image: 'bone.png',
    });

    expect(produto).toMatchObject({ nome: 'Boné', valor: 25.5, quantidade: 3, imagem: 'bone.png' });
  });

  test('atualiza', async () => {
    const produto = await criarProduto();
    const resposta = await adm
      .put(`/products/${produto.id}`)
      .send({ ...PRODUTO_VALIDO, sku: produto.sku, nome: 'Camiseta nova', valor: 60 })
      .expect(200);

    expect(resposta.body).toMatchObject({ nome: 'Camiseta nova', valor: 60 });
  });

  test('recusa dados inválidos', async () => {
    const resposta = await adm
      .post('/products')
      .send({ nome: '', categoria: '', valor: -1, quantidade: 1.5 })
      .expect(400);

    expect(resposta.body.erro).toMatch(/nome/);
    expect(resposta.body.erro).toMatch(/valor/);
    expect(resposta.body.erro).toMatch(/quantidade/);
  });

  test('recusa SKU repetido, mas permite manter o próprio', async () => {
    const produto = await criarProduto();

    await adm.post('/products').send({ ...PRODUTO_VALIDO, sku: produto.sku }).expect(409);
    await adm.put(`/products/${produto.id}`).send({ ...PRODUTO_VALIDO, sku: produto.sku }).expect(200);
  });

  test('aceita SKU vazio em mais de um produto', async () => {
    await criarProduto({ sku: '' });
    await criarProduto({ sku: '' });
  });

  test('recusa fornecedor inexistente', async () => {
    await adm.post('/products').send({ ...PRODUTO_VALIDO, sku: 'F-1', fornecedorId: 9999 }).expect(400);
  });

  test('id inexistente ou inválido responde 404', async () => {
    await adm.get('/products/9999').expect(404);
    await adm.get('/products/abc').expect(404);
    await adm.delete('/products/9999').expect(404);
  });
});

describe('DELETE de produtos', () => {
  test('remove só a quantidade informada: 30 camisetas - 4 = 26', async () => {
    const produto = await criarProduto({ quantidade: 30 });
    const resposta = await adm.delete(`/products/${produto.id}?quantidade=4`).expect(200);

    expect(resposta.body.quantidade).toBe(26);
  });

  test('também aceita a quantidade no corpo da requisição', async () => {
    const produto = await criarProduto({ quantidade: 30 });
    const resposta = await adm.delete(`/products/${produto.id}`).send({ quantidade: 4 }).expect(200);

    expect(resposta.body.quantidade).toBe(26);
  });

  test('remover todo o estoque mantém o produto com quantidade zero', async () => {
    const produto = await criarProduto({ quantidade: 5 });
    const resposta = await adm.delete(`/products/${produto.id}?quantidade=5`).expect(200);

    expect(resposta.body.quantidade).toBe(0);
    await adm.get(`/products/${produto.id}`).expect(200);
  });

  test.each(['31', '0', '-1', '1.5', 'abc'])('recusa quantidade %s e não altera o estoque', async (quantidade) => {
    const produto = await criarProduto({ quantidade: 30 });

    await adm.delete(`/products/${produto.id}?quantidade=${quantidade}`).expect(400);

    const resposta = await adm.get(`/products/${produto.id}`);
    expect(resposta.body.quantidade).toBe(30);
  });

  test('sem quantidade, exclui o produto', async () => {
    const produto = await criarProduto();

    await adm.delete(`/products/${produto.id}`).expect(204);
    await adm.get(`/products/${produto.id}`).expect(404);
  });
});

describe('venda', () => {
  test('funcionário vende e o estoque baixa', async () => {
    const funcionario = await logarComoFuncionario();
    const produto = await criarProduto({ quantidade: 10 });
    const resposta = await funcionario
      .patch(`/products/${produto.id}/sale`)
      .send({ quantidadeVendida: 3 })
      .expect(200);

    expect(resposta.body.produto.quantidade).toBe(7);
    expect(resposta.body.venda).toMatchObject({ quantidade: 3, valorUnitario: 50 });
  });

  test.each([[11], [0], [undefined]])('recusa vender %s unidade(s) com 10 em estoque', async (quantidadeVendida) => {
    const produto = await criarProduto({ quantidade: 10 });

    await adm.patch(`/products/${produto.id}/sale`).send({ quantidadeVendida }).expect(400);

    const resposta = await adm.get(`/products/${produto.id}`);
    expect(resposta.body.quantidade).toBe(10);
  });
});
