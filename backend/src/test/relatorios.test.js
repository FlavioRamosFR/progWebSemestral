const { pool } = require('../config/database');
const { logarComoAdm, PRODUTO_VALIDO } = require('./auxiliares');

const OUTUBRO = 'dataInicio=2026-10-01&dataFim=2026-10-31';
const SEM_VENDAS = 'dataInicio=2020-01-01&dataFim=2020-01-31';

let adm;

// Insere a venda direto no banco para controlar a data
function inserirVenda(produto, quantidade, realizadaEm) {
  return pool.execute(`
    INSERT INTO vendas (produtoId, nomeProduto, categoriaProduto, quantidade, valorUnitario, usuarioId, realizadaEm)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `, [produto.id, produto.nome, produto.categoria, quantidade, produto.valor, realizadaEm]);
}

beforeAll(async () => {
  adm = await logarComoAdm();

  const camiseta = (await adm.post('/products').send({ ...PRODUTO_VALIDO, sku: 'A', nome: 'Camiseta', valor: 50 })).body;
  const calca = (await adm.post('/products').send({ ...PRODUTO_VALIDO, sku: 'B', nome: 'Calça', categoria: 'Calça', valor: 100 })).body;
  const short = (await adm.post('/products').send({ ...PRODUTO_VALIDO, sku: 'C', nome: 'Short', categoria: 'Short', valor: 30 })).body;

  // Outubro: 4 vendas, 10 itens
  await inserirVenda(camiseta, 3, '2026-10-01 00:00:00'); // 150 (primeiro instante do período)
  await inserirVenda(camiseta, 3, '2026-10-15 12:00:00'); // 150
  await inserirVenda(calca, 2, '2026-10-20 10:00:00'); //    200
  await inserirVenda(short, 2, '2026-10-31 23:59:59'); //     60 (último instante do período)

  // Fora do período: não pode entrar nas contas
  await inserirVenda(calca, 50, '2026-09-30 23:59:59');
  await inserirVenda(calca, 50, '2026-11-01 00:00:00');
});

test('summary calcula os totais do período', async () => {
  const resposta = await adm.get(`/reports/sales/summary?${OUTUBRO}`).expect(200);

  expect(resposta.body).toEqual({
    faturamentoTotal: 560, //  150 + 150 + 200 + 60
    vendasRealizadas: 4,
    itensVendidos: 10, //      3 + 3 + 2 + 2
    ticketMedio: 140, //       560 / 4
  });
});

test('analysis identifica o produto mais vendido e o percentual', async () => {
  const resposta = await adm.get(`/reports/sales/analysis?${OUTUBRO}`).expect(200);

  expect(resposta.body).toEqual({
    produtoMaisVendido: 'Camiseta',
    quantidadeVendida: 6, // 3 + 3
    percentualVendas: 60, // 6 / 10 * 100
    faturamentoTotal: 560,
    quantidadeVendas: 4,
    ticketMedio: 140,
  });
});

test('top-products ordena por quantidade e numera as posições', async () => {
  const resposta = await adm.get(`/reports/sales/top-products?${OUTUBRO}`).expect(200);

  expect(resposta.body).toEqual([
    { id: expect.any(Number), nome: 'Camiseta', categoria: 'Camisa', quantidadeVendida: 6, faturamento: 300, posicao: 1 },
    { id: expect.any(Number), nome: 'Calça', categoria: 'Calça', quantidadeVendida: 2, faturamento: 200, posicao: 2 },
    { id: expect.any(Number), nome: 'Short', categoria: 'Short', quantidadeVendida: 2, faturamento: 60, posicao: 3 },
  ]);
});

test('/reports reúne todos os campos combinados com o front', async () => {
  const resposta = await adm.get(`/reports?${OUTUBRO}`).expect(200);

  expect(resposta.body).toMatchObject({
    id: '2026-10-01_2026-10-31',
    dataInicio: '2026-10-01',
    dataFim: '2026-10-31',
    faturamentoTotal: 560,
    vendasRealizadas: 4,
    itensVendidos: 10,
    ticketMedio: 140,
    produtoMaisVendido: 'Camiseta',
    quantidadeVendida: 6,
    percentualVendas: 60,
    quantidadeVendas: 4,
  });
  expect(resposta.body.produtosMaisVendidos).toHaveLength(3);
});

test('período sem vendas responde zero, sem divisão por zero', async () => {
  const resposta = await adm.get(`/reports?${SEM_VENDAS}`).expect(200);

  expect(resposta.body).toMatchObject({
    faturamentoTotal: 0,
    vendasRealizadas: 0,
    itensVendidos: 0,
    ticketMedio: 0,
    produtoMaisVendido: '',
    quantidadeVendida: 0,
    percentualVendas: 0,
    produtosMaisVendidos: [],
  });
});

test.each([
  ['sem datas', ''],
  ['sem dataFim', '?dataInicio=2026-10-01'],
  ['formato errado', '?dataInicio=01/10/2026&dataFim=31/10/2026'],
  ['data inexistente', '?dataInicio=2026-02-31&dataFim=2026-03-01'],
  ['início depois do fim', '?dataInicio=2026-10-31&dataFim=2026-10-01'],
])('recusa período inválido: %s', async (_caso, parametros) => {
  await adm.get(`/reports/sales/summary${parametros}`).expect(400);
});

test('uma venda feita pela API entra no relatório do dia e continua após excluir o produto', async () => {
  const [[{ hoje }]] = await pool.query('SELECT CURDATE() AS hoje');
  const periodo = `dataInicio=${hoje}&dataFim=${hoje}`;

  const produto = (await adm.post('/products').send({ ...PRODUTO_VALIDO, sku: 'D', nome: 'Meia', valor: 10 })).body;
  await adm.patch(`/products/${produto.id}/sale`).send({ quantidadeVendida: 2 }).expect(200);
  await adm.delete(`/products/${produto.id}`).expect(204);

  const resposta = await adm.get(`/reports/sales/analysis?${periodo}`).expect(200);

  expect(resposta.body).toMatchObject({ produtoMaisVendido: 'Meia', quantidadeVendida: 2, faturamentoTotal: 20 });
});
