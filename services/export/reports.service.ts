
import { axiosInstance } from "../api";

// Parâmetros para filtrar o relatório
export interface ReportFilter {
    dataInicio: string;
    dataFim: string;
}

// Resumo das vendas
export interface SalesSummary {
    faturamentoTotal: number;
    vendasRealizadas: number;
    itensVendidos: number;
    ticketMedio: number;
}

// Análise do período
export interface SalesAnalysis {
    produtoMaisVendido: string;
    quantidadeVendida: number;
    percentualVendas: number;
    faturamentoTotal: number;
    quantidadeVendas: number;
    ticketMedio: number;
}

// Produtos mais vendidos
export interface BestSellingProduct {
    id: number;
    nome: string;
    categoria: string;
    quantidadeVendida: number;
    faturamento: number;
    posicao: number;
}

export class ReportService {

    // Buscar resumo das vendas
    async listarResumo(filter: ReportFilter) {
        try {
            const resposta = await axiosInstance.get<SalesSummary>(
                "/reports/sales/summary",
                { params: filter }
            );

            return resposta.data;

        } catch (erro: unknown) {
            console.error("Erro ao buscar resumo das vendas:", erro);
            throw new Error("Não foi possível carregar o resumo das vendas.");
        }
    }

    // Buscar análise do período
    async listarAnalise(filter: ReportFilter) {
        try {
            const resposta = await axiosInstance.get<SalesAnalysis>(
                "/reports/sales/analysis",
                { params: filter }
            );

            return resposta.data;

        } catch (erro: unknown) {
            console.error("Erro ao buscar análise do período:", erro);
            throw new Error("Não foi possível carregar a análise do período.");
        }
    }

    // Buscar ranking dos produtos mais vendidos
    async listarProdutosMaisVendidos(filter: ReportFilter) {
        try {
            const resposta = await axiosInstance.get<BestSellingProduct[]>(
                "/reports/sales/top-products",
                { params: filter }
            );

            return resposta.data;

        } catch (erro: unknown) {
            console.error("Erro ao buscar produtos mais vendidos:", erro);
            throw new Error("Não foi possível carregar o ranking de produtos.");
        }
    }

    async carregarRelatorio() {
        try {
            const filtro = {
                dataInicio: "2026-10-01",
                dataFim: "2026-10-30",
            };

            const [resumo, analise, produtos] = await Promise.all([
                this.listarResumo(filtro),
                this.listarAnalise(filtro),
                this.listarProdutosMaisVendidos(filtro),
            ]);

            console.log(resumo);
            console.log(analise);
            console.log(produtos);

        } catch (erro) {
            console.error(erro);
        }
    }
}

export const reportService = new ReportService();
