import { axiosInstance } from "../api";

export interface ProviderProps {
}

export class FormProductService {
    async preecherProvider(provider: ProviderProps) {
        try {
            const resposta = await axiosInstance.post("/providers", provider);
            return resposta.data;
        } catch (erro: unknown) {
            console.error("Erro ao cadastrar fornecedor:", erro);
            throw new Error("Não foi possível cadastrar o fornecedor.");
        }
    }

    async listingAllProvider() {
        try {
            const res = await axiosInstance.get('/providers')
            return res.data;
        } catch (erro: unknown) {
            console.error("Erro ao cadastrar fornecedor:", erro);
            throw new Error("Não foi possível cadastrar o fornecedor.");
        }
    }

    async deleteProvider(id: number) {
        try {
            const resposta = await axiosInstance.delete(`/providers/${id}`);
            return resposta.data;
        } catch (erro: unknown) {
            console.error("Erro ao excluir fornecedor:", erro);
            throw new Error("Não foi possível excluir o fornecedor.");
        }
    }
    
    async updateProvider(id: number, provider: ProviderProps) {
        try {
            const resposta = await axiosInstance.put(`/providers/${id}`, provider);
            return resposta.data;
        } catch (erro: unknown) {
            console.error("Erro ao editar fornecedor:", erro);
            throw new Error("Não foi possível editar o fornecedor.");
        }
    }
}

export const formProductService = new FormProductService();