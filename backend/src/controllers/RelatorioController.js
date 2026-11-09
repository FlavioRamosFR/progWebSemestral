const service = require('../services/RelatorioService');

async function completo(req, res) {
  res.status(200).json(await service.gerarRelatorioCompleto(req.query));
}

async function resumo(req, res) {
  res.status(200).json(await service.calcularResumo(req.query));
}

async function analise(req, res) {
  res.status(200).json(await service.calcularAnalise(req.query));
}

async function produtosMaisVendidos(req, res) {
  res.status(200).json(await service.calcularProdutosMaisVendidos(req.query));
}

module.exports = { completo, resumo, analise, produtosMaisVendidos };
