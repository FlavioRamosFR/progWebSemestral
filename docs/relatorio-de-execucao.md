# Relatório de execução dos testes

Execução de 17/11/2026 sobre o código desta versão do repositório, no ambiente descrito no [plano de testes](plano-de-testes.md#4-ambiente). Os casos estão em [casos-de-teste.md](casos-de-teste.md).

## 1. Resumo

| Indicador | Resultado |
| --- | --- |
| Casos de teste especificados | 66 |
| Casos executados | 63 |
| Aprovados | 58 |
| Reprovados | 5 (CT-UNI-05, CT-UNI-06, CT-FUN-01, CT-FUN-02, CT-FUN-03) |
| Bloqueados | 3 (CT_FRONT_01 a 03, scripts Cypress que não executam) |
| Testes automatizados do back-end (funções `test`/`it`) | 64 em 7 arquivos: 62 aprovados e 2 reprovados |
| Defeitos encontrados | 8 (4 na aplicação, 4 nos scripts de teste), todos em aberto |
| Cobertura de linhas do back-end | 97,6% |

**Situação dos critérios de saída**

| Critério | Situação |
| --- | --- |
| Casos planejados executados ou bloqueados com justificativa | Atendido |
| Testes automatizados do back-end todos aprovados | **Não atendido**: 2 reprovados (DEF-05) |
| Nenhum defeito alto ou médio em aberto | **Não atendido**: DEF-01 a 03 e DEF-05 a 08 em aberto |
| Cobertura de linhas igual ou acima de 90% | Atendido (97,6%) |
| Defeitos corrigidos conferidos por regressão | Pendente, aguardando as correções |
| Evidências guardadas | Atendido |

## 2. Resultados por nível

| Nível | Forma | Casos | Aprovados | Reprovados | Bloqueados |
| --- | --- | :---: | :---: | :---: | :---: |
| Unitário | Jest | 9 | 7 | 2 | 0 |
| Integração e API | Jest + Supertest | 40 | 40 | 0 | 0 |
| Funcional caixa-preta | Manual, por requisições HTTP | 8 | 5 | 3 | 0 |
| Sistema pela interface | Manual, no navegador | 6 | 6 | 0 | 0 |
| Sistema E2E automatizado | Cypress | 3 | 0 | 0 | 3 |
| **Total** | | **66** | **58** | **5** | **3** |

Os 49 casos unitários e de integração correspondem a 64 funções de teste no Jest, porque um caso pode ter várias entradas (por exemplo, `test.each`).

| Arquivo | Testes | Aprovados | Reprovados |
| --- | :---: | :---: | :---: |
| `auth.test.js` | 14 | 14 | 0 |
| `produtos.test.js` | 23 | 23 | 0 |
| `fornecedores.test.js` | 3 | 3 | 0 |
| `relatorios.test.js` | 11 | 11 | 0 |
| `seguranca.test.js` | 4 | 4 | 0 |
| `unit/validacoes.test.js` | 6 | 4 | 2 |
| `unit/middleware.test.js` | 3 | 3 | 0 |
| **Total** | **64** | **62** | **2** |

Os testes caixa-preta fizeram 42 verificações (cada valor-limite, classe ou regra é uma verificação): 37 conforme o esperado e 5 divergentes.

## 3. Execuções

| Rodada | O que rodou | Resultado | Evidência |
| --- | --- | --- | --- |
| 1 | Suíte automatizada do back-end (`npx jest --coverage`) | 64 testes: 62 aprovados, 2 reprovados | [jest-execucao.txt](evidencias/jest-execucao.txt) |
| 1 | Testes funcionais caixa-preta pela API | 42 verificações: 37 conforme o esperado, 5 divergentes | [funcional-caixa-preta-api.txt](evidencias/funcional-caixa-preta-api.txt) |
| 1 | Testes de sistema no navegador | 6 casos aprovados | Prints 01 a 06 |
| 1 | Verificação dos scripts Cypress na interface | 3 testes bloqueados e 1 arquivo vazio | [cypress-verificacao-seletores.txt](evidencias/cypress-verificacao-seletores.txt) |

### Regressão

O conjunto de regressão é a suíte automatizada completa (`npm test`) mais os casos que reprovaram. Ele deve ser executado de novo depois de cada correção:

| Depois de corrigir | Reexecutar | Resultado esperado |
| --- | --- | --- |
| DEF-01 a DEF-04 | CT-FUN-01, 02 e 03 e a suíte completa | As 42 verificações caixa-preta conforme o esperado e os 64 testes sem nenhuma nova falha |
| DEF-05 | `unit/validacoes.test.js` e a suíte completa | 64 de 64 aprovados |
| DEF-06 a DEF-08 | `npx cypress run` | CT_FRONT_01 a 03 executáveis e aprovados |

Nesta versão nenhum defeito foi corrigido ainda, então a rodada 1 é a linha de base. Registrem aqui cada nova rodada, com a data e o resultado.

## 4. Defeitos encontrados

| ID | Descrição | Condição de ocorrência | Resultado esperado | Resultado obtido | Severidade | Evidência | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DEF-01 | Preço abaixo de R$ 0,01 derruba a API | `POST /products` com `valor: 0.001`. O valor passa na validação do model (é maior que zero), mas o banco arredonda para 0,00 e a regra `CHECK (valor > 0)` falha | 400 com mensagem de validação | **500** "Erro interno do servidor" | Média | CT-FUN-01 | Aberto |
| DEF-02 | Preço acima do limite da coluna derruba a API | `POST /products` com `valor: 100000000`. A coluna `DECIMAL(10,2)` aceita no máximo 99.999.999,99 | 400 | **500** | Média | CT-FUN-01 | Aberto |
| DEF-03 | Quantidade acima do limite do `INT` derruba a API | `POST /products` com `quantidade: 2147483648` | 400 | **500** | Média | CT-FUN-02 | Aberto |
| DEF-04 | Campos numéricos aceitam vazio e booleano | `quantidade: ""` é salva como 0 e `valor: true` como 1, porque o model usa `Number()` e `Number("")` é 0 e `Number(true)` é 1 | 400 | **201**, com o dado errado salvo | Baixa | CT-FUN-03 | Aberto |
| DEF-05 | Testes unitários CT112 sempre falham | `RelatorioService.calcularResumo` é assíncrono (consulta o MySQL), mas o teste o chama sem `await` e simula o repositório com `mockReturnValue` | Teste aprovado | Reprovado: `Expected 0, Received undefined` e `Expected 3, Received undefined` | Média (defeito no teste) | [jest-execucao.txt](evidencias/jest-execucao.txt) | Aberto |
| DEF-06 | Arquivo de teste E2E vazio | `frontend/cypress/e2e/login/login.cy.ts` tem 0 bytes | Testes de login automatizados | Nenhum teste | Baixa (defeito no teste) | [cypress-verificacao-seletores.txt](evidencias/cypress-verificacao-seletores.txt) | Aberto |
| DEF-07 | Testes E2E usam rota e seletores que não existem | `fluxo_principal.cy.ts` acessa `/produtos` (404; a tela é `/rgr/dashboard`), usa `input[name="email"]` e `input[name="senha"]` (os campos são `#email` e `#password`) e procura "Vender", `input[name="quantidadeVendida"]` e "Confirmar" (o botão é "Registrar venda"). A asserção do CT_FRONT_01 (URL contém `/`) é sempre verdadeira | Testes executáveis que verificam o fluxo | CT_FRONT_02 e 03 param no primeiro passo; CT_FRONT_01 passaria sem testar nada | Média (defeito no teste) | [cypress-verificacao-seletores.txt](evidencias/cypress-verificacao-seletores.txt) | Aberto |
| DEF-08 | Senha escrita no código de teste | A senha do ADM está em texto puro em `fluxo_principal.cy.ts`, que vai para o GitHub | Senhas fora do repositório (variável de ambiente ou `cypress.env.json` ignorado pelo Git) | Senha exposta | Alta (segurança) | Revisão do código | Aberto |

**Correções sugeridas**

- **DEF-01 a 04:** em `backend/src/models/Produto.js`, aceitar só número ou texto numérico não vazio e validar os limites das colunas (valor arredondado de R$ 0,01 a R$ 99.999.999,99; quantidade até 2.147.483.647). Como reforço, mapear no `errorHandler.js` os erros de limite e de `CHECK` do banco para 400.
- **DEF-05:** tornar os dois testes `async`, chamar `await RelatorioService.calcularResumo(...)` e usar `mockResolvedValue`.
- **DEF-06 e 07:** usar `/rgr/dashboard`, `#email`, `#password` e o botão "Registrar venda", e verificar a URL `/login` no bloqueio de rota.
- **DEF-08:** ler as senhas com `cy.env()` de um `cypress.env.json` listado no `.gitignore` e trocar a senha do ADM se ela for a do sistema publicado, porque ela continua no histórico do Git.

## 5. Cobertura de código

Gerada com `npx jest --coverage` sobre todo o `backend/src`.

| Métrica | Cobertura |
| --- | :---: |
| Instruções | 96,73% |
| Desvios (branches) | 84,97% |
| Funções | 100% |
| Linhas | 97,60% |

**O que não está coberto e por quê**

| Arquivo (linhas) | O que é | Análise |
| --- | --- | --- |
| `middlewares/errorHandler.js` (14-15) | Conversão dos erros do banco `ER_DATA_TOO_LONG` (400) e `ER_DUP_ENTRY` (409) | Nenhum teste automatizado envia texto maior que a coluna. O teste manual CT-FUN-04 passou por esse caminho. Vale automatizar |
| `middlewares/errorHandler.js` (21-22) | Resposta 500 genérica | Nenhum teste automatizado provoca erro interno. Os testes caixa-preta mostraram que esse caminho é alcançável com dados inválidos (DEF-01 a 03). Essa lacuna da suíte automatizada deixou os defeitos passarem |
| `config/database.js` (11, 21-23) | Conexão por `DATABASE_URL` e SSL do banco em nuvem | Só é usado em produção (Railway). Os testes usam o banco local |
| `config/session.js` (9) | Erro quando falta `SESSION_SECRET` | Os testes sempre definem o segredo |
| `config/seed.js` (21) | Aviso quando nenhum usuário é criado | Os testes sempre criam os dois usuários |
| `controllers/AuthController.js` (13-34, desvios) | Log do IP em login recusado e erro ao regenerar a sessão | O log é desligado em `NODE_ENV=test`. A falha do `regenerate` só ocorre se o banco de sessões cair no meio do login |
| `middlewares/limiteRequisicoes.js` (13) | Log quando o limite é atingido | Desligado em `NODE_ENV=test` |
| `app.js` (34, desvio) | Origem padrão do CORS quando `FRONTEND_ORIGIN` não existe | Os testes rodam sempre com a mesma configuração |
| `repositories/VendaRepository.js` (6, desvio) | Uso do pool padrão quando a venda não vem de uma transação | Toda venda passa pela transação de `registrarVenda` |
| `models/*`, `services/RelatorioService.js` (desvios) | Valores padrão de parâmetros (`= {}`) | Chamadas sem argumento não ocorrem pela API |

**Conclusão da cobertura:** a cobertura de linhas é alta (97,6%), mas não garante a ausência de defeitos. As linhas que faltam no `errorHandler.js` são justamente as do tratamento de erros, e os testes de valor limite encontraram ali três falhas que a suíte automatizada não pegava. O restante sem cobertura é configuração de produção, logs ou proteção contra falhas de infraestrutura.

## 6. Evidências

| Arquivo | O que mostra | Casos |
| --- | --- | --- |
| [jest-execucao.txt](evidencias/jest-execucao.txt) | Os 64 testes automatizados, um por linha, as 2 falhas com a mensagem e a tabela de cobertura | CT-AUT, PRO, EST, VEN, FOR, REL, SEG, UNI |
| [funcional-caixa-preta-api.txt](evidencias/funcional-caixa-preta-api.txt) | Cada requisição dos testes caixa-preta, com o esperado e o obtido | CT-FUN-01 a 08 |
| [cypress-verificacao-seletores.txt](evidencias/cypress-verificacao-seletores.txt) | Rotas e seletores dos scripts Cypress conferidos na interface | CT_FRONT_01 a 03 |
| [01-redireciona-login-sem-sessao.png](evidencias/01-redireciona-login-sem-sessao.png) | Acesso a `/rgr/dashboard` sem sessão termina no login | CT-SIS-01 |
| [02-login-credenciais-invalidas.png](evidencias/02-login-credenciais-invalidas.png) | Mensagem "Credenciais inválidas" | CT-SIS-02 |
| [03-login-adm.png](evidencias/03-login-adm.png) | Tela inicial depois do login do ADM | CT-SIS-03 |
| [04-venda-registrada.png](evidencias/04-venda-registrada.png) | Aviso "2 unidades registradas como venda." | CT-SIS-04 |
| [05-funcionario-relatorio-bloqueado.png](evidencias/05-funcionario-relatorio-bloqueado.png) | Funcionário recebe "Seu perfil não tem permissão para esta ação" | CT-SIS-05 |
| [06-adm-relatorio.png](evidencias/06-adm-relatorio.png) | ADM gera o relatório com os totais da venda | CT-SIS-06 |
| [07-swagger.png](evidencias/07-swagger.png) | Documentação interativa da API em `/docs` | Apoio aos testes de API |

## 7. Conclusão

As funcionalidades principais funcionam: login, controle de acesso, CRUD, venda com baixa no estoque e relatórios passaram nos testes de integração, nos testes de sistema e na tabela de decisão de acesso. Os testes de valor limite e de partição de equivalência encontraram quatro defeitos na validação de produtos, três deles derrubando a API com erro 500. A revisão dos testes encontrou dois testes unitários quebrados, scripts Cypress que não executam e uma senha exposta no código. Para atender aos critérios de saída, o grupo precisa corrigir os defeitos e rodar a regressão da seção 3.
