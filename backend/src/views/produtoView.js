// Formata o produto para o front: o formulário usa os campos em português e o
// dashboard usa os mesmos dados em inglês (name, category, price, quantity, image).
function formatarProduto(produto) {
  return {
    ...produto,
    fornecedorId: produto.fornecedorId === null ? null : String(produto.fornecedorId),
    name: produto.nome,
    category: produto.categoria,
    price: produto.valor,
    quantity: produto.quantidade,
    image: produto.imagem,
  };
}

module.exports = { formatarProduto };
