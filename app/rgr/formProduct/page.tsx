
'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Package,
  Tags,
  DollarSign,
  Ruler,
  FileText,
  Barcode,
  Save,
  RotateCcw,
  Truck,
} from 'lucide-react';
import { FORNECEDORES_EXEMPLO } from '../provider/page';
import { formProductService } from '@/services/formProduct/product.service';

const FORMULARIO_INICIAL = {
  nome: '',
  categoria: 'Camisa',
  sku: '',
  valor: '',
  quantidade: '1',
  fornecedorId: '',
  tamanho: 'M',
  descricao: '',
};

export default function formProduto() {
  const [form, setForm] = useState(FORMULARIO_INICIAL);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro'>(
    'sucesso',
  );

  const classeLabel = 'block text-sm font-medium text-slate-700';

  const classeInput =
    'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;

    setForm((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setMensagem('');
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const valor = Number(form.valor.replace(',', '.'));
    const quantidade = Number(form.quantidade);

    if (!form.nome.trim() || !form.categoria) {
      setTipoMensagem('erro');
      setMensagem('Preencha o nome e a categoria do produto.');
      return;
    }

    if (!form.valor.trim() || !Number.isFinite(valor) || valor <= 0) {
      setTipoMensagem('erro');
      setMensagem('Informe um valor de venda válido.');
      return;
    }

    if (
      form.quantidade.trim() === '' ||
      !Number.isInteger(quantidade) ||
      quantidade < 0
    ) {
      setTipoMensagem('erro');
      setMensagem('Informe uma quantidade inteira válida.');
      return;
    }

    const produto = {
      ...form,
      nome: form.nome.trim(),
      sku: form.sku.trim(),
      valor,
      quantidade,
    };


    try {
      const resposta = await formProductService.preecherProduto(produto);

      console.log("Produto cadastrado:", resposta);

      setTipoMensagem("sucesso");
      setMensagem("Produto cadastrado com sucesso!");
    } catch (erro) {
      setTipoMensagem("erro");

      setMensagem(
        erro instanceof Error
          ? erro.message
          : "Erro ao cadastrar produto."
      );
    }

  }

  function limparCampos() {
    setForm({ ...FORMULARIO_INICIAL });
    setMensagem('');
  }

  return (
    <main className="min-h-full bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Cabeçalho */}
        <header className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>Estoque</span>
            <span>/</span>
            <span>Produtos</span>
            <span>/</span>
            <span>Cadastro</span>
          </div>

          <h1 className="text-2xl font-bold text-[#172b4d] sm:text-3xl">
            Cadastrar produto
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Preencha os dados para adicionar um novo produto ao estoque.
          </p>
        </header>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Seção: dados do produto */}
          <section className="border-b border-slate-200 px-5 py-5 sm:px-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Package size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Dados do produto
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Identificação e classificação da mercadoria.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="nome" className={classeLabel}>
                  Nome do produto <span className="text-red-500">*</span>
                </label>

                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Ex.: Camiseta básica"
                  required
                  maxLength={120}
                  className={classeInput}
                />
              </div>

              <div>
                <label htmlFor="categoria" className={classeLabel}>
                  Categoria <span className="text-red-500">*</span>
                </label>

                <select
                  id="categoria"
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  required
                  className={classeInput}
                >
                  <option value="Camisa">Camisa</option>
                  <option value="Calça">Calça</option>
                  <option value="Short">Short</option>
                </select>
              </div>

              <div>
                <label htmlFor="sku" className={classeLabel}>
                  Código SKU
                </label>

                <div className="relative">
                  <Barcode
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="sku"
                    name="sku"
                    type="text"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="Ex.: CAM-001"
                    maxLength={50}
                    className={`${classeInput} pl-10`}
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Código para identificar o produto.
                </p>
              </div>
            </div>
          </section>

          {/* Seção: preço e estoque */}
          <section className="border-b border-slate-200 px-5 py-5 sm:px-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Preço e estoque
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Informe o preço de venda e a quantidade disponível.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="valor" className={classeLabel}>
                  Valor de venda (R$){' '}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                    R$
                  </span>

                  <input
                    id="valor"
                    name="valor"
                    type="text"
                    inputMode="decimal"
                    value={form.valor}
                    onChange={handleChange}
                    placeholder="0,00"
                    required
                    className={`${classeInput} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="quantidade" className={classeLabel}>
                  Quantidade em estoque{' '}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  id="quantidade"
                  name="quantidade"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantidade}
                  onChange={handleChange}
                  required
                  className={classeInput}
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Quantidade inicial disponível.
                </p>
              </div>
            </div>
          </section>

          {/* Seção: fornecedor */}
          <section className="border-b border-slate-200 px-5 py-5 sm:px-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Truck size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Fornecedor do produto
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Selecione o fornecedor responsável pelo abastecimento.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="fornecedorId" className={classeLabel}>
                  Fornecedor principal <span className="text-red-500">*</span>
                </label>

                <select
                  id="fornecedorId"
                  name="fornecedorId"
                  value={form.fornecedorId}
                  onChange={handleChange}
                  required
                  className={classeInput}
                >
                  <option value="">Selecione um fornecedor</option>

                  {FORNECEDORES_EXEMPLO.map((fornecedor) => (
                    <option key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nomeFantasia || fornecedor.nome}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-slate-400">
                  Não encontrou o fornecedor? Cadastre-o na área de fornecedores.
                </p>
              </div>
            </div>
          </section>

          {/* Seção: características */}
          <section className="border-b border-slate-200 px-5 py-5 sm:px-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Tags size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Características do produto
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Especifique o tamanho e outros detalhes da mercadoria.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="tamanho"
                  className={`${classeLabel} flex items-center gap-2`}
                >
                  <Ruler size={16} className="text-slate-400" />
                  Tamanho
                </label>

                <select
                  id="tamanho"
                  name="tamanho"
                  value={form.tamanho}
                  onChange={handleChange}
                  className={classeInput}
                >
                  <option value="PP">PP</option>
                  <option value="P">P</option>
                  <option value="M">M</option>
                  <option value="G">G</option>
                  <option value="GG">GG</option>
                  <option value="Único">Único</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="descricao"
                  className={`${classeLabel} flex items-center gap-2`}
                >
                  <FileText size={16} className="text-slate-400" />
                  Descrição
                </label>

                <textarea
                  id="descricao"
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  placeholder="Informe a cor, o material ou outras características do produto."
                  rows={4}
                  maxLength={1000}
                  className={`${classeInput} resize-y`}
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Campo opcional.
                </p>
              </div>
            </div>
          </section>

          {/* Rodapé do formulário */}
          <div className="px-5 py-5 sm:px-8">
            {mensagem && (
              <div
                role="status"
                aria-live="polite"
                className={`mb-5 rounded-lg border px-4 py-3 text-sm ${tipoMensagem === 'erro'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
              >
                {mensagem}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={limparCampos}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                <RotateCcw size={17} />
                Limpar campos
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                <Save size={17} />
                Cadastrar produto
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
