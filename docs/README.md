# Documentação de testes (VV&TS)

Documentação do trabalho semestral de Verificação, Validação e Teste de Software, feita sobre o Sistema de Vendas RGR. A documentação técnica da aplicação (Programação para Web Avançada) está no [README principal](../README.md).

| Documento | Conteúdo |
| --- | --- |
| [plano-de-testes.md](plano-de-testes.md) | Objetivo, escopo, estratégia, técnicas, ambiente, critérios de entrada e saída e limitações |
| [casos-de-teste.md](casos-de-teste.md) | Os 66 casos de teste, com pré-condições, entradas, passos, resultado esperado, resultado obtido e status |
| [rastreabilidade.md](rastreabilidade.md) | Requisitos, matriz requisito × caso de teste e forma de execução de cada caso |
| [relatorio-de-execucao.md](relatorio-de-execucao.md) | Resultados, defeitos, regressão, cobertura e evidências |
| [evidencias/](evidencias/) | Saídas dos testes e capturas de tela |

## Resumo da execução (17/11/2026)

| | |
| --- | --- |
| Casos de teste | 66: 58 aprovados, 5 reprovados, 3 bloqueados |
| Testes automatizados do back-end | 64: 62 aprovados, 2 reprovados |
| Cobertura de linhas do back-end | 97,6% |
| Defeitos encontrados | 8, todos em aberto |

## Como executar

```bash
# Back-end: testes unitários e de integração (precisa do banco rgr_teste)
cd backend
npm test
npx jest --coverage

# Front-end: testes E2E (API e front rodando)
cd frontend
npx cypress run
```

Os testes funcionais caixa-preta e os testes de sistema são manuais. Os passos e os dados de cada um estão em [casos-de-teste.md](casos-de-teste.md).
