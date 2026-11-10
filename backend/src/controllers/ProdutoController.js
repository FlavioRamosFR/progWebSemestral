const service = require('../services/ProdutoService');
const { formatarProduto } = require('../views/produtoView');
const lerId = require('../utils/lerId');

// O dashboard do front lê a lista em resposta.data
async function listar(req, res) {
  const produtos = await service.listarProdutos();
  res.status(200).json({ data: produtos.map(formatarProduto) });
}

async function buscar(req, res) {
  res.status(200).json(formatarProduto(await service.obterProduto(lerId(req))));
}

async function criar(req, res) {
  res.status(201).json(formatarProduto(await service.criarProduto(req.body)));
}

async function atualizar(req, res) {
  res.status(200).json(formatarProduto(await service.atualizarProduto(lerId(req), req.body)));
}

// DELETE /products/1?quantidade=4 -> retira 4 unidades do estoque
// DELETE /products/1              -> exclui o produto
async function excluir(req, res) {
  const id = lerId(req);
  const quantidade = req.query.quantidade ?? req.body?.quantidade;

  if (quantidade === undefined) {
    await service.excluirProduto(id);
    return res.status(204).send();
  }

  const produto = await service.removerQuantidade(id, Number(quantidade));
  res.status(200).json(formatarProduto(produto));
}

async function registrarVenda(req, res) {
  const { produto, venda } = await service.registrarVenda(
    lerId(req),
    Number(req.body?.quantidadeVendida),
    req.session.usuario.id,
  );

  res.status(200).json({ produto: formatarProduto(produto), venda });
}

module.exports = { listar, buscar, criar, atualizar, excluir, registrarVenda };
