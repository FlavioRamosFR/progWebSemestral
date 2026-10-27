'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertCircle,BarChart3,CalendarDays,ChartNoAxesCombined,DollarSign,FileText,Package,Printer,Search,ShoppingBag,TrendingUp,} from 'lucide-react';

interface ItemVendido {
  id: string | number;
  nome: string;
  categoria?: string;
  quantidadeVendida: number;
  faturamento: number;
}

interface RelatorioVendas {
  periodo: { inicio: string; fim: string;};
  resumo: { faturamentoTotal: number; quantidadeVendas: number; itensVendidos: number;};
  itensMaisVendidos: ItemVendido[];
}

/*
 * DADOS FICTÍCIOS PARA DESENVOLVIMENTO DO FRONT-END.
 * Os valores são usados para visualizar e imprimir o relatório.
 * Eles não são alterados quando o período selecionado muda.
 */
const RELATORIO_FICTICIO: Omit<RelatorioVendas, 'periodo'> = {
  resumo: {
    faturamentoTotal: 4850.5,
    quantidadeVendas: 42,
    itensVendidos: 68,
  },

  itensMaisVendidos: [
    {
      id: 1,
      nome: 'Camiseta básica',
      categoria: 'Camisa',
      quantidadeVendida: 24,
      faturamento: 1200,
    },
    {
      id: 2,
      nome: 'Calça jeans',
      categoria: 'Calça',
      quantidadeVendida: 18,
      faturamento: 1800,
    },
    {
      id: 3,
      nome: 'Short casual',
      categoria: 'Short',
      quantidadeVendida: 12,
      faturamento: 720,
    },
    {
      id: 4,
      nome: 'Blusa de moletom',
      categoria: 'Blusa',
      quantidadeVendida: 8,
      faturamento: 640,
    },
    {
      id: 5,
      nome: 'Jaqueta corta-vento',
      categoria: 'Jaqueta',
      quantidadeVendida: 6,
      faturamento: 490.5,
    },
  ],
};

function formatarDataInput(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data: string): string {
  if (!data) return '—';

  const [ano, mes, dia] = data.split('-');

  if (!ano || !mes || !dia) return data;

  return `${dia}/${mes}/${ano}`;
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function formatarNumero(valor: number): string {
  return new Intl.NumberFormat('pt-BR').format(valor);
}

export default function RelatorioVendasPage() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [relatorio, setRelatorio] = useState<RelatorioVendas | null>(null);
  const [erro, setErro] = useState('');

  // Define o primeiro dia do mês e a data atual como período inicial.
  useEffect(() => {
    const hoje = new Date();

    setDataInicio(
      formatarDataInput(new Date(hoje.getFullYear(), hoje.getMonth(), 1)),
    );

    setDataFim(formatarDataInput(hoje));
  }, []);

  // Ordena os produtos pela quantidade vendida.
  const itensOrdenados = useMemo(() => {
    if (!relatorio) return [];

    return [...relatorio.itensMaisVendidos].sort(
      (a, b) => b.quantidadeVendida - a.quantidadeVendida,
    );
  }, [relatorio]);

  // Identifica o produto com maior quantidade vendida.
  const itemMaisVendido = itensOrdenados[0];

  // Utilizado para calcular a largura das barras do ranking.
  const maiorQuantidade = Math.max(
    1,
    ...itensOrdenados.map((item) => item.quantidadeVendida),
  );

  // Calcula o ticket médio.
  const ticketMedio =
    relatorio && relatorio.resumo.quantidadeVendas > 0
      ? relatorio.resumo.faturamentoTotal /
        relatorio.resumo.quantidadeVendas
      : 0;

  // Gera o relatório usando a constante fictícia.
  function gerarRelatorio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro('');
    setRelatorio(null);

    if (!dataInicio || !dataFim) {
      setErro('Informe a data inicial e a data final.');
      return;
    }

    if (dataInicio > dataFim) {
      setErro('A data inicial não pode ser posterior à data final.');
      return;
    }

    setRelatorio({
      ...RELATORIO_FICTICIO,
      periodo: {
        inicio: dataInicio,
        fim: dataFim,
      },
    });
  }

  // Abre a janela de impressão do navegador.
  function imprimirRelatorio() {
    window.print();
  }

  return (
    <main className="min-h-full bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Cabeçalho */}
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>Estoque</span>
            <span>/</span>
            <span>Relatórios</span>
            <span>/</span>
            <span>Vendas</span>
          </div>

          <h1 className="text-2xl font-bold text-[#172b4d] sm:text-3xl">
            Relatório de vendas
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Analise o desempenho das vendas e identifique os produtos mais
            vendidos em determinado período.
          </p>
        </header>

        {/* Filtro de período */}
        <section className="no-print mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Período do relatório
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Escolha as datas para gerar o relatório.
              </p>
            </div>
          </div>

          <form
            onSubmit={gerarRelatorio}
            className="grid grid-cols-1 items-end gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div>
              <label
                htmlFor="dataInicio"
                className="block text-sm font-medium text-slate-700"
              >
                Data inicial
              </label>

              <input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(event) => setDataInicio(event.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="dataFim"
                className="block text-sm font-medium text-slate-700"
              >
                Data final
              </label>

              <input
                id="dataFim"
                type="date"
                value={dataFim}
                min={dataInicio || undefined}
                onChange={(event) => setDataFim(event.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 sm:col-span-2 lg:col-span-1"
            >
              <Search size={18} />
              Gerar relatório
            </button>
          </form>

          {erro && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <p>{erro}</p>
            </div>
          )}
        </section>

        {/* Mensagem inicial */}
        {!relatorio && (
          <div className="no-print rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ChartNoAxesCombined size={27} />
            </div>

            <h2 className="mt-4 font-semibold text-slate-800">
              Consulte suas vendas
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Selecione as datas e clique em Gerar relatório para visualizar
              os indicadores, os produtos mais vendidos e uma análise
              simplificada dos resultados.
            </p>
          </div>
        )}

        {/* Resultado do relatório */}
        {relatorio && (
          <>
            <section className="relatorio-impressao space-y-6">
              {/* Cabeçalho do relatório */}
              <div className="border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 print:hidden">
                    <FileText size={23} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      RGR • Relatório gerencial
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-[#172b4d] sm:text-2xl">
                      Resumo das vendas
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Período:{' '}
                      {formatarData(relatorio.periodo.inicio)}
                      {' até '}
                      {formatarData(relatorio.periodo.fim)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Indicadores */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                      Faturamento total
                    </p>
                    <DollarSign size={20} className="text-emerald-600" />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {formatarMoeda(relatorio.resumo.faturamentoTotal)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Valor total das vendas
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                      Vendas realizadas
                    </p>
                    <ShoppingBag size={20} className="text-blue-600" />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {formatarNumero(relatorio.resumo.quantidadeVendas)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Quantidade de vendas
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">Itens vendidos</p>
                    <Package size={20} className="text-violet-600" />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {formatarNumero(relatorio.resumo.itensVendidos)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Unidades comercializadas
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">Ticket médio</p>
                    <TrendingUp size={20} className="text-amber-600" />
                  </div>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {formatarMoeda(ticketMedio)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Faturamento dividido pela quantidade de vendas
                  </p>
                </div>
              </div>

              {/* Análise simplificada */}
              <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ChartNoAxesCombined size={21} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Análise do período
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Destaques calculados a partir dos dados demonstrativos.
                    </p>
                  </div>
                </div>

                {itemMaisVendido ? (
                  <div className="space-y-3 text-sm leading-6 text-slate-600">
                    <p>
                      O produto com maior quantidade vendida foi{' '}
                      <strong className="font-semibold text-slate-900">
                        {itemMaisVendido.nome}
                      </strong>
                      , com{' '}
                      <strong className="font-semibold text-slate-900">
                        {formatarNumero(itemMaisVendido.quantidadeVendida)}
                      </strong>{' '}
                      unidade(s).
                    </p>

                    {relatorio.resumo.itensVendidos > 0 && (
                      <p>
                        Esse produto representa aproximadamente{' '}
                        <strong className="font-semibold text-slate-900">
                          {(
                            (itemMaisVendido.quantidadeVendida /
                              relatorio.resumo.itensVendidos) *
                            100
                          ).toLocaleString('pt-BR', {
                            maximumFractionDigits: 1,
                          })}
                          %
                        </strong>{' '}
                        do total de unidades vendidas.
                      </p>
                    )}

                    <p>
                      O faturamento demonstrativo foi de{' '}
                      <strong className="font-semibold text-slate-900">
                        {formatarMoeda(relatorio.resumo.faturamentoTotal)}
                      </strong>
                      , com{' '}
                      <strong className="font-semibold text-slate-900">
                        {formatarNumero(relatorio.resumo.quantidadeVendas)}
                      </strong>{' '}
                      venda(s) e ticket médio de{' '}
                      <strong className="font-semibold text-slate-900">
                        {formatarMoeda(ticketMedio)}
                      </strong>
                      .
                    </p>
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-slate-500">
                    Não existem produtos para exibir no ranking.
                  </p>
                )}
              </section>

              {/* Ranking dos produtos */}
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <BarChart3 size={21} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Produtos mais vendidos
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Ranking ordenado pela quantidade de unidades vendidas.
                      </p>
                    </div>
                  </div>
                </div>

                {itensOrdenados.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse text-left">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Posição
                          </th>

                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Produto
                          </th>

                          <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Quantidade
                          </th>

                          <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Faturamento
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {itensOrdenados.map((item, indice) => {
                          const percentual =
                            (item.quantidadeVendida / maiorQuantidade) * 100;

                          return (
                            <tr
                              key={item.id}
                              className="transition hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                                    indice === 0
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {indice + 1}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <p className="font-semibold text-slate-800">
                                  {item.nome}
                                </p>

                                {item.categoria && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {item.categoria}
                                  </p>
                                )}

                                <div className="mt-2 h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full bg-blue-600"
                                    style={{ width: `${percentual}%` }}
                                  />
                                </div>
                              </td>

                              <td className="px-5 py-4 text-right text-sm font-semibold tabular-nums text-slate-700">
                                {formatarNumero(item.quantidadeVendida)}
                              </td>

                              <td className="px-5 py-4 text-right text-sm font-semibold tabular-nums text-slate-700">
                                {formatarMoeda(item.faturamento)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-5 py-12 text-center">
                    <Package size={28} className="mx-auto text-slate-300" />

                    <p className="mt-3 font-medium text-slate-700">
                      Nenhum produto encontrado
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Não há itens para exibir.
                    </p>
                  </div>
                )}
              </section>

              <p className="text-xs text-slate-400">
                Relatório demonstrativo do sistema RGR. Os números apresentados
                não representam vendas reais.
              </p>
            </section>

            {/* Ações fora do relatório impresso */}
            <div className="no-print mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setRelatorio(null);
                  setErro('');
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Novo período
              </button>

              <button
                type="button"
                onClick={imprimirRelatorio}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                <Printer size={18} />
                Imprimir / Salvar em PDF
              </button>
            </div>
          </>
        )}
      </div>

      {/* Estilos para impressão */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 12mm;
          }

          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden !important;
          }

          .relatorio-impressao,
          .relatorio-impressao * {
            visibility: visible !important;
          }

          .relatorio-impressao {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .no-print {
            display: none !important;
          }

          .relatorio-impressao section,
          .relatorio-impressao > div {
            box-shadow: none !important;
          }

          .relatorio-impressao table {
            width: 100%;
            border-collapse: collapse;
          }

          .relatorio-impressao tr {
            break-inside: avoid;
          }

          .relatorio-impressao th,
          .relatorio-impressao td {
            padding: 8px;
          }
        }
      `}</style>
    </main>
  );
}
