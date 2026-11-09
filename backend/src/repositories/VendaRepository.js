const { pool } = require('../config/database');

const FILTRO_PERIODO = 'DATE(realizadaEm) BETWEEN :dataInicio AND :dataFim';

// Recebe a "conexao" da transação da venda
async function registrar({ produto, quantidade, usuarioId }, conexao = pool) {
  const [resultado] = await conexao.execute(`
    INSERT INTO vendas (produtoId, nomeProduto, categoriaProduto, quantidade, valorUnitario, usuarioId)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [produto.id, produto.nome, produto.categoria, quantidade, produto.valor, usuarioId]);

  const [linhas] = await conexao.execute('SELECT * FROM vendas WHERE id = ?', [resultado.insertId]);
  return linhas[0];
}

// Totais do período: as somas e a contagem que alimentam o resumo
async function totaisDoPeriodo(periodo) {
  const [linhas] = await pool.execute(`
    SELECT
      COALESCE(SUM(quantidade * valorUnitario), 0) AS faturamentoTotal,
      COUNT(*) AS vendasRealizadas,
      COALESCE(SUM(quantidade), 0) AS itensVendidos
    FROM vendas
    WHERE ${FILTRO_PERIODO}
  `, periodo);

  return linhas[0];
}

// Vendas agrupadas por produto, do mais vendido para o menos vendido
async function produtosMaisVendidos(periodo) {
  const [linhas] = await pool.execute(`
    SELECT
      produtoId AS id,
      MAX(nomeProduto) AS nome,
      MAX(categoriaProduto) AS categoria,
      SUM(quantidade) AS quantidadeVendida,
      SUM(quantidade * valorUnitario) AS faturamento
    FROM vendas
    WHERE ${FILTRO_PERIODO}
    GROUP BY produtoId
    ORDER BY quantidadeVendida DESC, faturamento DESC, nome
  `, periodo);

  return linhas;
}

module.exports = { registrar, totaisDoPeriodo, produtosMaisVendidos };
