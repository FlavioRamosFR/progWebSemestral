import { apiPost } from "../api";

const PRODUCTS_ENDPOINT = "/products";

export interface CreateProductPayload {
  name: string;
  category: string;
  sku: string | null;
  price: number;
  quantity: number;
  supplierId: number;
  size: string;
  description: string | null;
}

export async function createProduct( product: CreateProductPayload,): Promise<void> {
  await apiPost<unknown, CreateProductPayload>(PRODUCTS_ENDPOINT,product,);
}