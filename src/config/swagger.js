// Documentação interativa da API, disponível em /docs
const autenticado = [{ cookieAuth: [] }];

const parametroId = { name: 'id', in: 'path', required: true, schema: { type: 'integer' } };

const parametrosPeriodo = [
  { name: 'dataInicio', in: 'query', required: true, schema: { type: 'string', example: '2026-10-01' } },
  { name: 'dataFim', in: 'query', required: true, schema: { type: 'string', example: '2026-10-30' } },
];

function corpoJson(esquema) {
  return {
    required: true,
    content: { 'application/json': { schema: { $ref: `#/components/schemas/${esquema}` } } },
  };
}

// Respostas de erro comuns às rotas protegidas
const errosDeAcesso = {
  401: { description: 'Não logado' },
  403: { description: 'Perfil sem permissão' },
};

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'API Sistema de Vendas RGR',
    version: '1.0.0',
    description: 'Faça POST /login primeiro: o cookie de sessão é enviado automaticamente nas demais rotas.',
  },
  tags: [
    { name: 'Autenticação' },
    { name: 'Produtos' },
    { name: 'Fornecedores' },
    { name: 'Relatórios', description: 'Somente ADM' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'connect.sid' },
    },
    schemas: {
      Login: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'admin@rgr.com' },
          password: { type: 'string', example: 'sua_senha' },
        },
      },
      Produto: {
        type: 'object',
        required: ['nome', 'categoria', 'valor', 'quantidade'],
        properties: {
          sku: { type: 'string', example: 'CAM-001' },
          nome: { type: 'string', example: 'Camiseta básica' },
          categoria: { type: 'string', example: 'Camisa' },
          valor: { type: 'number', example: 50 },
          quantidade: { type: 'integer', example: 30 },
          tamanho: { type: 'string', example: 'M' },
          descricao: { type: 'string', example: 'Camiseta 100% algodão' },
          fornecedorId: { type: 'integer', example: 1 },
        },
      },
      Venda: {
        type: 'object',
        required: ['quantidadeVendida'],
        properties: { quantidadeVendida: { type: 'integer', example: 2 } },
      },
      Fornecedor: {
        type: 'object',
        required: ['nome'],
        properties: {
          nome: { type: 'string', example: 'Malharia Brasil LTDA' },
          nomeFantasia: { type: 'string', example: 'Malharia Brasil' },
          documento: { type: 'string', example: '12.345.678/0001-90' },
          telefone: { type: 'string', example: '(67) 99999-0000' },
          email: { type: 'string', example: 'contato@malharia.com' },
          cep: { type: 'string', example: '79000-000' },
          endereco: { type: 'string', example: 'Rua das Flores, 100' },
          cidade: { type: 'string', example: 'Campo Grande' },
          estado: { type: 'string', example: 'MS' },
          observacoes: { type: 'string', example: 'Entrega em 5 dias' },
        },
      },
    },
  },
  paths: {
    '/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Inicia a sessão',
        requestBody: corpoJson('Login'),
        responses: { 200: { description: 'Sessão iniciada' }, 401: { description: 'Credenciais inválidas' } },
      },
    },
    '/perfil': {
      get: {
        tags: ['Autenticação'],
        summary: 'Dados do usuário logado',
        security: autenticado,
        responses: { 200: { description: 'Usuário da sessão' }, 401: errosDeAcesso[401] },
      },
    },
    '/logout': {
      post: {
        tags: ['Autenticação'],
        summary: 'Encerra a sessão',
        responses: { 200: { description: 'Sessão encerrada' } },
      },
    },
    '/products': {
      get: {
        tags: ['Produtos'],
        summary: 'Lista os produtos',
        security: autenticado,
        responses: { 200: { description: 'Lista em { data: [...] }' }, 401: errosDeAcesso[401] },
      },
      post: {
        tags: ['Produtos'],
        summary: 'Cadastra um produto (ADM)',
        security: autenticado,
        requestBody: corpoJson('Produto'),
        responses: { 201: { description: 'Produto criado' }, 400: { description: 'Dados inválidos' }, 409: { description: 'SKU já cadastrado' }, ...errosDeAcesso },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Produtos'],
        summary: 'Busca um produto',
        security: autenticado,
        parameters: [parametroId],
        responses: { 200: { description: 'Produto' }, 404: { description: 'Não encontrado' }, 401: errosDeAcesso[401] },
      },
      put: {
        tags: ['Produtos'],
        summary: 'Atualiza um produto (ADM)',
        security: autenticado,
        parameters: [parametroId],
        requestBody: corpoJson('Produto'),
        responses: { 200: { description: 'Produto atualizado' }, 400: { description: 'Dados inválidos' }, 404: { description: 'Não encontrado' }, ...errosDeAcesso },
      },
      delete: {
        tags: ['Produtos'],
        summary: 'Remove uma quantidade do estoque ou o produto inteiro (ADM)',
        description: 'Com ?quantidade=4 retira 4 unidades do estoque. Sem quantidade, exclui o produto.',
        security: autenticado,
        parameters: [
          parametroId,
          { name: 'quantidade', in: 'query', required: false, schema: { type: 'integer', example: 4 } },
        ],
        responses: { 200: { description: 'Estoque reduzido' }, 204: { description: 'Produto excluído' }, 400: { description: 'Quantidade inválida ou maior que o estoque' }, 404: { description: 'Não encontrado' }, ...errosDeAcesso },
      },
    },
    '/products/{id}/sale': {
      patch: {
        tags: ['Produtos'],
        summary: 'Registra uma venda (ADM e Funcionário)',
        security: autenticado,
        parameters: [parametroId],
        requestBody: corpoJson('Venda'),
        responses: { 200: { description: 'Venda registrada' }, 400: { description: 'Quantidade inválida ou maior que o estoque' }, 404: { description: 'Não encontrado' }, 401: errosDeAcesso[401] },
      },
    },
    '/providers': {
      get: {
        tags: ['Fornecedores'],
        summary: 'Lista os fornecedores',
        security: autenticado,
        responses: { 200: { description: 'Lista de fornecedores' }, 401: errosDeAcesso[401] },
      },
      post: {
        tags: ['Fornecedores'],
        summary: 'Cadastra um fornecedor (ADM)',
        security: autenticado,
        requestBody: corpoJson('Fornecedor'),
        responses: { 201: { description: 'Fornecedor criado' }, 400: { description: 'Dados inválidos' }, ...errosDeAcesso },
      },
    },
    '/providers/{id}': {
      get: {
        tags: ['Fornecedores'],
        summary: 'Busca um fornecedor',
        security: autenticado,
        parameters: [parametroId],
        responses: { 200: { description: 'Fornecedor' }, 404: { description: 'Não encontrado' }, 401: errosDeAcesso[401] },
      },
      put: {
        tags: ['Fornecedores'],
        summary: 'Atualiza um fornecedor (ADM)',
        security: autenticado,
        parameters: [parametroId],
        requestBody: corpoJson('Fornecedor'),
        responses: { 200: { description: 'Fornecedor atualizado' }, 400: { description: 'Dados inválidos' }, 404: { description: 'Não encontrado' }, ...errosDeAcesso },
      },
      delete: {
        tags: ['Fornecedores'],
        summary: 'Exclui um fornecedor (ADM)',
        security: autenticado,
        parameters: [parametroId],
        responses: { 204: { description: 'Fornecedor excluído' }, 404: { description: 'Não encontrado' }, 409: { description: 'Possui produtos vinculados' }, ...errosDeAcesso },
      },
    },
    '/reports': {
      get: {
        tags: ['Relatórios'],
        summary: 'Relatório completo do período',
        security: autenticado,
        parameters: parametrosPeriodo,
        responses: { 200: { description: 'Relatório' }, 400: { description: 'Período inválido' }, ...errosDeAcesso },
      },
    },
    '/reports/sales/summary': {
      get: {
        tags: ['Relatórios'],
        summary: 'Resumo: faturamento, vendas, itens e ticket médio',
        security: autenticado,
        parameters: parametrosPeriodo,
        responses: { 200: { description: 'Resumo' }, 400: { description: 'Período inválido' }, ...errosDeAcesso },
      },
    },
    '/reports/sales/analysis': {
      get: {
        tags: ['Relatórios'],
        summary: 'Análise: produto mais vendido e percentual',
        security: autenticado,
        parameters: parametrosPeriodo,
        responses: { 200: { description: 'Análise' }, 400: { description: 'Período inválido' }, ...errosDeAcesso },
      },
    },
    '/reports/sales/top-products': {
      get: {
        tags: ['Relatórios'],
        summary: 'Ranking dos produtos mais vendidos',
        security: autenticado,
        parameters: parametrosPeriodo,
        responses: { 200: { description: 'Ranking' }, 400: { description: 'Período inválido' }, ...errosDeAcesso },
      },
    },
  },
};
