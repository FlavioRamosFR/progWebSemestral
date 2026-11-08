import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 15000,
    withCredentials: true,
    headers: {
        Accept: "application/json",
    },
});

// Usa a mensagem de erro enviada pela API, como "Seu perfil não tem permissão para esta ação"
export function mensagemDaApi(erro: unknown, mensagemPadrao: string): string {
    if (axios.isAxiosError(erro) && erro.response?.data?.erro) {
        return erro.response.data.erro;
    }

    return mensagemPadrao;
}

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (typeof window !== 'undefined' && status) {
        // Avisa a aplicação que aconteceu um erro HTTP
        window.dispatchEvent(
          new CustomEvent('api:http-error', {
            detail: { status },
          })
        );
      }
    }

    return Promise.reject(error);
  }
);

export async function testarErro() {
  try {
    await axiosInstance.get('/rota-que-nao-existe');
  } catch (error) {
    console.error('Erro provocado para teste:', error);
  }
}