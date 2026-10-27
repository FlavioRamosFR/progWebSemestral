const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiRequest<T>(endpoint: string, options: RequestInit = {},): Promise<T> {
    if (!API_URL) {
        throw new Error(
            "A variável NEXT_PUBLIC_API_URL não foi configurada.",
        );
    }

    const baseUrl = API_URL.replace(/\/$/, "");

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
            Accept: "application/json",
            ...(options.body
                ? { "Content-Type": "application/json" }
                : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(
            `Erro na requisição: HTTP ${response.status}.`,
        );
    }

    // Algumas APIs respondem sem conteúdo após uma operação.
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

// GET: consultar dados
export function apiGet<T>(
    endpoint: string,
): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: "GET",
    });
}

// POST: enviar dados para cadastro
export function apiPost<TResponse, TBody>(
    endpoint: string,
    body: TBody,
): Promise<TResponse> {
    return apiRequest<TResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
    });
}