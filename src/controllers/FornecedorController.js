const service = require('../services/FornecedorService');
const { formatarFornecedor } = require('../views/fornecedorView');
const lerId = require('../utils/lerId');

function listar(req, res) {
  res.status(200).json(service.listarFornecedores().map(formatarFornecedor));
}

function buscar(req, res) {
  res.status(200).json(formatarFornecedor(service.obterFornecedor(lerId(req))));
}

function criar(req, res) {
  res.status(201).json(formatarFornecedor(service.criarFornecedor(req.body)));
}

function atualizar(req, res) {
  res.status(200).json(formatarFornecedor(service.atualizarFornecedor(lerId(req), req.body)));
}

function excluir(req, res) {
  service.excluirFornecedor(lerId(req));
  res.status(204).send();
}

module.exports = { listar, buscar, criar, atualizar, excluir };
