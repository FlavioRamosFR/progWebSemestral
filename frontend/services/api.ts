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