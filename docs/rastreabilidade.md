# Rastreabilidade

Liga cada requisito do sistema aos casos de teste que o verificam e ao código que automatiza esses casos. Os requisitos vêm do README do projeto e do enunciado de Programação para Web Avançada.

## 1. Requisitos

| ID | Tipo | Requisito | Critério de aceite |
| --- | --- | --- | --- |
| RF01 | Funcional | Login e logout com sessão | Credenciais corretas iniciam a sessão com cookie `HttpOnly`; erradas respondem 401; o logout encerra a sessão |
| RF02 | Funcional | Dois níveis de acesso validados no back-end | Sem login: 401. Funcionário (nível cliente do enunciado) consulta e vende; recebe 403 nas ações de ADM |
| RF03 | Funcional | Consultar produtos | Lista em `{ data }` e busca por id, para ADM e Funcionário |
| RF04 | Funcional | Cadastrar, editar e excluir produtos (ADM) | 201/200/204 com dados válidos; 400, 404 ou 409 nos inválidos |
| RF05 | Funcional | Retirar unidades do estoque sem venda (ADM) | Diminui só a quantidade informada e mantém o produto cadastrado |
| RF06 | Funcional | Registrar venda com baixa automática | Baixa no estoque e registro da venda na mesma transação |
| RF07 | Funcional | Cadastro de fornecedores (ADM) | CRUD completo; estado em maiúsculas |
| RF08 | Funcional | Relatórios de vendas (ADM) | Faturamento, vendas, itens, ticket médio, mais vendido e ranking do período |
| RN01 | Regra de negócio | O estoque nunca fica negativo | Venda ou retirada acima do estoque responde 400 e não altera nada |
| RN02 | Regra de negócio | A venda guarda uma cópia do produto | O relatório continua correto depois que o produto é editado ou excluído |
| RN03 | Regra de negócio | Fornecedor com produtos não pode ser excluído | 409 enquanto houver produto vinculado |
| RN04 | Regra de negócio | SKU único (vazio permitido) | SKU repetido: 409 |
| RN05 | Regra de negócio | Validação do produto | Nome e categoria obrigatórios; valor numérico maior que zero e quantidade inteira maior ou igual a zero, dentro dos limites das colunas do banco (`DECIMAL(10,2)` e `INT`); fora disso, 400 |
| RN06 | Regra de negócio | Validação do fornecedor | Nome obrigatório e pelo menos telefone ou e-mail |
| RN07 | Regra de negócio | Período do relatório | Datas existentes no formato AAAA-MM-DD, com início menor ou igual ao fim |
| RNF01 | Não funcional | Segurança | Cabeçalhos do helmet, sem cache, rate limit e bloqueio após 10 logins errados |
| RNF02 | Não funcional | Respostas HTTP corretas | Erros em JSON `{ "erro" }` com o status adequado (400, 401, 403, 404, 409, 429), nunca 500 por dado inválido |

## 2. Matriz requisito × caso de teste

| Requisito | Casos de teste | Níveis |
| --- | --- | --- |
| RF01 | CT-AUT-01, CT-AUT-02, CT-AUT-03, CT-AUT-04, CT-SIS-02, CT-SIS-03, CT_FRONT_02 | Integração/API, sistema |
| RF02 | CT-AUT-05, CT-AUT-06, CT-AUT-07, CT-UNI-07, CT-UNI-08, CT-UNI-09, CT-FUN-08, CT-SIS-01, CT-SIS-05, CT_FRONT_01 | Unitário, integração/API, funcional, sistema |
| RF03 | CT-PRO-02, CT-PRO-09, CT-FUN-08 (R5, R9) | Integração, funcional |
| RF04 | CT-PRO-01, CT-PRO-03, CT-PRO-04, CT-PRO-05, CT-PRO-08, CT-PRO-09, CT-PRO-10 | Integração, API |
| RF05 | CT-EST-01, CT-EST-02, CT-EST-03, CT-EST-04 | Integração, API |
| RF06 | CT-VEN-01, CT-VEN-02, CT-VEN-03, CT-FUN-05, CT-SIS-04, CT_FRONT_03 | Integração/API, funcional, sistema |
| RF07 | CT-FOR-01, CT-FOR-02, CT-FOR-03, CT-FUN-07 | Integração, funcional |
| RF08 | CT-REL-01 a CT-REL-07, CT-UNI-05, CT-UNI-06, CT-SIS-06 | Unitário, integração/API, sistema |
| RN01 | CT-EST-04, CT-VEN-02, CT-VEN-03, CT-FUN-05 | Integração, funcional |
| RN02 | CT-REL-07 | Integração |
| RN03 | CT-FOR-03 | Integração |
| RN04 | CT-PRO-06, CT-PRO-07 | Integração |
| RN05 | CT-PRO-05, CT-UNI-01, CT-UNI-02, CT-FUN-01, CT-FUN-02, CT-FUN-03, CT-FUN-04 | Unitário, funcional |
| RN06 | CT-FOR-02, CT-FUN-07 | Integração, funcional |
| RN07 | CT-REL-05, CT-REL-06, CT-UNI-03, CT-FUN-06 | Unitário, integração, funcional |
| RNF01 | CT-AUT-01 (cookie), CT-AUT-08, CT-SEG-02, CT-SEG-03 | Integração |
| RNF02 | CT-SEG-01, CT-SEG-04, CT-SEG-05, CT-UNI-04, CT-FUN-01 a CT-FUN-03 | Integração, unitário, funcional |

Todos os requisitos têm pelo menos um caso de teste executado. Os requisitos com caso reprovado nesta versão são RF08 (CT-UNI-05 e 06, por defeito no próprio teste), RN05 e RNF02 (CT-FUN-01 a 03). Os detalhes estão no [relatório de execução](relatorio-de-execucao.md#4-defeitos-encontrados).

## 3. Caso de teste × forma de execução

Alguns testes automatizados já tinham um código no nome (CT06, CT103 e outros). A coluna "ID no código" mostra essa correspondência.

| Caso | Forma | Onde | Teste (nome no código) | ID no código |
| --- | --- | --- | --- | --- |
| CT-AUT-01 | Automatizado | `backend/src/test/auth.test.js` | login > entra com credenciais corretas e devolve o perfil, sem a senha | — |
| CT-AUT-02 | Automatizado | `auth.test.js` | login > CT06: aceita login com e-mail contendo maiúsculas e espaços | CT06 |
| CT-AUT-03 | Automatizado | `auth.test.js` | login > recusa senha errada / e-mail inexistente / corpo vazio | — |
| CT-AUT-04 | Automatizado | `auth.test.js` | login > logout encerra a sessão | — |
| CT-AUT-05 | Automatizado | `auth.test.js` | middlewares de acesso > sem login, … responde 401 (4 testes) | — |
| CT-AUT-06 | Automatizado | `auth.test.js` | middlewares de acesso > funcionário consulta, mas não altera o cadastro nem vê relatórios | — |
| CT-AUT-07 | Automatizado | `auth.test.js` | middlewares de acesso > ADM acessa tudo | — |
| CT-AUT-08 | Automatizado | `seguranca.test.js` | bloqueia o login após 10 tentativas erradas em 15 minutos | — |
| CT-PRO-01 a 10 | Automatizado | `produtos.test.js` | CRUD de produtos > (9 testes); DELETE de produtos > sem quantidade, exclui o produto | — |
| CT-EST-01 a 04 | Automatizado | `produtos.test.js` | DELETE de produtos > (8 testes) | — |
| CT-VEN-01 a 03 | Automatizado | `produtos.test.js` | venda > (5 testes) | — |
| CT-FOR-01 a 03 | Automatizado | `fornecedores.test.js` | 3 testes | — |
| CT-REL-01 a 07 | Automatizado | `relatorios.test.js` | 11 testes | — |
| CT-SEG-01 a 03 | Automatizado | `seguranca.test.js` | 3 primeiros testes | — |
| CT-SEG-04, 05 | Automatizado | `auth.test.js` | rota desconhecida responde 404; JSON malformado responde 400 | — |
| CT-UNI-01 | Automatizado | `unit/validacoes.test.js` | deve validar e rejeitar produtos inválidos | CT103/CT104 |
| CT-UNI-02 | Automatizado | `unit/validacoes.test.js` | deve normalizar campos em português e inglês | CT105 |
| CT-UNI-03 | Automatizado | `unit/validacoes.test.js` | deve validar regras de período de datas | CT107 |
| CT-UNI-04 | Automatizado | `unit/validacoes.test.js` | deve converter IDs ou lançar HttpError 404 | CT111 |
| CT-UNI-05, 06 | Automatizado | `unit/validacoes.test.js` | deve calcular resumo… (2 testes) | CT112 |
| CT-UNI-07 a 09 | Automatizado | `unit/middleware.test.js` | exigeLogin / exigePerfil (3 testes) | CT_SEC_01 a 03 |
| CT-FUN-01 a 08 | Manual (requisições HTTP) | [evidencias/funcional-caixa-preta-api.txt](evidencias/funcional-caixa-preta-api.txt) | — | — |
| CT-SIS-01 a 06 | Manual (navegador) | [evidencias/](evidencias/) (prints 01 a 06) | — | — |
| CT_FRONT_01 a 03 | Automatizado (bloqueado) | `frontend/cypress/e2e/login/fluxo_principal.cy.ts` | 3 testes | CT_FRONT_01 a 03 |
