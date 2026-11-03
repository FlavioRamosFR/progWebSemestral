
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Save, X, Store, Mail, Phone, MapPin,} from 'lucide-react';
import { formProductService as providerService } from '@/services/provider/provider.service';

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

type FormularioFornecedor = Omit<Fornecedor, 'id'>;

const FORMULARIO_VAZIO: FormularioFornecedor = {
  nome: '',
  nomeFantasia: '',
  documento: '',
  telefone: '',
  email: '',
  cep: '',
  endereco: '',
  cidade: '',
  estado: '',
  observacoes: '',
};

export default function CadastrarFornecedorPage() {
  const router = useRouter();

  const [id, setId] = useState<string | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioFornecedor>(FORMULARIO_VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const idUrl = new URLSearchParams(window.location.search).get('id');

    if (!idUrl) {
      setCarregando(false);
      return;
    }

    providerService
      .getProvider(idUrl)
      .then((fornecedor) => {
        setId(fornecedor.id);

        const { id: _id, ...dadosFornecedor } = fornecedor;
        setFormulario({
          ...FORMULARIO_VAZIO,
          ...dadosFornecedor,
        });
      })
      .catch(() => setNaoEncontrado(true))
      .finally(() => setCarregando(false));
  }, []);

  function atualizarCampo(
    campo: keyof FormularioFornecedor,
    valor: string,
  ) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));

    setErro('');
  }

  async function salvarFornecedor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro('');

    if (!formulario.nome.trim()) {
      setErro('Informe o nome ou a razão social do fornecedor.');
      return;
    }

    if (!formulario.telefone.trim() && !formulario.email.trim()) {
      setErro('Informe pelo menos um telefone ou e-mail para contato.');
      return;
    }

    setSalvando(true);

    try {
      const dados: FormularioFornecedor = {
        ...formulario,
        nome: formulario.nome.trim(),
        nomeFantasia: formulario.nomeFantasia.trim(),
        documento: formulario.documento.trim(),
        telefone: formulario.telefone.trim(),
        email: formulario.email.trim(),
        cep: formulario.cep.trim(),
        endereco: formulario.endereco.trim(),
        cidade: formulario.cidade.trim(),
        estado: formulario.estado.trim().toUpperCase(),
        observacoes: formulario.observacoes.trim(),
      };

      if (id) {
        await providerService.updateProvider(id, dados);
      } else {
        await providerService.preecherProvider(dados);
      }

      router.push('/rgr/provider');
    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível salvar o fornecedor. Tente novamente.',
      );
      setSalvando(false);
    }
  }

  const classeInput =
    'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

  const classeLabel = 'block text-sm font-medium text-slate-700';

  if (carregando) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
        Carregando dados do fornecedor...
      </div>
    );
  }

  if (naoEncontrado) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Fornecedor não encontrado
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            O cadastro pode ter sido excluído ou não existe.
          </p>

          <Link
            href="/rgr/provider"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Voltar aos fornecedores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navegação */}
        <Link
          href="/rgr/provider"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Voltar para fornecedores
        </Link>

        {/* Cabeçalho */}
        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>Estoque</span>
            <span>/</span>
            <Link
              href="/rgr/provider"
              className="transition hover:text-blue-600"
            >
              Fornecedores
            </Link>
            <span>/</span>
            <span>{id ? 'Editar' : 'Cadastro'}</span>
          </div>

          <h1 className="text-2xl font-bold text-[#172b4d] sm:text-3xl">
            {id ? 'Editar fornecedor' : 'Cadastrar fornecedor'}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {id
              ? 'Atualize as informações do fornecedor cadastrado.'
              : 'Preencha os dados para adicionar um novo fornecedor.'}
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={salvarFornecedor}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Dados principais */}
          <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Building2 size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Dados do fornecedor
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Identificação e informações comerciais.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className={`${classeLabel} sm:col-span-2`}>
                Nome ou razão social <span className="text-red-500">*</span>
                <input
                  type="text"
                  value={formulario.nome}
                  onChange={(e) => atualizarCampo('nome', e.target.value)}
                  placeholder="Ex.: Moda Atacado Ltda."
                  required
                  maxLength={120}
                  autoFocus
                  className={classeInput}
                />
              </label>

              <label className={classeLabel}>
                Nome fantasia
                <input
                  type="text"
                  value={formulario.nomeFantasia}
                  onChange={(e) =>
                    atualizarCampo('nomeFantasia', e.target.value)
                  }
                  placeholder="Ex.: Moda Atacado"
                  maxLength={120}
                  className={classeInput}
                />
              </label>

              <label className={classeLabel}>
                CPF ou CNPJ
                <input
                  type="text"
                  value={formulario.documento}
                  onChange={(e) =>
                    atualizarCampo('documento', e.target.value)
                  }
                  placeholder="Informe o documento"
                  maxLength={20}
                  className={classeInput}
                />
              </label>
            </div>
          </div>

          {/* Contato */}
          <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Phone size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Informações de contato
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Informe pelo menos um meio para entrar em contato.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className={classeLabel}>
                Telefone / WhatsApp
                <input
                  type="tel"
                  value={formulario.telefone}
                  onChange={(e) =>
                    atualizarCampo('telefone', e.target.value)
                  }
                  placeholder="(67) 99999-9999"
                  maxLength={25}
                  className={classeInput}
                />
              </label>

              <label className={classeLabel}>
                E-mail
                <input
                  type="email"
                  value={formulario.email}
                  onChange={(e) => atualizarCampo('email', e.target.value)}
                  placeholder="contato@fornecedor.com.br"
                  maxLength={150}
                  className={classeInput}
                />
              </label>
            </div>
          </div>

          {/* Endereço */}
          <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <MapPin size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">Endereço</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Localização do fornecedor, se disponível.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
              <label className={`${classeLabel} sm:col-span-2`}>
                CEP
                <input
                  type="text"
                  value={formulario.cep}
                  onChange={(e) => atualizarCampo('cep', e.target.value)}
                  placeholder="00000-000"
                  maxLength={10}
                  className={classeInput}
                />
              </label>

              <label className={`${classeLabel} sm:col-span-4`}>
                Endereço
                <input
                  type="text"
                  value={formulario.endereco}
                  onChange={(e) =>
                    atualizarCampo('endereco', e.target.value)
                  }
                  placeholder="Rua, avenida e número"
                  maxLength={180}
                  className={classeInput}
                />
              </label>

              <label className={`${classeLabel} sm:col-span-4`}>
                Cidade
                <input
                  type="text"
                  value={formulario.cidade}
                  onChange={(e) => atualizarCampo('cidade', e.target.value)}
                  placeholder="Nome da cidade"
                  maxLength={100}
                  className={classeInput}
                />
              </label>

              <label className={`${classeLabel} sm:col-span-2`}>
                UF
                <input
                  type="text"
                  value={formulario.estado}
                  onChange={(e) =>
                    atualizarCampo(
                      'estado',
                      e.target.value.toUpperCase().slice(0, 2),
                    )
                  }
                  placeholder="MS"
                  maxLength={2}
                  className={classeInput}
                />
              </label>
            </div>
          </div>

          {/* Observações */}
          <div className="px-5 py-5 sm:px-8">
            <label className={classeLabel}>
              Observações comerciais
              <textarea
                value={formulario.observacoes}
                onChange={(e) =>
                  atualizarCampo('observacoes', e.target.value)
                }
                placeholder="Ex.: prazo de entrega, pedido mínimo ou condições de pagamento."
                rows={4}
                maxLength={1000}
                className={`${classeInput} resize-y`}
              />
            </label>

            <p className="mt-1.5 text-xs text-slate-400">
              Campo opcional.
            </p>

            {erro && (
              <div
                role="alert"
                className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {erro}
              </div>
            )}

            {/* Botões */}
            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Link
                href="/rgr/provider"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <X size={17} />
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={salvando}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />
                {salvando
                  ? 'Salvando...'
                  : id
                    ? 'Salvar alterações'
                    : 'Cadastrar fornecedor'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
