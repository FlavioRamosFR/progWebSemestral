const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

function ehDataValida(data) {
  if (typeof data !== 'string' || !FORMATO_DATA.test(data)) return false;

  // Rejeita datas que não existem, como 2026-02-31
  const convertida = new Date(`${data}T00:00:00Z`);
  return !Number.isNaN(convertida.getTime()) && convertida.toISOString().startsWith(data);
}

function validarPeriodo({ dataInicio, dataFim } = {}) {
  if (!ehDataValida(dataInicio) || !ehDataValida(dataFim)) {
    return ['Informe dataInicio e dataFim no formato AAAA-MM-DD'];
  }
  if (dataInicio > dataFim) {
    return ['dataInicio não pode ser maior que dataFim'];
  }

  return [];
}

module.exports = { validarPeriodo };
