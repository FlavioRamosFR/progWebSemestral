# Especificação dos casos de teste

Cada caso tem identificação, funcionalidade, pré-condições, dados de entrada, passos, resultado esperado, resultado obtido e status. Os resultados obtidos são da execução de 17/11/2026 sobre o código desta versão (ver [relatório de execução](relatorio-de-execucao.md)).

Nos casos de API, "passos" são as requisições enviadas. Todos os casos do back-end rodam no banco `rgr_teste`, com os usuários de teste `adm@teste.com` (ADM) e `func@teste.com` (FUNCIONARIO) recriados antes de cada arquivo.

**Legenda de status:** ✅ Aprovado · ❌ Reprovado (o resultado obtido difere do esperado; ver o defeito) · ⛔ Bloqueado (o teste não pôde ser executado)

## 1. Autenticação e controle de acesso (RF01, RF02)

Automação: `backend/src/test/auth.test.js` e `seguranca.test.js` (integração/API).

| ID | Funcionalidade | Pré-condições | Dados de entrada | Passos | Resultado esperado | Resultado obtido | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CT-AUT-01 | Login com credenciais corretas | Usuário ADM cadastrado | `adm@teste.com` / `senha-adm` | `POST /login` | 200, `usuario.perfil = "ADM"`, sem `senhaHash` no corpo, cookie `HttpOnly` | Conforme esperado | ✅ |
| CT-AUT-02 | Login com e-mail em maiúsculas e espaços | Usuário ADM cadastrado | `" ADM@Teste.com "` / `senha-adm` | `POST /login` | 200 e perfil ADM (e-mail normalizado) | Conforme esperado | ✅ |
| CT-AUT-03 | Login recusado | Usuários cadastrados | (a) senha errada; (b) e-mail inexistente; (c) corpo vazio | `POST /login` para cada entrada | 401 com `"Credenciais inválidas"` nas três | Conforme esperado nas três | ✅ |
| CT-AUT-04 | Logout encerra a sessão | Funcionário logado | — | `GET /perfil`, `POST /logout`, `GET /perfil` | 200, 200 e depois 401 | Conforme esperado | ✅ |
| CT-AUT-05 | Acesso sem login | Nenhuma sessão | — | `GET /products`, `POST /products`, `GET /providers`, `GET /reports` | 401 em todas | Conforme esperado | ✅ |
| CT-AUT-06 | Permissões do Funcionário | Funcionário logado | Produto e fornecedor válidos | Consultar produtos e fornecedores; cadastrar, editar e excluir produto; cadastrar fornecedor; ver relatório | 200 nas consultas e 403 nas demais | Conforme esperado | ✅ |
| CT-AUT-07 | Permissões do ADM | ADM logado | Produto válido | `POST /products`, `GET /reports/sales/summary` | 201 e 200 | Conforme esperado | ✅ |
| CT-AUT-08 | Bloqueio por força bruta | Nenhuma tentativa anterior do IP | 11 tentativas com senha errada e 1 com a certa | `POST /login` repetido | 401 nas 10 primeiras; 429 na 11ª e também com a senha certa | Conforme esperado | ✅ |

## 2. Produtos (RF03, RF04, RN04, RN05)

Automação: `backend/src/test/produtos.test.js` (integração/API). Pré-condição comum: ADM logado.

| ID | Funcionalidade | Pré-condições | Dados de entrada | Passos | Resultado esperado | Resultado obtido | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CT-PRO-01 | Cadastrar produto | ADM logado | Camiseta, Camisa, R$ 50, 30 un., M | `POST /products` | 201, id numérico, campos em português e inglês (`nome`/`name`, `valor`/`price`) | Conforme esperado | ✅ |
| CT-PRO-02 | Listar produtos | Um produto cadastrado | — | `GET /products` | 200, lista dentro de `{ data }` contendo o produto | Conforme esperado | ✅ |
| CT-PRO-03 | Cadastrar com campos em inglês | ADM logado | `name: "Boné"`, `price: 25.5`, `quantity: 3`, `image` | `POST /products` | 201 e campos salvos em português | Conforme esperado | ✅ |
| CT-PRO-04 | Editar produto | Produto cadastrado | Nome "Camiseta nova", valor 60 | `PUT /products/:id` | 200 com os novos valores | Conforme esperado | ✅ |
| CT-PRO-05 | Recusar dados inválidos | ADM logado | Nome e categoria vazios, valor −1, quantidade 1,5 | `POST /products` | 400 citando nome, valor e quantidade | Conforme esperado | ✅ |
| CT-PRO-06 | SKU único | Produto com SKU cadastrado | Mesmo SKU | `POST` com o SKU repetido; `PUT` mantendo o próprio SKU | 409 no `POST`; 200 no `PUT` | Conforme esperado | ✅ |
| CT-PRO-07 | SKU vazio em vários produtos | ADM logado | `sku: ""` duas vezes | `POST /products` duas vezes | 201 nas duas | Conforme esperado | ✅ |
| CT-PRO-08 | Fornecedor inexistente | ADM logado | `fornecedorId: 9999` | `POST /products` | 400 | Conforme esperado | ✅ |
| CT-PRO-09 | Id inexistente ou inválido | ADM logado | ids `9999` e `abc` | `GET /products/9999`, `GET /products/abc`, `DELETE /products/9999` | 404 nos três | Conforme esperado | ✅ |
| CT-PRO-10 | Excluir produto | Produto cadastrado | — | `DELETE /products/:id` sem quantidade; `GET /products/:id` | 204 e depois 404 | Conforme esperado | ✅ |

## 3. Estoque e venda (RF05, RF06, RN01)

Automação: `backend/src/test/produtos.test.js` (integração/API).

| ID | Funcionalidade | Pré-condições | Dados de entrada | Passos | Resultado esperado | Resultado obtido | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CT-EST-01 | Retirar unidades pela URL | Produto com 30 un., ADM logado | `?quantidade=4` | `DELETE /products/:id?quantidade=4` | 200 e quantidade 26 | Conforme esperado | ✅ |
| CT-EST-02 | Retirar unidades pelo corpo | Produto com 30 un., ADM logado | `{ "quantidade": 4 }` | `DELETE /products/:id` com corpo | 200 e quantidade 26 | Conforme esperado | ✅ |
| CT-EST-03 | Retirar todo o estoque | Produto com 5 un., ADM logado | `?quantidade=5` | Retirar 5; consultar o produto | 200, quantidade 0 e produto ainda cadastrado | Conforme esperado | ✅ |
| CT-EST-04 | Retirada inválida | Produto com 30 un., ADM logado | 31, 0, −1, 1,5 e `abc` | Retirar cada valor; consultar o produto | 400 em todos e estoque continua 30 | Conforme esperado nos cinco | ✅ |
| CT-VEN-01 | Registrar venda | Produto com 10 un., Funcionário logado | `quantidadeVendida: 3` | `PATCH /products/:id/sale` | 200, estoque 7, venda com `quantidade: 3` e `valorUnitario: 50` | Conforme esperado | ✅ |
| CT-VEN-02 | Venda inválida | Produto com 10 un. | 11, 0 e sem quantidade | `PATCH /products/:id/sale` para cada; consultar | 400 em todos e estoque continua 10 | Conforme esperado | ✅ |
| CT-VEN-03 | Venda com estoque zerado | Produto com 0 un., Funcionário logado | `quantidadeVendida: 1` | `PATCH /products/:id/sale`; consultar | 400 e estoque continua 0 | Conforme esperado | ✅ |

## 4. Fornecedores (RF07, RN03, RN06)

Automação: `backend/src/test/fornecedores.test.js` (integração/API). Pré-condição comum: ADM logado.

| ID | Funcionalidade | Pré-condições | Dados de entrada | Passos | Resultado esperado | Resultado obtido | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CT-FOR-01 | CRUD de fornecedor | ADM logado | Malharia Brasil LTDA, estado `ms` | Cadastrar, listar, buscar, editar a cidade, excluir, buscar de novo | 201 (estado salvo como `MS`), 200, 200, 200, 204 e 404 | Conforme esperado | ✅ |
| CT-FOR-02 | Campos obrigatórios | ADM logado | (a) sem nome; (b) sem telefone e sem e-mail | `POST /providers` | 400 nos dois | Conforme esperado | ✅ |
| CT-FOR-03 | Excluir com produtos vinculados | Fornecedor com um produto | — | Excluir fornecedor; excluir produto; excluir fornecedor | 409, 204 e 204 | Conforme esperado | ✅ |

## 5. Relatórios (RF08, RN02, RN07)

Automação: `backend/src/test/relatorios.test.js` (integração/API). Pré-condição comum: ADM logado e, em outubro de 2026, 4 vendas (Camiseta 3 + 3 a R$ 50, Calça 2 a R$ 100, Short 2 a R$ 30), sendo a primeira às 00:00:00 de 01/10 e a última às 23:59:59 de 31/10. Duas vendas fora do período (30/09 e 01/11) não podem entrar nas contas.

| ID | Funcionalidade | Pré-condições | Dados de entrada | Passos | Resultado esperado | Resultado obtido | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CT-REL-01 | Resumo do período | Vendas de outubro | 2026-10-01 a 2026-10-31 | `GET /reports/sales/summary` | Faturamento 560, 4 vendas, 10 itens, ticket médio 140 | Conforme esperado | ✅ |
| CT-REL-02 | Produto mais vendido | Vendas de outubro | Mesmo período | `GET /reports/sales/analysis` | Camiseta, 6 unidades, 60% | Conforme esperado | ✅ |
| CT-REL-03 | Ranking de produtos | Vendas de outubro | Mesmo período | `GET /reports/sales/top-products` | Camiseta (1º), Calça (2º) e Short (3º); empate em quantidade decidido pelo faturamento | Conforme esperado | ✅ |
| CT-REL-04 | Relatório completo | Vendas de outubro | Mesmo período | `GET /reports` | Todos os campos do resumo e da análise e 3 produtos no ranking | Conforme esperado | ✅ |
| CT-REL-05 | Período sem vendas | Nenhuma venda em jan/2020 | 2020-01-01 a 2020-01-31 | `GET /reports` | Tudo zero, sem divisão por zero, ranking vazio | Conforme esperado | ✅ |
| CT-REL-06 | Período inválido | ADM logado | Sem datas; sem `dataFim`; `01/10/2026`; `2026-02-31`; início depois do fim | `GET /reports/sales/summary` para cada | 400 nos cinco | Conforme esperado | ✅ |
| CT-REL-07 | Venda pela API no relatório | ADM logado | Produto "Meia" a R$ 10 | Vender 2, excluir o produto, gerar a análise do dia | Meia, 2 unidades, faturamento 20, mesmo com o produto excluído | Conforme esperado | ✅ |

## 6. Segurança e tratamento de erros (RNF01, RNF02)

Automação: `backend/src/test/seguranca.test.js` e `auth.test.js` (integração/API).

| ID | Funcionalidade | Pré-condições | Dados de entrada | Passos | Resultado esperado | Resultado obtido | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CT-SEG-01 | Saúde da API | API e banco no ar | — | `GET /saude` | 200 e `{ "status": "ok" }` | Conforme esperado | ✅ |
| CT-SEG-02 | Cabeçalhos de segurança | API no ar | — | `GET /products` | `X-Content-Type-Options: nosniff` e `Cache-Control: no-store` | Conforme esperado | ✅ |
| CT-SEG-03 | Informação do rate limit | API no ar | — | `GET /saude` | Cabeçalho `RateLimit` com as requisições restantes | Conforme esperado | ✅ |
| CT-SEG-04 | Rota inexistente | API no ar | — | `GET /nao-existe` | 404 com `{ "erro": "Rota não encontrada" }` | Conforme esperado | ✅ |
| CT-SEG-05 | JSON malformado | API no ar | Corpo `{quebrado` | `POST /login` | 400 | Conforme esperado | ✅ |

## 7. Testes unitários

Automação: `backend/src/test/unit/` (Jest, sem banco). As unidades dependentes do banco são isoladas com `jest.mock`.

| ID | Funcionalidade (unidade) | Pré-condições | Dados de entrada | Passos | Resultado esperado | Resultado obtido | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CT-UNI-01 | `validarProduto` | — | Produto válido; produto com nome vazio, valor −1, quantidade −1 e fornecedor inválido | Chamar a função | Nenhum erro no válido; lista de erros no inválido | Conforme esperado | ✅ |
| CT-UNI-02 | `normalizarProduto` | — | `{ name: "Hat", price: 25, quantity: 5 }` | Chamar a função | `nome = "Hat"`, `valor = 25` | Conforme esperado | ✅ |
| CT-UNI-03 | `validarPeriodo` | — | Período válido; início depois do fim; 31/02 | Chamar a função | Sem erro; erro de ordem; erro de formato | Conforme esperado | ✅ |
| CT-UNI-04 | `lerId` | — | `"7"` e `"abc"` | Chamar a função | Retorna 7; lança `HttpError` 404 | Conforme esperado | ✅ |
| CT-UNI-05 | `calcularResumo` sem vendas | `VendaRepository` simulado | Totais zerados | Chamar a função | Vendas 0, faturamento 0, ticket médio 0 | Reprovado: `Expected 0, Received undefined` (DEF-05) | ❌ |
| CT-UNI-06 | `calcularResumo` com vendas | `VendaRepository` simulado | Faturamento 100, 3 vendas | Chamar a função | Ticket médio 33,33 | Reprovado: `Expected 3, Received undefined` (DEF-05) | ❌ |
| CT-UNI-07 | `exigeLogin` | Sessão sem usuário | `req`, `res` e `next` falsos | Chamar o middleware | `res.status(401)` e `next` não chamado | Conforme esperado | ✅ |
| CT-UNI-08 | `exigePerfil` negado | Sessão com FUNCIONARIO | Perfil exigido: ADM | Chamar o middleware | `res.status(403)` e `next` não chamado | Conforme esperado | ✅ |
| CT-UNI-09 | `exigePerfil` permitido | Sessão com ADM | Perfil exigido: ADM | Chamar o middleware | `next()` chamado | Conforme esperado | ✅ |

## 8. Testes funcionais caixa-preta

Execução manual por requisições HTTP à API local, sem consultar o código. Cada requisição e resposta está registrada em [evidencias/funcional-caixa-preta-api.txt](evidencias/funcional-caixa-preta-api.txt). Pré-condição comum: ADM e Funcionário logados.

| ID | Técnica | Pré-condições | Dados de entrada (classes e limites) | Passos | Resultado esperado | Resultado obtido | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CT-FUN-01 | Valor limite: preço | ADM logado | 0 → 400; 0,001 → 400; 0,01 → 201; 99.999.999,99 → 201; 100.000.000 → 400 | `POST /products` com cada valor | Status indicado em cada valor | 0, 0,01 e 99.999.999,99 conforme esperado. **0,001 e 100.000.000 responderam 500** "Erro interno do servidor" (DEF-01, DEF-02) | ❌ |
| CT-FUN-02 | Valor limite: quantidade em estoque | ADM logado | −1 → 400; 0 → 201; 2.147.483.647 → 201; 2.147.483.648 → 400 | `POST /products` com cada valor | Status indicado | Três valores conforme esperado. **2.147.483.648 respondeu 500** (DEF-03) | ❌ |
| CT-FUN-03 | Partição de equivalência: tipo dos números | ADM logado | Válidas: número; texto numérico (`"50"`). Inválidas: texto vazio na quantidade; booleano no valor; nulo; `"abc"` | `POST /products` com uma entrada de cada classe | 201 nas válidas, 400 nas inválidas | Nulo e `"abc"` conforme esperado. **`quantidade: ""` foi salva como 0 e `valor: true` como 1, ambos com 201** (DEF-04) | ❌ |
| CT-FUN-04 | Valor limite: tamanho do nome | ADM logado | 150 caracteres → 201; 151 → 400 | `POST /products` | Status indicado | Conforme esperado | ✅ |
| CT-FUN-05 | Valor limite: venda | Produto com 5 un., Funcionário logado | 0 → 400; 1 → 200; 5 → 200; 6 → 400 | `PATCH /products/:id/sale`; consultar estoque | Estoque final 5, 4, 0 e 5 | Conforme esperado | ✅ |
| CT-FUN-06 | Valor limite e partição: datas | ADM logado | Mesmo dia → 200; 29/02/2024 → 200; 29/02/2026 → 400; início um dia após o fim → 400; `2026-1-01` → 400 | `GET /reports/sales/summary` | Status indicado | Conforme esperado | ✅ |
| CT-FUN-07 | Partição de equivalência: contato do fornecedor | ADM logado | Só telefone; só e-mail; ambos → 201. Nenhum → 400 | `POST /providers` | Status indicado | Conforme esperado | ✅ |
| CT-FUN-08 | Tabela de decisão: controle de acesso | Produto com 10 un. | 12 regras: {sem login, Funcionário, ADM} × {consulta, venda, cadastro, relatório} | Executar a operação com cada perfil | Tabela abaixo | Conforme esperado nas 12 regras | ✅ |

**Tabela de decisão do CT-FUN-08**

| Condição / Regra | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 | R9 | R10 | R11 | R12 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Está logado? | N | N | N | N | S | S | S | S | S | S | S | S |
| Perfil | — | — | — | — | FUNC | FUNC | FUNC | FUNC | ADM | ADM | ADM | ADM |
| Operação | consulta | venda | cadastro | relatório | consulta | venda | cadastro | relatório | consulta | venda | cadastro | relatório |
| **Status esperado** | 401 | 401 | 401 | 401 | 200 | 200 | 403 | 403 | 200 | 200 | 201 | 200 |

## 9. Testes de sistema pela interface

Execução manual no navegador, com a API e o front rodando localmente. As capturas estão em [evidencias/](evidencias/).

| ID | Funcionalidade | Pré-condições | Dados de entrada | Passos | Resultado esperado | Resultado obtido | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CT-SIS-01 | Bloqueio de rota sem sessão | Navegador sem cookie de sessão | — | Abrir `/rgr/dashboard` | Redireciona para `/login` | Redirecionou para `/login` ([print](evidencias/01-redireciona-login-sem-sessao.png)) | ✅ |
| CT-SIS-02 | Senha errada | Usuário ADM | `admin@rgr.com` com senha errada | Preencher o login e clicar em Entrar | Mostra "Credenciais inválidas" e continua em `/login` | Conforme esperado ([print](evidencias/02-login-credenciais-invalidas.png)) | ✅ |
| CT-SIS-03 | Login do ADM | Usuário ADM | E-mail e senha do ADM | Preencher o login e clicar em Entrar | Vai para `/rgr` e mostra "Bem-vindo" com o perfil Administrador | Conforme esperado ([print](evidencias/03-login-adm.png)) | ✅ |
| CT-SIS-04 | Venda pela interface | Camiseta Básica com 10 un.; Funcionário logado | Quantidade 2 | Abrir o estoque, digitar 2 no card da Camiseta Básica e clicar em "Registrar venda" | Aviso "2 unidades registradas como venda." e estoque 8 | Conforme esperado ([print](evidencias/04-venda-registrada.png)) | ✅ |
| CT-SIS-05 | Relatório negado ao Funcionário | Funcionário logado | Período padrão da tela | Abrir Relatório e clicar em "Gerar relatório" | Mensagem "Seu perfil não tem permissão para esta ação" (403 da API) | Conforme esperado ([print](evidencias/05-funcionario-relatorio-bloqueado.png)) | ✅ |
| CT-SIS-06 | Relatório do ADM | ADM logado; venda do CT-SIS-04 | 01/11/2026 a 17/11/2026 | Abrir Relatório e clicar em "Gerar relatório" | Faturamento R$ 100,00, 1 venda, 2 itens, ticket médio R$ 100,00, Camiseta Básica como mais vendida | Conforme esperado ([print](evidencias/06-adm-relatorio.png)) | ✅ |

## 10. Testes E2E automatizados (Cypress)

Arquivos em `frontend/cypress/e2e/login/`. Cada rota e seletor dos scripts foi conferido na interface real. O resultado está em [evidencias/cypress-verificacao-seletores.txt](evidencias/cypress-verificacao-seletores.txt).

| ID | Funcionalidade | Pré-condições | Dados de entrada | Passos (como estão no script) | Resultado esperado | Resultado obtido | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CT_FRONT_01 | Bloqueio de rota sem sessão | Front rodando | — | `cy.visit('/produtos')`; conferir se a URL contém `/` | Voltar para o login | `/produtos` não existe (404). A asserção "URL contém `/`" é sempre verdadeira, então o teste passaria sem verificar nada (DEF-07) | ⛔ |
| CT_FRONT_02 | Login do ADM | Front e API rodando | E-mail e senha do ADM | `input[name="email"]`, `input[name="senha"]`, Entrar; esperar "Bem-vindo" | Entrar e mostrar "Bem-vindo" | Os campos `name="email"` e `name="senha"` não existem (os reais são `#email` e `#password`). O teste para no primeiro passo (DEF-07) | ⛔ |
| CT_FRONT_03 | Venda pela interface | Front e API rodando, produto em estoque | Quantidade 2 | Login; `cy.visit('/produtos')`; botão "Vender"; `input[name="quantidadeVendida"]`; botão "Confirmar" | Mensagem "Venda registrada com sucesso" | Rota, botões, campo e mensagem não existem na interface (o botão real é "Registrar venda"). O teste para no login (DEF-07) | ⛔ |
| — | `login.cy.ts` | — | — | — | — | Arquivo vazio, sem testes (DEF-06) | ⛔ |

Os mesmos fluxos foram verificados manualmente nos casos CT-SIS-01, 03 e 04.
