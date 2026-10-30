import { axiosInstance } from "../api";

export interface DashboardProduct {
    id: number;
    name: string;
    category: string;
    price: number;
    quantity: number;
    image: string;
}

export class DashboardService {

    async listarTodos() {
        try {
            const resposta = await axiosInstance.get("/products");
            return resposta.data;
        } catch (erro: unknown) {
            console.error("Erro ao listar produtos:", erro);
            throw new Error("Não foi possível listar os produtos.");
        }
    }

    async cadastrarProduto(produto: DashboardProduct) {
        try {
            const resposta = await axiosInstance.post("/products", produto);
            return resposta.data;
        } catch (erro: unknown) {
            console.error("Erro ao cadastrar produto:", erro);
            throw new Error("Não foi possível cadastrar o produto.");
        }
    }

    async editarProduto(id: number, produto: DashboardProduct) {
        try {
            const resposta = await axiosInstance.put(`/products/${id}`, produto);
            return resposta.data;
        } catch (erro: unknown) {
            console.error("Erro ao editar produto:", erro);
            throw new Error("Não foi possível editar o produto.");
        }
    }
    
    async excluirProduto(id: number) {
        try {
            const resposta = await axiosInstance.delete(`/products/${id}`);
            return resposta.data;
        } catch (erro: unknown) {
            console.error("Erro ao excluir produto:", erro);
            throw new Error("Não foi possível excluir o produto.");
        }
    }

    async registrarVenda(id: number, quantidade: number) {
    try {
        const resposta = await axiosInstance.patch(`/products/${id}/sale`, {
            quantidadeVendida: quantidade
        });

        return resposta.data;

    } catch (erro: unknown) {
        console.error("Erro ao registrar venda:", erro);
        throw new Error("Não foi possível registrar a venda do produto.");
    }
}
}

export const dashboardService = new DashboardService();