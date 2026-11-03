# Frontend do Sistema de Vendas RGR

Interface em Next.js, React e TypeScript do Sistema de Vendas RGR. Consome a [API do backend](../backend/README.md) para login, estoque, vendas, fornecedores e relatórios.

Desenvolvido originalmente por Klinsmann Luiz em [front_sistema_vendas_RGR](https://github.com/KlinsmannLuiz/front_sistema_vendas_RGR).

## Como executar

Os comandos abaixo são executados dentro da pasta `frontend/`, com a API já rodando.

```bash
npm install
```

Copie o `.env.example` para `.env.local`. Ele aponta para a API em `http://localhost:3001`.

```bash
npm run dev
```

Acesse `http://localhost:3000/login`.

## Organização

```
app/
  login/               tela de login
  componentes/         login, menu lateral e rodapé
  rgr/dashboard/       estoque, venda, edição e remoção de produtos
  rgr/formProduct/     cadastro e edição de produto
  rgr/provider/        lista, cadastro e edição de fornecedores
  rgr/export/          relatório de vendas
services/
  api.ts               configuração do axios e mensagens de erro da API
  auth/                encerrar a sessão
  dashboard/           listar, vender, remover e excluir produtos
  formProduct/         cadastrar, buscar e editar produto
  provider/            CRUD de fornecedores
  export/              relatórios
```

O cookie de sessão é enviado à API pela opção `withCredentials` em `services/api.ts`.
