const repository = require('../repositories/VendaRepository');
const { validarPeriodo } = require('../models/Relatorio');
const HttpError = require('../utils/HttpError');

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

// Evita a divisão por zero quando o período não tem vendas
function dividir(dividendo, divisor) {
  return divisor > 0 ? dividendo / divisor : 0;
}

function lerPeriodo({ dataInicio, dataFim } = {}) {
  const erros = validarPeriodo({ dataInicio, dataFim });

  if (erros.length > 0) {
    throw new HttpError(400, erros.join('; '));
  }

  return { dataInicio, dataFim };
}

function calcularResumo(filtro) {
  const periodo = lerPeriodo(filtro);
  const { faturamentoTotal, vendasRealizadas, itensVendidos } = repository.totaisDoPeriodo(periodo);

  return {
    faturamentoTotal: arredondar(faturamentoTotal),
    vendasRealizadas,
    itensVendidos,
    // ticket médio = faturamento total / quantidade de vendas
    ticketMedio: arredondar(dividir(faturamentoTotal, vendasRealizadas)),
  };
}

function calcularProdutosMaisVendidos(filtro) {
  const periodo = lerPeriodo(filtro);

  // A consulta já vem em ordem decrescente de quantidade: a posição é o índice + 1
  return repository.produtosMaisVendidos(periodo).map((produto, indice) => ({
    id: produto.id,
    nome: produto.nome,
    categoria: produto.categoria,
    quantidadeVendida: produto.quantidadeVendida,
    faturamento: arredondar(produto.faturamento),
    posicao: indice + 1,
  }));
}

function calcularAnalise(filtro) {
  const resumo = calcularResumo(filtro);
  const [maisVendido] = calcularProdutosMaisVendidos(filtro);
  const quantidadeVendida = maisVendido ? maisVendido.quantidadeVendida : 0;

  return {
    produtoMaisVendido: maisVendido ? maisVendido.nome : '',
    quantidadeVendida,
    // percentual = quantidade do mais vendido / total de itens vendidos * 100
    percentualVendas: arredondar(dividir(quantidadeVendida, resumo.itensVendidos) * 100),
    faturamentoTotal: resumo.faturamentoTotal,
    quantidadeVendas: resumo.vendasRealizadas,
    ticketMedio: resumo.ticketMedio,
  };
}

function gerarRelatorioCompleto(filtro) {
  const { dataInicio, dataFim } = lerPeriodo(filtro);
  const resumo = calcularResumo(filtro);
  const analise = calcularAnalise(filtro);

  return {
    id: `${dataInicio}_${dataFim}`,
    dataInicio,
    dataFim,
    ...resumo,
    produtoMaisVendido: analise.produtoMaisVendido,
    quantidadeVendida: analise.quantidadeVendida,
    percentualVendas: analise.percentualVendas,
    quantidadeVendas: analise.quantidadeVendas,
    produtosMaisVendidos: calcularProdutosMaisVendidos(filtro),
  };
}

module.exports = {
  calcularResumo,
  calcularAnalise,
  calcularProdutosMaisVendidos,
  gerarRelatorioCompleto,
};
