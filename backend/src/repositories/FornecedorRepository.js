const { pool } = require('../config/database');

async function listar() {
  const [linhas] = await pool.execute('SELECT * FROM fornecedores ORDER BY nome');
  return linhas;
}

async function buscarPorId(id) {
  const [linhas] = await pool.execute('SELECT * FROM fornecedores WHERE id = ?', [id]);
  return linhas[0];
}

async function criar(fornecedor) {
  const [resultado] = await pool.execute(`
    INSERT INTO fornecedores
      (nome, nomeFantasia, documento, telefone, email, cep, endereco, cidade, estado, observacoes)
    VALUES
      (:nome, :nomeFantasia, :documento, :telefone, :email, :cep, :endereco, :cidade, :estado, :observacoes)
  `, fornecedor);

  return buscarPorId(resultado.insertId);
}

async function atualizar(id, fornecedor) {
  await pool.execute(`
    UPDATE fornecedores SET
      nome = :nome, nomeFantasia = :nomeFantasia, documento = :documento,
      telefone = :telefone, email = :email, cep = :cep, endereco = :endereco,
      cidade = :cidade, estado = :estado, observacoes = :observacoes
    WHERE id = :id
  `, { ...fornecedor, id });

  return buscarPorId(id);
}

async function excluir(id) {
  await pool.execute('DELETE FROM fornecedores WHERE id = ?', [id]);
}

async function contarProdutosVinculados(id) {
  const [linhas] = await pool.execute('SELECT COUNT(*) AS total FROM produtos WHERE fornecedorId = ?', [id]);
  return linhas[0].total;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir, contarProdutosVinculados };
