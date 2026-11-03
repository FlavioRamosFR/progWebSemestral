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

function obterFornecedor(id) {
  const fornecedor = repository.buscarPorId(id);

  if (!fornecedor) {
    throw new HttpError(404, 'Fornecedor não encontrado');
  }

  return fornecedor;
}

function criarFornecedor(dados) {
  return repository.criar(prepararDados(dados));
}

function atualizarFornecedor(id, dados) {
  obterFornecedor(id);
  return repository.atualizar(id, prepararDados(dados));
}

function excluirFornecedor(id) {
  obterFornecedor(id);

  if (repository.contarProdutosVinculados(id) > 0) {
    throw new HttpError(409, 'Fornecedor possui produtos vinculados');
  }

  repository.excluir(id);
}

module.exports = {
  listarFornecedores,
  obterFornecedor,
  criarFornecedor,
  atualizarFornecedor,
  excluirFornecedor,
};
