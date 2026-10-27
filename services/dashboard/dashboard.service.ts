import "server-only";

import { apiGet } from "../api";

export interface DashboardProduct {
    id: number;
    name: string;
    category: string;
    price: number;
    quantity: number;
    image: string;
}

const PRODUCTS_ENDPOINT = "/products";

export async function getDashboardProducts(): Promise<DashboardProduct[]> {
    const data = await apiGet<unknown>(PRODUCTS_ENDPOINT);
    if (!Array.isArray(data)) {
        throw new Error("Formato inesperado da API: era esperado um array de produtos.");
    }

    return data as DashboardProduct[];
}