import { axiosInstance, mensagemDaApi } from "../api";

export class AuthService {
    async sair() {
        try {
            await axiosInstance.post("/logout");
        } catch (erro: unknown) {
            console.error("Erro ao encerrar a sessão:", erro);
            throw new Error(mensagemDaApi(erro, "Não foi possível sair."));
        }
    }
}

export const authService = new AuthService();
