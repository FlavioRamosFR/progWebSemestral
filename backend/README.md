# Backend do Sistema de Vendas RGR

API em Node.js (JavaScript) com Express que atende o [frontend](../frontend/README.md) do Sistema de Vendas RGR. Faz o CRUD de produtos e fornecedores, registra vendas, calcula relatórios e controla o acesso por login com os perfis **ADM** (gerente/chefe) e **Funcionário**.

**Tecnologias:** Express 5, MySQL (`mysql2`), sessões no MySQL (`express-session` e `express-mysql-session`), senhas com `bcryptjs`, proteção com `helmet` e `express-rate-limit`, documentação com Swagger e testes com Jest e Supertest.

## Como executar

Pré-requisitos: Node.js 20 ou superior e um MySQL 8 (ou MariaDB 10.4+, como o do XAMPP) rodando na máquina. Os comandos abaixo são executados dentro da pasta `backend/`.

1. Crie dois bancos e um usuário no MySQL (pelo MySQL Workbench, phpMyAdmin ou terminal):

   ```sql
   CREATE DATABASE rgr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE rgr_teste CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'rgr'@'localhost' IDENTIFIED BY 'escolha_uma_senha';
   GRANT ALL PRIVILEGES ON rgr.* TO 'rgr'@'localhost';
   GRANT ALL PRIVILEGES ON rgr_teste.* TO 'rgr'@'localhost';
   ```

2. Copie o `.env.example` para `.env` e preencha a senha do banco, o `SESSION_SECRET` e as senhas dos usuários.

3. Instale as dependências, crie as tabelas e inicie a API:

   ```bash
   npm install
   npm run db:criar
   npm start
   ```

- API: `http://localhost:3001`
- Documentação interativa: `http://localhost:3001/docs`
- Situação da API e do banco: `http://localhost:3001/saude`

Na primeira execução, os usuários ADM e Funcionário do `.env` são criados automaticamente.

Para rodar os testes, que usam o banco `rgr_teste` e o esvaziam a cada execução:

```bash
npm test
```

## Organização do projeto

O código segue o padrão MVC, com as camadas de service e repository, como proposto em sala de aula.

```
server.js              confere o banco, cria os usuários iniciais e inicia o servidor
sql/
  schema.sql           estrutura do banco (rodar uma vez em produção)
scripts/
  criarBanco.js        npm run db:criar: executa o schema.sql no banco do .env
src/
  app.js               monta a aplicação: segurança, CORS, JSON, sessão e rotas
  config/              conexão MySQL, sessão, usuários iniciais e Swagger
  routes/              URLs e quais middlewares protegem cada uma
  middlewares/         rate limit, exigeLogin, exigePerfil e tratamento de erros
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
rota -> middlewares -> controller -> service -> repository -> MySQL
                                        |
                                      model (validação)
```

## Banco de dados (MySQL)

A estrutura completa fica em [`sql/schema.sql`](sql/schema.sql). Ele pode ser executado mais de uma vez sem apagar dados, porque só cria o que ainda não existe.

| Tabela | Guarda |
| --- | --- |
| `usuarios` | Login e perfil (ADM ou FUNCIONARIO); a senha fica só como hash bcrypt |
| `fornecedores` | Dados dos fornecedores |
| `produtos` | Cadastro e estoque; SKU único, valor maior que zero e estoque nunca negativo |
| `vendas` | Cada venda, com cópia do nome, categoria e valor do produto |
| `sessions` | Sessões de login |

- **Conexão:** um pool de conexões do `mysql2`, configurado em [`src/config/database.js`](src/config/database.js). Aceita `DATABASE_URL` ou as variáveis `DB_*`, e SSL para bancos em nuvem.
- **Transação:** a venda dá baixa no estoque e grava a venda na mesma transação, então nunca acontece só uma das duas.
- **SQL injection:** todos os comandos usam parâmetros (`?` e `:nome`), então o texto digitado nunca vira parte do SQL.
- **Fuso horário:** as datas das vendas seguem `DB_TIMEZONE`, para o relatório do dia não mudar de data quando o servidor estiver em outro fuso.

## Login e segurança

1. `POST /login` confere o e-mail e a senha, comparando com o hash salvo no banco.
2. O servidor cria uma sessão, salva no MySQL, e devolve um cookie `httpOnly`, que o navegador envia nas próximas requisições. Em produção, o cookie só trafega por HTTPS.
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

### Proteção contra abuso

| Proteção | Regra | Resposta |
| --- | --- | --- |
| Limite geral | 300 requisições por IP a cada 15 minutos (`LIMITE_GERAL`) | **429** |
| Limite de login | 10 tentativas erradas por IP a cada 15 minutos (`LIMITE_LOGIN`); logins certos não contam | **429** |
| Tamanho das requisições | Corpo JSON de até 100 KB | **413** |
| Cabeçalhos de segurança | `helmet` em todas as respostas | — |
| Cache | Respostas com `Cache-Control: no-store` | — |

Os limites ficam em [`src/middlewares/limiteRequisicoes.js`](src/middlewares/limiteRequisicoes.js). Em produção, `TRUST_PROXY` diz quantos proxies há na frente da API, para o limite ser contado pelo IP real do visitante.

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

O [frontend](../frontend/README.md) chama a API pelo caminho `/api` do próprio site, e o Next.js repassa as chamadas para cá (`API_URL`). Com isso, o cookie de login fica no domínio do site. O CORS (`FRONTEND_ORIGIN`) só é usado quando a API é chamada diretamente pelo navegador.

A imagem do produto é um link salvo no campo `imagem`, que é opcional. A API guarda só o link, não o arquivo.

O passo a passo para publicar está em [DEPLOY.md](../DEPLOY.md).
