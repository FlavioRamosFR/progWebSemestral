const repository = require('../repositories/FornecedorRepository');
const { normalizarFornecedor, validarFornecedor } = require('../models/Fornecedor');
const HttpError = require('../utils/HttpError');

function prepararDados(dados) {
  const fornecedor = normalizarFornecedor(dados);
  const erros = validarFornecedor(fornecedor);

  if (erros.length > 0) {
    throw new HttpError(400, erros.join('; '));
  }

  return fornecedor;
}

function listarFornecedores() {
  return repository.listar();
}

async function obterFornecedor(id) {
  const fornecedor = await repository.buscarPorId(id);

  if (!fornecedor) {
    throw new HttpError(404, 'Fornecedor não encontrado');
  }

  return fornecedor;
}

function criarFornecedor(dados) {
  return repository.criar(prepararDados(dados));
}

async function atualizarFornecedor(id, dados) {
  await obterFornecedor(id);
  return repository.atualizar(id, prepararDados(dados));
}

async function excluirFornecedor(id) {
  await obterFornecedor(id);

  if (await repository.contarProdutosVinculados(id) > 0) {
    throw new HttpError(409, 'Fornecedor possui produtos vinculados');
  }

  await repository.excluir(id);
}

module.exports = {
  listarFornecedores,
  obterFornecedor,
  criarFornecedor,
  atualizarFornecedor,
  excluirFornecedor,
};
