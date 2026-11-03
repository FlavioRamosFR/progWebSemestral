const db = require('../config/database');

function listar() {
  return db.prepare('SELECT * FROM produtos ORDER BY nome').all();
}

function buscarPorId(id) {
  return db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
}

function buscarPorSku(sku) {
  return db.prepare('SELECT * FROM produtos WHERE sku = ?').get(sku);
}

function criar(produto) {
  const resultado = db.prepare(`
    INSERT INTO produtos (sku, nome, categoria, valor, quantidade, tamanho, descricao, imagem, fornecedorId)
    VALUES (@sku, @nome, @categoria, @valor, @quantidade, @tamanho, @descricao, @imagem, @fornecedorId)
  `).run(produto);

  return buscarPorId(resultado.lastInsertRowid);
}

function atualizar(id, produto) {
  db.prepare(`
    UPDATE produtos SET
      sku = @sku, nome = @nome, categoria = @categoria, valor = @valor,
      quantidade = @quantidade, tamanho = @tamanho, descricao = @descricao,
      imagem = @imagem, fornecedorId = @fornecedorId
    WHERE id = @id
  `).run({ ...produto, id });

  return buscarPorId(id);
}

function excluir(id) {
  db.prepare('DELETE FROM produtos WHERE id = ?').run(id);
}

// A condição "quantidade >= ?" impede que o estoque fique negativo.
// Retorna false quando não havia estoque suficiente.
function reduzirEstoque(id, quantidade) {
  const resultado = db
    .prepare('UPDATE produtos SET quantidade = quantidade - ? WHERE id = ? AND quantidade >= ?')
    .run(quantidade, id, quantidade);

  return resultado.changes > 0;
}

module.exports = { listar, buscarPorId, buscarPorSku, criar, atualizar, excluir, reduzirEstoque };
