const { emTransacao } = require('../config/database');
const repository = require('../repositories/ProdutoRepository');
const fornecedorRepository = require('../repositories/FornecedorRepository');
const vendaRepository = require('../repositories/VendaRepository');
const { normalizarProduto, validarProduto, ehInteiroPositivo } = require('../models/Produto');
const HttpError = require('../utils/HttpError');

async function prepararDados(dados, idAtual = null) {
  const produto = normalizarProduto(dados);
  const erros = validarProduto(produto);

  if (erros.length > 0) {
    throw new HttpError(400, erros.join('; '));
  }

  if (produto.fornecedorId !== null && !await fornecedorRepository.buscarPorId(produto.fornecedorId)) {
    throw new HttpError(400, 'Fornecedor não encontrado');
  }

  const mesmoSku = produto.sku && await repository.buscarPorSku(produto.sku);
  if (mesmoSku && mesmoSku.id !== idAtual) {
    throw new HttpError(409, 'Já existe um produto com este SKU');
  }

  return produto;
}

function listarProdutos() {
  return repository.listar();
}

async function obterProduto(id, conexao) {
  const produto = await repository.buscarPorId(id, conexao);

  if (!produto) {
    throw new HttpError(404, 'Produto não encontrado');
  }

  return produto;
}

async function criarProduto(dados) {
  return repository.criar(await prepararDados(dados));
}

async function atualizarProduto(id, dados) {
  await obterProduto(id);
  return repository.atualizar(id, await prepararDados(dados, id));
}

async function excluirProduto(id) {
  await obterProduto(id);
  await repository.excluir(id);
}

async function retirarDoEstoque(id, quantidade, conexao) {
  if (!ehInteiroPositivo(quantidade)) {
    throw new HttpError(400, 'A quantidade deve ser um número inteiro maior que zero');
  }

  const produto = await obterProduto(id, conexao);

  if (!await repository.reduzirEstoque(id, quantidade, conexao)) {
    throw new HttpError(400, `Estoque insuficiente: há ${produto.quantidade} unidade(s) disponível(is)`);
  }
}

// Remove só a quantidade informada (ex.: 4 de 30 camisetas). O produto continua
// cadastrado mesmo se o estoque chegar a zero. Isso não conta como venda.
async function removerQuantidade(id, quantidade) {
  await retirarDoEstoque(id, quantidade);
  return obterProduto(id);
}

// A transação garante as duas operações juntas: baixa no estoque e registro da venda
function registrarVenda(id, quantidade, usuarioId) {
  return emTransacao(async (conexao) => {
    await retirarDoEstoque(id, quantidade, conexao);

    const produto = await obterProduto(id, conexao);
    const venda = await vendaRepository.registrar({ produto, quantidade, usuarioId }, conexao);

    return { produto, venda };
  });
}

module.exports = {
  listarProdutos,
  obterProduto,
  criarProduto,
  atualizarProduto,
  excluirProduto,
  removerQuantidade,
  registrarVenda,
};
