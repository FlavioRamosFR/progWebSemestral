# Plano de testes do Sistema de Vendas RGR

Disciplina: Verificação, Validação e Teste de Software (VV&TS). Aplicação testada: o Projeto Web Final de Programação para Web Avançada, neste mesmo repositório, na versão de 17/11/2026.

Grupo RGR: Flávio Ramos, Klinsmann Luiz, Raphael Bezerra e Carlos Gabriel.

## 1. Objetivo

O objetivo é verificar se a API e a interface do Sistema de Vendas RGR cumprem os requisitos do projeto: login com dois perfis, controle de acesso no back-end, cadastro de produtos e fornecedores, venda com baixa no estoque e relatórios. Também é validar o comportamento com dados válidos, inválidos e nos limites, registrando os defeitos encontrados.

## 2. Escopo

**Dentro do escopo**

| Funcionalidade | Requisito | Níveis de teste |
| --- | --- | --- |
| Login, logout e sessão | RF01 | Integração/API, sistema |
| Controle de acesso por perfil (401, 403) | RF02 | Unitário, integração/API, funcional (tabela de decisão), sistema |
| Consulta, cadastro, edição e exclusão de produtos | RF03, RF04 | Integração/API, funcional |
| Retirada de unidades do estoque | RF05 | Integração/API |
| Venda com baixa automática no estoque | RF06 | Integração/API, funcional (valor limite), sistema |
| Cadastro de fornecedores | RF07 | Integração/API, funcional (partição) |
| Relatórios de vendas | RF08 | Unitário, integração/API, funcional, sistema |
| Validação de entrada e tratamento de erros | RN01 a RN07, RNF02 | Unitário, integração/API, funcional |
| Segurança (cabeçalhos, rate limit, cookie) | RNF01 | Integração/API |

Os requisitos estão descritos em [rastreabilidade.md](rastreabilidade.md).

**Fora do escopo**

- Busca de endereço pelo CEP (ViaCEP) e de empresa pelo CNPJ (BrasilAPI): dependem de serviços externos que o grupo não controla. São demonstradas manualmente na apresentação.
- Testes de carga e desempenho.
- Compatibilidade entre navegadores: os testes de interface usam o Chromium.
- Infraestrutura de produção (Railway e Vercel): o deploy é conferido manualmente, pelo link publicado.

## 3. Estratégia

A estratégia segue a pirâmide de testes: muitos testes rápidos na base (unitários), a maior parte na integração entre API e banco, e poucos testes pela interface.

| Nível | Ferramenta | O que verifica | Onde está | Forma |
| --- | --- | --- | --- | --- |
| Unitário | Jest (com `jest.mock`) | Validações dos models, conversão de id, cálculo do resumo e middlewares, isolados do banco | `backend/src/test/unit/` | Automatizado |
| Integração e API | Jest + Supertest + MySQL de teste | Rota → middleware → controller → service → repository → banco: status HTTP, corpo JSON e efeito no banco | `backend/src/test/*.test.js` | Automatizado |
| Funcional (caixa-preta) | Requisições HTTP à API | Valor limite, partição de equivalência e tabela de decisão, sem olhar o código | [casos-de-teste.md](casos-de-teste.md#8-testes-funcionais-caixa-preta) | Manual, com registro das requisições |
| Sistema | Navegador | Fluxos reais na interface: login, bloqueio de rota, venda e permissão | [casos-de-teste.md](casos-de-teste.md#9-testes-de-sistema-pela-interface) | Manual, com capturas de tela |
| Sistema (E2E automatizado) | Cypress | Os mesmos fluxos, automatizados | `frontend/cypress/e2e/` | Automatizado (ver limitações) |
| Regressão | Jest (suíte completa) | Toda a suíte roda de novo depois de cada correção | `npm test` | Automatizado |

**Técnicas de caixa-preta**

| Técnica | Onde foi aplicada | Casos |
| --- | --- | --- |
| Análise de valor limite | Preço (0; 0,001; 0,01; 99.999.999,99; 100.000.000), quantidade em estoque (−1; 0; 2.147.483.647; 2.147.483.648), tamanho do nome (150 e 151), venda com 5 em estoque (0, 1, 5, 6), datas do relatório (mesmo dia, 29/02) | CT-FUN-01, 02, 04, 05, 06 |
| Partição de equivalência | Tipo dos campos numéricos (número, texto numérico, vazio, booleano, nulo, texto), contato do fornecedor (só telefone, só e-mail, ambos, nenhum) | CT-FUN-03, 07 |
| Tabela de decisão | Controle de acesso: sessão × perfil × operação (12 regras) | CT-FUN-08 |

Os limites vêm das colunas do banco (`backend/sql/schema.sql`): `valor DECIMAL(10,2)` maior que zero, `quantidade INT` maior ou igual a zero e `nome VARCHAR(150)`.

**Técnicas de caixa-branca:** os testes unitários usam dublês (`jest.mock` no `VendaRepository` e objetos falsos de `req`, `res` e `next`) para isolar a unidade testada. A cobertura de código mede quanto do back-end a suíte automatizada exercita, e a análise está no [relatório de execução](relatorio-de-execucao.md#5-cobertura-de-código).

**Isolamento dos dados:** os testes automatizados do back-end usam o banco `rgr_teste`. Ele é esvaziado antes de cada arquivo de teste, e os testes se recusam a rodar em um banco cujo nome não contenha "teste". Os testes manuais usam o banco `rgr` local, nunca o de produção.

## 4. Ambiente

| Item | Versão |
| --- | --- |
| Sistema operacional | Linux (Ubuntu); o grupo também roda no Windows |
| Node.js | 22 (o projeto exige 20 ou superior) |
| Banco de dados | MariaDB 10.11 local (compatível com o MySQL 8 de produção) |
| Jest / Supertest | 30.5 / 7.3 |
| Cypress | 16.2 |
| Navegador dos testes de sistema | Chromium |
| Back-end / front-end | `http://localhost:3001` / `http://localhost:3000` |

## 5. Critérios de entrada

- O código da funcionalidade está na branch `main` e o back-end inicia sem erro.
- O banco de teste `rgr_teste` existe e o usuário do `.env` tem acesso a ele.
- Os requisitos da funcionalidade estão descritos (README e rastreabilidade).
- Para os testes de sistema: a API e o front estão rodando, com os usuários ADM e Funcionário criados.

## 6. Critérios de saída

- 100% dos casos de teste planejados executados (ou bloqueados com justificativa).
- Todos os testes automatizados do back-end aprovados.
- Nenhum defeito de severidade alta ou média em aberto.
- Cobertura de linhas do back-end igual ou acima de 90%.
- Todo defeito corrigido conferido por regressão.
- Evidências guardadas em [evidencias/](evidencias/).

A situação de cada critério nesta versão está no [relatório de execução](relatorio-de-execucao.md#1-resumo).

## 7. Limitações

| Limitação | Motivo | Como foi tratado |
| --- | --- | --- |
| CEP e CNPJ não testados automaticamente | Dependem do ViaCEP e da BrasilAPI, que podem estar fora do ar ou limitar consultas | Demonstração manual na apresentação |
| Testes caixa-preta executados manualmente | Não há arquivo automatizado para eles nesta versão | Cada requisição e resposta foi registrada em [evidencias/funcional-caixa-preta-api.txt](evidencias/funcional-caixa-preta-api.txt) |
| Testes Cypress não executáveis | `login.cy.ts` está vazio e `fluxo_principal.cy.ts` usa rota e seletores que não existem na interface (DEF-06 a DEF-08) | Os fluxos foram testados manualmente no navegador (CT-SIS-01 a 06) |
| Front-end sem testes unitários | As regras de negócio ficam no back-end, que tem testes unitários. As telas cuidam da exibição | Coberto pelos testes de sistema |
| Rate limit geral (300 por IP) | Exigiria 300 requisições em um único teste | Verificado pelo cabeçalho `RateLimit`. O limite de login (10) é testado por completo |
| Linhas de configuração de produção | SSL do banco, `DATABASE_URL` e logs só rodam em produção | Justificado na análise de cobertura |

## 8. Papéis

| Integrante | Papel nos testes |
| --- | --- |
| Carlos Gabriel | Planejamento, casos de teste, testes unitários e E2E |
| Flávio Ramos | Testes de integração da API |
| Klinsmann Luiz | Testes de sistema pela interface |
| Raphael Bezerra | Documentação, rastreabilidade e relatório de execução |
