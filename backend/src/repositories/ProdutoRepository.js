const { pool } = require('../config/database');

// As funções usadas na venda recebem a "conexao" da transação.
// Fora dela, usam o pool normalmente.

async function listar() {
  const [linhas] = await pool.execute('SELECT * FROM produtos ORDER BY nome');
  return linhas;
}

async function buscarPorId(id, conexao = pool) {
  const [linhas] = await conexao.execute('SELECT * FROM produtos WHERE id = ?', [id]);
  return linhas[0];
}

async function buscarPorSku(sku) {
  const [linhas] = await pool.execute('SELECT * FROM produtos WHERE sku = ?', [sku]);
  return linhas[0];
}

async function criar(produto) {
  const [resultado] = await pool.execute(`
    INSERT INTO produtos (sku, nome, categoria, valor, quantidade, tamanho, descricao, imagem, fornecedorId)
    VALUES (:sku, :nome, :categoria, :valor, :quantidade, :tamanho, :descricao, :imagem, :fornecedorId)
  `, produto);

  return buscarPorId(resultado.insertId);
}

async function atualizar(id, produto) {
  await pool.execute(`
    UPDATE produtos SET
      sku = :sku, nome = :nome, categoria = :categoria, valor = :valor,
      quantidade = :quantidade, tamanho = :tamanho, descricao = :descricao,
      imagem = :imagem, fornecedorId = :fornecedorId
    WHERE id = :id
  `, { ...produto, id });

  return buscarPorId(id);
}

async function excluir(id) {
  await pool.execute('DELETE FROM produtos WHERE id = ?', [id]);
}

// A condição "quantidade >= ?" impede que o estoque fique negativo.
// Retorna false quando não havia estoque suficiente.
async function reduzirEstoque(id, quantidade, conexao = pool) {
  const [resultado] = await conexao.execute(
    'UPDATE produtos SET quantidade = quantidade - ? WHERE id = ? AND quantidade >= ?',
    [quantidade, id, quantidade],
  );

  return resultado.affectedRows > 0;
}

module.exports = { listar, buscarPorId, buscarPorSku, criar, atualizar, excluir, reduzirEstoque };
