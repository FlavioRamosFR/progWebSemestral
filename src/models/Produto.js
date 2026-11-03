function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function ehInteiroPositivo(valor) {
  return Number.isInteger(valor) && valor > 0;
}

// O dashboard do front usa nomes em inglês e o formulário usa em português:
// esta função aceita os dois e entrega sempre o formato usado no banco.
function normalizarProduto(dados = {}) {
  const { fornecedorId } = dados;

  return {
    sku: texto(dados.sku) || null,
    nome: texto(dados.nome ?? dados.name),
    categoria: texto(dados.categoria ?? dados.category),
    valor: Number(dados.valor ?? dados.price),
    quantidade: Number(dados.quantidade ?? dados.quantity),
    tamanho: texto(dados.tamanho),
    descricao: texto(dados.descricao),
    imagem: texto(dados.imagem ?? dados.image),
    fornecedorId: fornecedorId === undefined || fornecedorId === null || fornecedorId === ''
      ? null
      : Number(fornecedorId),
  };
}

function validarProduto(produto) {
  const erros = [];

  if (!produto.nome) erros.push('O nome é obrigatório');
  if (!produto.categoria) erros.push('A categoria é obrigatória');
  if (!Number.isFinite(produto.valor) || produto.valor <= 0) {
    erros.push('O valor deve ser maior que zero');
  }
  if (!Number.isInteger(produto.quantidade) || produto.quantidade < 0) {
    erros.push('A quantidade deve ser um número inteiro maior ou igual a zero');
  }
  if (produto.fornecedorId !== null && !ehInteiroPositivo(produto.fornecedorId)) {
    erros.push('O fornecedor informado é inválido');
  }

  return erros;
}

module.exports = { normalizarProduto, validarProduto, ehInteiroPositivo };
