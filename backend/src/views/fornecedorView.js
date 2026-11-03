// O contrato combinado com o front define o id do fornecedor como texto
function formatarFornecedor(fornecedor) {
  return { ...fornecedor, id: String(fornecedor.id) };
}

module.exports = { formatarFornecedor };
