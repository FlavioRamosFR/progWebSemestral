const db = require('../config/database');

const FILTRO_PERIODO = 'date(realizadaEm) BETWEEN @dataInicio AND @dataFim';

function registrar({ produto, quantidade, usuarioId }) {
  const resultado = db.prepare(`
    INSERT INTO vendas (produtoId, nomeProduto, categoriaProduto, quantidade, valorUnitario, usuarioId)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(produto.id, produto.nome, produto.categoria, quantidade, produto.valor, usuarioId);

  return db.prepare('SELECT * FROM vendas WHERE id = ?').get(resultado.lastInsertRowid);
}

// Totais do período: as somas e a contagem que alimentam o resumo
function totaisDoPeriodo(periodo) {
  return db.prepare(`
    SELECT
      COALESCE(SUM(quantidade * valorUnitario), 0) AS faturamentoTotal,
      COUNT(*) AS vendasRealizadas,
      COALESCE(SUM(quantidade), 0) AS itensVendidos
    FROM vendas
    WHERE ${FILTRO_PERIODO}
  `).get(periodo);
}

// Vendas agrupadas por produto, do mais vendido para o menos vendido
function produtosMaisVendidos(periodo) {
  return db.prepare(`
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
  `).all(periodo);
}

module.exports = { registrar, totaisDoPeriodo, produtosMaisVendidos };
