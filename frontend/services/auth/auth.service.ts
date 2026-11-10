import { axiosInstance, mensagemDaApi } from "../api";

export interface UsuarioSessao {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export class AuthService {
  async obterPerfil(): Promise<UsuarioSessao> {
    try {
      const response = await axiosInstance.get("/perfil");

      return response.data.usuario;
    } catch (erro: unknown) {
      throw new Error(
        mensagemDaApi(erro, "Não foi possível consultar o usuário."),
      );
    }
  }

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
