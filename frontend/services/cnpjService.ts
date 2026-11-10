export interface CnpjData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  descricao_situacao_cadastral: string;
  descricao_tipo_de_logradouro?: string | null;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  ddd_telefone_1: string;
  email: string | null;
}

export async function cnpjService(cnpj: string): Promise<CnpjData> {
  const cnpjFormat = cnpj.replace(/\D/g, "");

  if (cnpjFormat.length !== 14) {
    throw new Error("CNPJ incompleto");
  }

  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjFormat}`);

  if (res.status === 404) {
    throw new Error("CNPJ não encontrado");
  }
  if (res.status === 400) {
    throw new Error("CNPJ inválido");
  }
  if (res.status === 429) {
    throw new Error("Muitas consultas. Tente novamente em instantes");
  }
  if (!res.ok) {
    throw new Error("Erro ao buscar CNPJ");
  }

  return res.json();
}
