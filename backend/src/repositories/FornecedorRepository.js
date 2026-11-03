const db = require('../config/database');

function listar() {
  return db.prepare('SELECT * FROM fornecedores ORDER BY nome').all();
}

function buscarPorId(id) {
  return db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(id);
}

function criar(fornecedor) {
  const resultado = db.prepare(`
    INSERT INTO fornecedores
      (nome, nomeFantasia, documento, telefone, email, cep, endereco, cidade, estado, observacoes)
    VALUES
      (@nome, @nomeFantasia, @documento, @telefone, @email, @cep, @endereco, @cidade, @estado, @observacoes)
  `).run(fornecedor);

  return buscarPorId(resultado.lastInsertRowid);
}

function atualizar(id, fornecedor) {
  db.prepare(`
    UPDATE fornecedores SET
      nome = @nome, nomeFantasia = @nomeFantasia, documento = @documento,
      telefone = @telefone, email = @email, cep = @cep, endereco = @endereco,
      cidade = @cidade, estado = @estado, observacoes = @observacoes
    WHERE id = @id
  `).run({ ...fornecedor, id });

  return buscarPorId(id);
}

function excluir(id) {
  db.prepare('DELETE FROM fornecedores WHERE id = ?').run(id);
}

function contarProdutosVinculados(id) {
  return db.prepare('SELECT COUNT(*) AS total FROM produtos WHERE fornecedorId = ?').get(id).total;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir, contarProdutosVinculados };
