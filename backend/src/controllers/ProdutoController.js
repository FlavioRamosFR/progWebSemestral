const service = require('../services/ProdutoService');
const { formatarProduto } = require('../views/produtoView');
const lerId = require('../utils/lerId');

// O dashboard do front lê a lista em resposta.data
function listar(req, res) {
  res.status(200).json({ data: service.listarProdutos().map(formatarProduto) });
}

function buscar(req, res) {
  res.status(200).json(formatarProduto(service.obterProduto(lerId(req))));
}

function criar(req, res) {
  res.status(201).json(formatarProduto(service.criarProduto(req.body)));
}

function atualizar(req, res) {
  res.status(200).json(formatarProduto(service.atualizarProduto(lerId(req), req.body)));
}

// DELETE /products/1?quantidade=4 -> retira 4 unidades do estoque
// DELETE /products/1              -> exclui o produto
function excluir(req, res) {
  const id = lerId(req);
  const quantidade = req.query.quantidade ?? req.body?.quantidade;

  if (quantidade === undefined) {
    service.excluirProduto(id);
    return res.status(204).send();
  }

  const produto = service.removerQuantidade(id, Number(quantidade));
  res.status(200).json(formatarProduto(produto));
}

function registrarVenda(req, res) {
  const { produto, venda } = service.registrarVenda(
    lerId(req),
    Number(req.body?.quantidadeVendida),
    req.session.usuario.id,
  );

  res.status(200).json({ produto: formatarProduto(produto), venda });
}

module.exports = { listar, buscar, criar, atualizar, excluir, registrarVenda };
