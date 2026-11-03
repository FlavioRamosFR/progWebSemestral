const CAMPOS_DE_TEXTO = [
  'nome', 'nomeFantasia', 'documento', 'telefone', 'email',
  'cep', 'endereco', 'cidade', 'estado', 'observacoes',
];

function normalizarFornecedor(dados = {}) {
  const fornecedor = {};

  CAMPOS_DE_TEXTO.forEach((campo) => {
    fornecedor[campo] = typeof dados[campo] === 'string' ? dados[campo].trim() : '';
  });
  fornecedor.estado = fornecedor.estado.toUpperCase();

  return fornecedor;
}

// Mesmas regras do formulário de fornecedor do front
function validarFornecedor(fornecedor) {
  const erros = [];

  if (!fornecedor.nome) erros.push('O nome é obrigatório');
  if (!fornecedor.telefone && !fornecedor.email) {
    erros.push('Informe pelo menos um telefone ou e-mail');
  }

  return erros;
}

module.exports = { normalizarFornecedor, validarFornecedor };
