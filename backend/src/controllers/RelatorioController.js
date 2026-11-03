const service = require('../services/RelatorioService');

function completo(req, res) {
  res.status(200).json(service.gerarRelatorioCompleto(req.query));
}

function resumo(req, res) {
  res.status(200).json(service.calcularResumo(req.query));
}

function analise(req, res) {
  res.status(200).json(service.calcularAnalise(req.query));
}

function produtosMaisVendidos(req, res) {
  res.status(200).json(service.calcularProdutosMaisVendidos(req.query));
}

module.exports = { completo, resumo, analise, produtosMaisVendidos };
