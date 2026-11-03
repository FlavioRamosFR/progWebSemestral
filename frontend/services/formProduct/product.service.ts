
import { axiosInstance, mensagemDaApi } from "../api";

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

      throw new Error(mensagemDaApi(erro, "Não foi possível cadastrar o produto."));
    }
  }

  async buscarProduto(id: string) {
    try {
      const resposta = await axiosInstance.get(`/products/${id}`);

      return resposta.data;
    } catch (erro: unknown) {
      console.error("Erro ao buscar produto:", erro);

      throw new Error(mensagemDaApi(erro, "Não foi possível buscar o produto."));
    }
  }

  async atualizarProduto(id: string, produto: ProdutoProps) {
    try {
      const resposta = await axiosInstance.put(`/products/${id}`, produto);

      return resposta.data;
    } catch (erro: unknown) {
      console.error("Erro ao editar produto:", erro);

      throw new Error(mensagemDaApi(erro, "Não foi possível editar o produto."));
    }
  }
}

export const formProductService = new FormProductService();
