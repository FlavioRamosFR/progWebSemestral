import { axiosInstance, mensagemDaApi } from "../api";

export interface ProviderProps {
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

export interface Provider extends ProviderProps {
    id: string;
}

export class FormProductService {
    async preecherProvider(provider: ProviderProps): Promise<Provider> {
        try {
            const resposta = await axiosInstance.post("/providers", provider);
            return resposta.data;
        } catch (erro: unknown) {
            console.error("Erro ao cadastrar fornecedor:", erro);
            throw new Error(mensagemDaApi(erro, "Não foi possível cadastrar o fornecedor."));
        }
    }

    async listingAllProvider(): Promise<Provider[]> {
        try {
            const res = await axiosInstance.get('/providers')
            return res.data;
        } catch (erro: unknown) {
            console.error("Erro ao listar fornecedores:", erro);
            throw new Error(mensagemDaApi(erro, "Não foi possível listar os fornecedores."));
        }
    }

    async getProvider(id: string): Promise<Provider> {
        try {
            const resposta = await axiosInstance.get(`/providers/${id}`);
            return resposta.data;
        } catch (erro: unknown) {
            console.error("Erro ao buscar fornecedor:", erro);
            throw new Error(mensagemDaApi(erro, "Não foi possível buscar o fornecedor."));
        }
    }

    async deleteProvider(id: string) {
        try {
            const resposta = await axiosInstance.delete(`/providers/${id}`);
            return resposta.data;
        } catch (erro: unknown) {
            console.error("Erro ao excluir fornecedor:", erro);
            throw new Error(mensagemDaApi(erro, "Não foi possível excluir o fornecedor."));
        }
    }

    async updateProvider(id: string, provider: ProviderProps): Promise<Provider> {
        try {
            const resposta = await axiosInstance.put(`/providers/${id}`, provider);
            return resposta.data;
        } catch (erro: unknown) {
            console.error("Erro ao editar fornecedor:", erro);
            throw new Error(mensagemDaApi(erro, "Não foi possível editar o fornecedor."));
        }
    }
}

export const formProductService = new FormProductService();
