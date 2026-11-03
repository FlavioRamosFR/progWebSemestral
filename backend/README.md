# Backend do Sistema de Vendas RGR

API em Node.js (JavaScript) com Express que atende o [frontend](../frontend/README.md) do Sistema de Vendas RGR. Faz o CRUD de produtos e fornecedores, registra vendas, calcula relatórios e controla o acesso por login com os perfis **ADM** (gerente/chefe) e **Funcionário**.

**Tecnologias:** Express 5, SQLite (`better-sqlite3`), sessão com cookie (`express-session`), senhas com `bcryptjs`, documentação com Swagger e testes com Jest e Supertest.

## Como executar

Os comandos abaixo são executados dentro da pasta `backend/`.

```bash
npm install
```

Copie o `.env.example` para `.env` e preencha o segredo e as senhas. Os usuários são criados a partir do `.env` na primeira execução.

```bash
npm start
```

- API: `http://localhost:3001`
- Documentação interativa: `http://localhost:3001/docs`

Para rodar os testes (usam um banco temporário, sem mexer nos dados reais):

```bash
npm test
```

## Organização do projeto

O código segue o padrão MVC, com as camadas de service e repository, como proposto em sala de aula.

```
server.js              inicia o servidor
src/
  app.js               monta a aplicação: CORS, JSON, sessão e rotas
  config/              banco de dados, sessão, usuários iniciais e Swagger
  routes/              URLs e quais middlewares protegem cada uma
  middlewares/         exigeLogin, exigePerfil e tratamento de erros
  controllers/         recebem a requisição e devolvem a resposta
  views/               formatam o JSON enviado ao front
  services/            regras de negócio e cálculos dos relatórios
  models/              validação dos dados e perfis de acesso
  repositories/        comandos SQL
  utils/               HttpError e leitura do id da URL
  test/                testes automatizados
```

Caminho de uma requisição:

```
rota -> middlewares -> controller -> service -> repository -> banco
                                        |
                                      model (validação)
```

## Login e segurança

1. `POST /login` confere o e-mail e a senha, comparando com o hash salvo no banco.
2. O servidor cria uma sessão e devolve um cookie `httpOnly`, que o navegador envia nas próximas requisições.
3. Cada rota protegida passa pelos middlewares:
   - `exigeLogin`: sem sessão ativa, responde **401**.
   - `exigePerfil(PERFIS.ADM)`: com perfil sem permissão, responde **403**.

A sessão expira em 30 minutos.

| Ação | ADM | Funcionário |
| --- | --- | --- |
| Consultar produtos e fornecedores | Sim | Sim |
| Registrar venda | Sim | Sim |
| Criar, editar e excluir produtos e fornecedores | Sim | Não |
| Remover quantidade do estoque | Sim | Não |
| Ver relatórios | Sim | Não |

## Rotas

As URLs ficam em inglês porque são as que o front já consome.

### Autenticação

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/login` | Inicia a sessão com `{ username, password }` |
| GET | `/perfil` | Dados do usuário logado |
| POST | `/logout` | Encerra a sessão |

### Produtos

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/products` | Lista os produtos em `{ data: [...] }` |
| GET | `/products/:id` | Busca um produto |
| POST | `/products` | Cadastra |
| PUT | `/products/:id` | Atualiza |
| DELETE | `/products/:id?quantidade=4` | Retira 4 unidades do estoque |
| DELETE | `/products/:id` | Exclui o produto |
| PATCH | `/products/:id/sale` | Registra uma venda com `{ quantidadeVendida }` |

Retirar todas as unidades mantém o produto cadastrado com estoque zero. Essa retirada não conta como venda; somente o `PATCH /sale` entra nos relatórios.

### Fornecedores

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/providers` | Lista |
| GET | `/providers/:id` | Busca um fornecedor |
| POST | `/providers` | Cadastra |
| PUT | `/providers/:id` | Atualiza |
| DELETE | `/providers/:id` | Exclui (recusa com **409** se houver produtos vinculados) |

### Relatórios

Todas exigem `?dataInicio=AAAA-MM-DD&dataFim=AAAA-MM-DD`. As duas datas entram no período.

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/reports` | Relatório completo |
| GET | `/reports/sales/summary` | Resumo do período |
| GET | `/reports/sales/analysis` | Produto mais vendido e percentual |
| GET | `/reports/sales/top-products` | Ranking de produtos |

## Cálculos dos relatórios

Os cálculos estão em [`src/services/RelatorioService.js`](src/services/RelatorioService.js) e as somas em [`src/repositories/VendaRepository.js`](src/repositories/VendaRepository.js). Valores em dinheiro e percentuais são arredondados para duas casas.

| Campo | Cálculo |
| --- | --- |
| `faturamentoTotal` | Soma de `quantidade x valor` de todas as vendas |
| `vendasRealizadas` / `quantidadeVendas` | Contagem das vendas |
| `itensVendidos` | Soma das quantidades vendidas |
| `ticketMedio` | `faturamentoTotal / vendasRealizadas` |
| `produtoMaisVendido` | Produto com a maior quantidade vendida |
| `quantidadeVendida` | Soma da quantidade vendida do produto mais vendido |
| `percentualVendas` | `quantidadeVendida / itensVendidos x 100` |
| `faturamento` | Soma de `quantidade x valor` de cada produto |
| `posicao` | Ordem decrescente de quantidade vendida; no empate, vem antes o maior faturamento |

Cada venda guarda uma cópia do nome, da categoria e do valor do produto. Por isso os relatórios antigos continuam corretos se o produto for alterado ou excluído.

## Integração com o front

O [frontend](../frontend/README.md) acessa a API pela variável `NEXT_PUBLIC_API_URL` e envia o cookie de sessão em cada requisição. O endereço autorizado pelo CORS é definido em `FRONTEND_ORIGIN`, no `.env`.

A imagem do produto é um link salvo no campo `imagem`, que é opcional. A API guarda só o link, não o arquivo.
