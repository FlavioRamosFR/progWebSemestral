const db = require('../config/database');
const repository = require('../repositories/ProdutoRepository');
const fornecedorRepository = require('../repositories/FornecedorRepository');
const vendaRepository = require('../repositories/VendaRepository');
const { normalizarProduto, validarProduto, ehInteiroPositivo } = require('../models/Produto');
const HttpError = require('../utils/HttpError');

function prepararDados(dados, idAtual = null) {
  const produto = normalizarProduto(dados);
  const erros = validarProduto(produto);

  if (erros.length > 0) {
    throw new HttpError(400, erros.join('; '));
  }

  if (produto.fornecedorId !== null && !fornecedorRepository.buscarPorId(produto.fornecedorId)) {
    throw new HttpError(400, 'Fornecedor não encontrado');
  }

  const mesmoSku = produto.sku && repository.buscarPorSku(produto.sku);
  if (mesmoSku && mesmoSku.id !== idAtual) {
    throw new HttpError(409, 'Já existe um produto com este SKU');
  }

  return produto;
}

function listarProdutos() {
  return repository.listar();
}

function obterProduto(id) {
  const produto = repository.buscarPorId(id);

  if (!produto) {
    throw new HttpError(404, 'Produto não encontrado');
  }

  return produto;
}

function criarProduto(dados) {
  return repository.criar(prepararDados(dados));
}

function atualizarProduto(id, dados) {
  obterProduto(id);
  return repository.atualizar(id, prepararDados(dados, id));
}

function excluirProduto(id) {
  obterProduto(id);
  repository.excluir(id);
}

function retirarDoEstoque(id, quantidade) {
  if (!ehInteiroPositivo(quantidade)) {
    throw new HttpError(400, 'A quantidade deve ser um número inteiro maior que zero');
  }

  const produto = obterProduto(id);

  if (!repository.reduzirEstoque(id, quantidade)) {
    throw new HttpError(400, `Estoque insuficiente: há ${produto.quantidade} unidade(s) disponível(is)`);
  }
}

// Remove só a quantidade informada (ex.: 4 de 30 camisetas). O produto continua
// cadastrado mesmo se o estoque chegar a zero. Isso não conta como venda.
function removerQuantidade(id, quantidade) {
  retirarDoEstoque(id, quantidade);
  return obterProduto(id);
}

// A transação garante as duas operações juntas: baixa no estoque e registro da venda
const registrarVenda = db.transaction((id, quantidade, usuarioId) => {
  retirarDoEstoque(id, quantidade);

  const produto = obterProduto(id);
  const venda = vendaRepository.registrar({ produto, quantidade, usuarioId });

  return { produto, venda };
});

module.exports = {
  listarProdutos,
  obterProduto,
  criarProduto,
  atualizarProduto,
  excluirProduto,
  removerQuantidade,
  registrarVenda,
};
