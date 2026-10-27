
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {Plus, Search, Pencil, Trash2, Users, Phone, Mail, MapPin, Store, X, AlertTriangle} from 'lucide-react';

interface Fornecedor {
  id: string;
  nome: string;
  nomeFantasia: string;
  documento: string;
  telefone: string;
  email: string;
  cep: string;
  endereco: string;
  cidade: string;
  estado: string;
  observacoes: string;
}

export const FORNECEDORES_EXEMPLO: Fornecedor[] = [
  {
    id: '1',
    nome: 'Confecções Pantanal Ltda.',
    nomeFantasia: 'Pantanal Moda',
    documento: '00.000.000/0001-00',
    telefone: '(67) 3000-0001',
    email: 'contato@pantanal.example',
    cep: '79300-000',
    endereco: 'Rua das Flores, 120',
    cidade: 'Corumbá',
    estado: 'MS',
    observacoes: 'Fornecedor de camisetas e blusas.',
  },
  {
    id: '2',
    nome: 'Distribuidora Central Ltda.',
    nomeFantasia: 'Central Atacado',
    documento: '00.000.000/0001-01',
    telefone: '(67) 3000-0002',
    email: 'vendas@central.example',
    cep: '79002-000',
    endereco: 'Avenida Brasil, 450',
    cidade: 'Campo Grande',
    estado: 'MS',
    observacoes: 'Trabalha com roupas em atacado.',
  },
  {
    id: '3',
    nome: 'Jeans & Cia Confecções',
    nomeFantasia: 'Jeans & Cia',
    documento: '00.000.000/0001-02',
    telefone: '(67) 3000-0003',
    email: 'comercial@jeans.example',
    cep: '79010-000',
    endereco: 'Rua da Moda, 85',
    cidade: 'Campo Grande',
    estado: 'MS',
    observacoes: 'Fornecedor de calças e shorts jeans.',
  },
  {
    id: '4',
    nome: 'Estilo Jovem Confecções',
    nomeFantasia: 'Estilo Jovem',
    documento: '00.000.000/0001-03',
    telefone: '(67) 3000-0004',
    email: 'contato@estilojovem.example',
    cep: '79310-000',
    endereco: 'Rua do Comércio, 230',
    cidade: 'Corumbá',
    estado: 'MS',
    observacoes: 'Especializada em moda jovem.',
  },
  {
    id: '5',
    nome: 'Atacado Fashion Ltda.',
    nomeFantasia: 'Fashion Atacado',
    documento: '00.000.000/0001-04',
    telefone: '(67) 3000-0005',
    email: 'pedidos@fashion.example',
    cep: '79200-000',
    endereco: 'Avenida Central, 510',
    cidade: 'Aquidauana',
    estado: 'MS',
    observacoes: 'Fornecedor de jaquetas e casacos.',
  },
];

const STORAGE_KEY = 'rgr_fornecedores';

function lerFornecedores(): Fornecedor[] {
  try {
    if (!FORNECEDORES_EXEMPLO) return [];

    const resultado: unknown = FORNECEDORES_EXEMPLO;
    return Array.isArray(resultado) ? (resultado as Fornecedor[]) : [];
  } catch {
    return [];
  }
}

function salvarFornecedores(fornecedores: Fornecedor[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fornecedores));
}

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [fornecedorSelecionado, setFornecedorSelecionado] =
    useState<Fornecedor | null>(null);
  const [erroExclusao, setErroExclusao] = useState('');

  useEffect(() => {
    setFornecedores(lerFornecedores());
    setCarregando(false);
  }, []);

  const fornecedoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');

    if (!termo) return fornecedores;

    return fornecedores.filter((fornecedor) =>
      [
        fornecedor.nome,
        fornecedor.nomeFantasia,
        fornecedor.documento,
        fornecedor.telefone,
        fornecedor.email,
        fornecedor.cidade,
        fornecedor.estado,
      ].some((valor) =>
        (valor ?? '').toLocaleLowerCase('pt-BR').includes(termo),
      ),
    );
  }, [fornecedores, busca]);

  function excluirFornecedor() {
    if (!fornecedorSelecionado) return;

    try {
      const atualizados = fornecedores.filter(
        (fornecedor) => fornecedor.id !== fornecedorSelecionado.id,
      );

      salvarFornecedores(atualizados);
      setFornecedores(atualizados);
      setFornecedorSelecionado(null);
      setErroExclusao('');
    } catch {
      setErroExclusao(
        'Não foi possível excluir o fornecedor. Tente novamente.',
      );
    }
  }

  return (
    <div className="min-h-full bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Cabeçalho */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <span>Estoque</span>
              <span>/</span>
              <span>Fornecedores</span>
            </div>

            <h1 className="text-2xl font-bold text-[#172b4d] sm:text-3xl">
              Fornecedores
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Gerencie os fornecedores e os contatos comerciais da loja.
            </p>
          </div>

          <Link
            href="/rgr/provider/registerProvider"
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 sm:self-auto"
          >
            <Plus size={18} />
            Novo fornecedor
          </Link>
        </div>

        {/* Resumo */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={23} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Fornecedores cadastrados
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {carregando ? '—' : fornecedores.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Store size={23} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Resultados da pesquisa
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {carregando ? '—' : fornecedoresFiltrados.length}
              </p>
            </div>
          </div>
        </div>

        {/* Pesquisa */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Lista de fornecedores
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Consulte, edite ou remova um fornecedor.
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar fornecedor..."
              aria-label="Buscar fornecedor"
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fornecedor
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    CPF / CNPJ
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contato
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Localização
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {carregando ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      Carregando fornecedores...
                    </td>
                  </tr>
                ) : fornecedoresFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        {busca ? <Search size={22} /> : <Users size={22} />}
                      </div>

                      <p className="mt-3 font-semibold text-slate-800">
                        {busca
                          ? 'Nenhum fornecedor encontrado'
                          : 'Nenhum fornecedor cadastrado'}
                      </p>

                      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                        {busca
                          ? 'Tente pesquisar por outro nome, documento ou contato.'
                          : 'Cadastre seu primeiro fornecedor para começar a organizar seus parceiros comerciais.'}
                      </p>

                      {!busca && (
                        <Link
                          href="/rgr/provider/registerProvider"
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          <Plus size={17} />
                          Cadastrar fornecedor
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  fornecedoresFiltrados.map((fornecedor) => (
                    <tr
                      key={fornecedor.id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <Store size={19} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {fornecedor.nome}
                            </p>

                            {fornecedor.nomeFantasia && (
                              <p className="mt-1 text-xs text-slate-500">
                                {fornecedor.nomeFantasia}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {fornecedor.documento || '—'}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2">
                          {fornecedor.telefone && (
                            <span className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone
                                size={15}
                                className="shrink-0 text-slate-400"
                              />
                              {fornecedor.telefone}
                            </span>
                          )}

                          {fornecedor.email && (
                            <span className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail
                                size={15}
                                className="shrink-0 text-slate-400"
                              />
                              <span className="max-w-[190px] truncate">
                                {fornecedor.email}
                              </span>
                            </span>
                          )}

                          {!fornecedor.telefone && !fornecedor.email && '—'}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin
                            size={16}
                            className="shrink-0 text-slate-400"
                          />

                          <span>
                            {fornecedor.cidade || fornecedor.estado
                              ? [fornecedor.cidade, fornecedor.estado]
                                  .filter(Boolean)
                                  .join(' / ')
                              : '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/rgr/provider/registerProvider?id=${encodeURIComponent(
                              fornecedor.id,
                            )}`}
                            title="Editar fornecedor"
                            aria-label={`Editar ${fornecedor.nome}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil size={16} />
                          </Link>

                          <button
                            type="button"
                            title="Excluir fornecedor"
                            aria-label={`Excluir ${fornecedor.nome}`}
                            onClick={() => {
                              setErroExclusao('');
                              setFornecedorSelecionado(fornecedor);
                            }}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Rodapé da tabela */}
          {!carregando && fornecedoresFiltrados.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-3">
              <p className="text-xs text-slate-500">
                Exibindo {fornecedoresFiltrados.length}{' '}
                {fornecedoresFiltrados.length === 1
                  ? 'fornecedor'
                  : 'fornecedores'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {fornecedorSelecionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setFornecedorSelecionado(null);
              setErroExclusao('');
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-exclusao"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle size={24} />
              </div>

              <button
                type="button"
                onClick={() => {
                  setFornecedorSelecionado(null);
                  setErroExclusao('');
                }}
                aria-label="Fechar confirmação"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <h2
              id="titulo-exclusao"
              className="mt-4 text-xl font-bold text-slate-900"
            >
              Excluir fornecedor?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tem certeza de que deseja excluir{' '}
              <strong className="font-semibold text-slate-800">
                {fornecedorSelecionado.nome}
              </strong>
              ? Essa ação removerá o cadastro do armazenamento local deste
              protótipo.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Antes da integração com o banco de dados, será importante
              verificar se existem registros de compras relacionados a esse
              fornecedor.
            </p>

            {erroExclusao && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {erroExclusao}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setFornecedorSelecionado(null);
                  setErroExclusao('');
                }}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={excluirFornecedor}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20"
              >
                <Trash2 size={16} />
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
