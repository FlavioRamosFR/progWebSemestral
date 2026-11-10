'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Loader2, Save, X, Phone, MapPin } from 'lucide-react';
import { formProductService as providerService } from '@/services/provider/provider.service';
import { maskCep, maskCpfCnpj, maskPhone } from '@/utils/masks';
import { cepService } from '@/services/cepService';
import { cnpjService, type CnpjData } from '@/services/cnpjService';

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

function somenteNumeros(valor: string) {
  return valor.replace(/\D/g, '');
}

// Todos os campos são obrigatórios, exceto "observacoes"
const CAMPOS_OBRIGATORIOS: {
  campo: keyof FormularioFornecedor;
  rotulo: string;
}[] = [
  { campo: 'documento', rotulo: 'CNPJ ou CPF' },
  { campo: 'nome', rotulo: 'nome ou razão social' },
  { campo: 'nomeFantasia', rotulo: 'nome fantasia' },
  { campo: 'telefone', rotulo: 'telefone' },
  { campo: 'email', rotulo: 'e-mail' },
  { campo: 'cep', rotulo: 'CEP' },
  { campo: 'endereco', rotulo: 'endereço' },
  { campo: 'cidade', rotulo: 'cidade' },
  { campo: 'estado', rotulo: 'UF' },
];

// A BrasilAPI devolve endereço e cidade em maiúsculas: "AVENIDA PAULISTA" -> "Avenida Paulista"
function capitalizar(texto: string) {
  return texto
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letra) => letra.toUpperCase());
}

function montarEndereco(empresa: CnpjData) {
  const rua = [empresa.descricao_tipo_de_logradouro, empresa.logradouro]
    .filter(Boolean)
    .join(' ');

  if (!rua) return '';

  return empresa.numero
    ? `${capitalizar(rua)}, ${empresa.numero}`
    : capitalizar(rua);
}

export default function CadastrarFornecedorPage() {
  const router = useRouter();

  const [id, setId] = useState<string | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioFornecedor>(FORMULARIO_VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);

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

  function atualizarCampo(campo: keyof FormularioFornecedor, valor: string) {
    let valorFormatado = valor;

    switch (campo) {
      case 'documento': {
        valorFormatado = maskCpfCnpj(valor);

        const digitos = somenteNumeros(valorFormatado);
        const documentoMudou =
          digitos !== somenteNumeros(formulario.documento);

        // CNPJ completo (14 dígitos): busca os dados da empresa e preenche o formulário
        if (digitos.length === 14 && documentoMudou) {
          buscarCnpj(digitos);
        }
        break;
      }

      case 'telefone':
        valorFormatado = maskPhone(valor);
        break;

      case 'cep':
        valorFormatado = maskCep(valor);
        break;
    }

    setFormulario((atual) => ({ ...atual, [campo]: valorFormatado }));
    setErro('');
  }

  async function buscarCnpj(cnpj: string) {
    setBuscandoCnpj(true);

    try {
      const empresa = await cnpjService(cnpj);

      setFormulario((atual) => {
        // Se o CNPJ foi alterado enquanto a busca rodava, ignora essa resposta
        if (somenteNumeros(atual.documento) !== cnpj) return atual;

        // Os dados da empresa substituem o que já estava preenchido.
        // O que a Receita não informa fica vazio para ser preenchido à mão.
        // As observações não vêm da API e são mantidas.
        return {
          ...atual,
          nome: empresa.razao_social || '',
          nomeFantasia: empresa.nome_fantasia || '',
          telefone: empresa.ddd_telefone_1
            ? maskPhone(empresa.ddd_telefone_1)
            : '',
          email: empresa.email ? empresa.email.toLowerCase() : '',
          cep: empresa.cep ? maskCep(String(empresa.cep)) : '',
          endereco: montarEndereco(empresa),
          cidade: empresa.municipio ? capitalizar(empresa.municipio) : '',
          estado: empresa.uf || '',
        };
      });

      setErro('');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível consultar o CNPJ.',
      );
    } finally {
      setBuscandoCnpj(false);
    }
  }

  async function salvarFornecedor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro('');

    const faltando = CAMPOS_OBRIGATORIOS.filter(
      ({ campo }) => !formulario[campo].trim(),
    );

    if (faltando.length > 0) {
      setErro(
        `Preencha os campos obrigatórios: ${faltando
          .map(({ rotulo }) => rotulo)
          .join(', ')}.`,
      );
      return;
    }

    const tamanhoDocumento = somenteNumeros(formulario.documento).length;
    if (tamanhoDocumento !== 11 && tamanhoDocumento !== 14) {
      setErro('Informe um CPF (11 dígitos) ou um CNPJ (14 dígitos) completo.');
      return;
    }

    if (somenteNumeros(formulario.telefone).length < 10) {
      setErro('Informe um telefone completo, com DDD.');
      return;
    }

    if (somenteNumeros(formulario.cep).length !== 8) {
      setErro('Informe um CEP com 8 dígitos.');
      return;
    }

    if (formulario.estado.trim().length !== 2) {
      setErro('Informe a sigla do estado com 2 letras.');
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

  async function buscarCep() {
    const cep = somenteNumeros(formulario.cep);

    // Só consulta quando tiver os 8 números
    if (cep.length !== 8) return;

    try {
      const dados = await cepService(cep);

      setFormulario((atual) => ({
        ...atual,
        endereco: dados.logradouro || atual.endereco,
        cidade: dados.localidade || atual.cidade,
        estado: dados.uf || atual.estado,
      }));

      setErro('');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível consultar o CEP.',
      );
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
              {/* CNPJ vem primeiro: ao completar, preenche o restante do formulário */}
              <div className="sm:col-span-2">
                <label className={classeLabel}>
                  CNPJ ou CPF <span className="text-red-500">*</span>
                  <span className="relative block">
                    <input
                      type="text"
                      value={formulario.documento}
                      onChange={(e) =>
                        atualizarCampo('documento', e.target.value)
                      }
                      placeholder="Ex.: 00.000.000/0000-00"
                      maxLength={20}
                      required
                      autoFocus
                      className={`${classeInput} ${buscandoCnpj ? 'pr-11' : ''}`}
                    />

                    {buscandoCnpj && (
                      <Loader2
                        size={18}
                        aria-hidden="true"
                        className="absolute bottom-3.5 right-3.5 animate-spin text-blue-600"
                      />
                    )}
                  </span>
                </label>

                <p
                  aria-live="polite"
                  className="mt-1.5 text-xs text-slate-400"
                >
                  {buscandoCnpj
                    ? 'Buscando dados do CNPJ...'
                    : 'Ao informar um CNPJ completo, os dados da empresa são preenchidos automaticamente.'}
                </p>
              </div>

              <label className={`${classeLabel} sm:col-span-2`}>
                Nome ou razão social <span className="text-red-500">*</span>
                <input
                  type="text"
                  value={formulario.nome}
                  onChange={(e) => atualizarCampo('nome', e.target.value)}
                  placeholder="Ex.: Moda Atacado Ltda."
                  required
                  maxLength={120}
                  className={classeInput}
                />
              </label>

              <label className={`${classeLabel} sm:col-span-2`}>
                Nome fantasia <span className="text-red-500">*</span>
                <input
                  type="text"
                  value={formulario.nomeFantasia}
                  onChange={(e) =>
                    atualizarCampo('nomeFantasia', e.target.value)
                  }
                  placeholder="Ex.: Moda Atacado"
                  required
                  maxLength={120}
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
                  Telefone e e-mail do fornecedor.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className={classeLabel}>
                Telefone / WhatsApp <span className="text-red-500">*</span>
                <input
                  type="tel"
                  value={formulario.telefone}
                  onChange={(e) =>
                    atualizarCampo('telefone', e.target.value)
                  }
                  placeholder="(67) 99999-9999"
                  required
                  maxLength={25}
                  className={classeInput}
                />
              </label>

              <label className={classeLabel}>
                E-mail <span className="text-red-500">*</span>
                <input
                  type="email"
                  value={formulario.email}
                  onChange={(e) => atualizarCampo('email', e.target.value)}
                  placeholder="contato@fornecedor.com.br"
                  required
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
                  Localização do fornecedor.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
              <label className={`${classeLabel} sm:col-span-2`}>
                CEP <span className="text-red-500">*</span>
                <input
                  type="text"
                  value={formulario.cep}
                  onChange={(e) => atualizarCampo('cep', e.target.value)}
                  onBlur={buscarCep}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      buscarCep();
                    }
                  }}
                  placeholder="00000-000"
                  required
                  maxLength={9}
                  className={classeInput}
                />
              </label>

              <label className={`${classeLabel} sm:col-span-4`}>
                Endereço <span className="text-red-500">*</span>
                <input
                  type="text"
                  value={formulario.endereco}
                  onChange={(e) =>
                    atualizarCampo('endereco', e.target.value)
                  }
                  placeholder="Rua, avenida e número"
                  required
                  maxLength={180}
                  className={classeInput}
                />
              </label>

              <label className={`${classeLabel} sm:col-span-4`}>
                Cidade <span className="text-red-500">*</span>
                <input
                  type="text"
                  value={formulario.cidade}
                  onChange={(e) => atualizarCampo('cidade', e.target.value)}
                  placeholder="Nome da cidade"
                  required
                  maxLength={100}
                  className={classeInput}
                />
              </label>

              <label className={`${classeLabel} sm:col-span-2`}>
                UF <span className="text-red-500">*</span>
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
                  required
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