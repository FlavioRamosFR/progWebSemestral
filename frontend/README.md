# Frontend do Sistema de Vendas RGR

Interface em Next.js, React e TypeScript do Sistema de Vendas RGR. Consome a [API do backend](../backend/README.md) para login, estoque, vendas, fornecedores e relatórios.

Desenvolvido originalmente por Klinsmann Luiz em [front_sistema_vendas_RGR](https://github.com/KlinsmannLuiz/front_sistema_vendas_RGR).

## Como executar

Os comandos abaixo são executados dentro da pasta `frontend/`, com a API já rodando.

```bash
npm install
```

Copie o `.env.example` para `.env.local`. Ele aponta para a API em `http://localhost:3001` (`API_URL`).

```bash
npm run dev
```

Acesse `http://localhost:3000/login`.

## Organização

```
proxy.ts               manda as telas /rgr para o login quando não há cookie de sessão
next.config.ts         repassa /api/... para a API (API_URL)
app/
  login/               tela de login (login_section/Login.tsx)
  rgr/page.tsx         tela inicial depois do login
  rgr/dashboard/       estoque, venda, edição e remoção de produtos
  rgr/formProduct/     cadastro e edição de produto
  rgr/provider/        lista, cadastro e edição de fornecedores (registerProvider/)
  rgr/export/          relatório de vendas
  erro/[code]/         páginas de erro (400, 401, 403, 404, 500)
  componentes/         menu lateral, barra superior, rodapé, confirmação de logout,
                       tratamento global de erros e componentes de interface (ui/)
services/
  api.ts               configuração do axios e mensagens de erro da API
  auth/                encerrar a sessão
  dashboard/           listar, vender, remover e excluir produtos
  formProduct/         cadastrar, buscar e editar produto
  provider/            CRUD de fornecedores
  export/              relatórios
  cepService.ts        endereço pelo CEP (ViaCEP)
  cnpjService.ts       dados da empresa pelo CNPJ (BrasilAPI)
utils/
  masks.ts             máscaras de CEP, CPF/CNPJ, telefone, SKU e valor
cypress/               testes E2E
```

Os arquivos `lib/auth.ts` e `lib/middleware.ts` (JWT com `jose`) não são usados por nenhuma tela. A autenticação usa só o cookie de sessão da API.

## Comunicação com a API

O navegador nunca chama o endereço da API diretamente. Ele chama `/api/...` no próprio site (`NEXT_PUBLIC_API_URL=/api`), e o `next.config.ts` repassa a chamada para a API (`API_URL`).

Isso tem duas vantagens:

- O cookie de login fica no domínio do site, então o `proxy.ts` consegue saber se há alguém logado antes de abrir as telas de `/rgr`.
- Em produção, o front e a API podem ficar em provedores diferentes sem problemas de CORS ou de cookies bloqueados.

Como o `next.config.ts` é lido no build, depois de mudar o `API_URL` em produção é preciso fazer um novo deploy.

## Testes

Os testes E2E ficam em `cypress/e2e/` e rodam com a API e o front no ar:

```bash
npx cypress run
```

Nesta versão os scripts ainda não executam (arquivo vazio e seletores que não existem na tela). A situação e as correções sugeridas estão no [relatório de testes](../docs/relatorio-de-execucao.md#4-defeitos-encontrados).

