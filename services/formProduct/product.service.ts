
import { axiosInstance } from "../api";

export interface ProdutoProps {
  nome: string;
  categoria: string;
  sku: string;
  valor: number;
  quantidade: number;
  tamanho: string;
  descricao: string;
  fornecedorId?: string | number;
}

export class FormProductService {
  async preecherProduto(produto: ProdutoProps) {
    try {
      const resposta = await axiosInstance.post("/products", produto);

      return resposta.data;
    } catch (erro: unknown) {
      console.error("Erro ao cadastrar produto:", erro);

      throw new Error("Não foi possível cadastrar o produto.");
    }
  }
}

export const formProductService = new FormProductService();