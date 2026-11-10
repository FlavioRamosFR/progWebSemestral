const service = require('../services/FornecedorService');
const { formatarFornecedor } = require('../views/fornecedorView');
const lerId = require('../utils/lerId');

async function listar(req, res) {
  const fornecedores = await service.listarFornecedores();
  res.status(200).json(fornecedores.map(formatarFornecedor));
}

async function buscar(req, res) {
  res.status(200).json(formatarFornecedor(await service.obterFornecedor(lerId(req))));
}

async function criar(req, res) {
  res.status(201).json(formatarFornecedor(await service.criarFornecedor(req.body)));
}

async function atualizar(req, res) {
  res.status(200).json(formatarFornecedor(await service.atualizarFornecedor(lerId(req), req.body)));
}

async function excluir(req, res) {
  await service.excluirFornecedor(lerId(req));
  res.status(204).send();
}

module.exports = { listar, buscar, criar, atualizar, excluir };
