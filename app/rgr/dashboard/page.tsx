"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Boxes, ChevronLeft, ChevronRight, Package, Search, ShoppingCart, } from "lucide-react";
import { DashboardProduct, getDashboardProducts } from "@/services/dashboard/dashboard.service";

const PAGE_SIZE = 6;

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);

export default function DashboardPage() {

    const [products, setProducts] = useState<DashboardProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);


    useEffect(() => {
        async function loadProducts() {
            try {
                const result = await getDashboardProducts();
                setProducts(result);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Erro ao carregar os produtos."
                );
            } finally {
                setIsLoading(false);
            }
        }

        void loadProducts();
    }, []);

    useEffect(() => {
        const mainContent =
            document.getElementById("main-content");

        if (!mainContent) {
            return;
        }

        mainContent.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, [currentPage]);

    // Pesquisa produtos pelo nome ou categoria
    const filteredProducts = products.filter((product) => {
        const term = search.toLowerCase().trim();

        return (
            product.name.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)
        );
    });

    // Calcula a quantidade de páginas
    const totalPages = Math.max(
        1,
        Math.ceil(filteredProducts.length / PAGE_SIZE)
    );

    // Separa os produtos da página atual
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const visibleProducts = filteredProducts.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );

    // Indicadores do estoque
    const totalPieces = products.reduce(
        (total, product) => total + product.quantity,
        0
    );

    const productsToRestock = products.filter(
        (product) => product.quantity <= 5
    ).length;

    // Altera a página
    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    // Registra a venda de uma unidade
    const handleSale = (productId: number) => {
        setProducts((previousProducts) =>
            previousProducts.map((product) => {
                if (product.id !== productId) {
                    return product;
                }

                if (product.quantity <= 0) {
                    return product;
                }

                return {
                    ...product,
                    quantity: product.quantity - 1,
                };
            })
        );
    };

    //Carregamento
    if (isLoading) {
        return (
            <section className="mx-auto w-full max-w-7xl rounded-xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-600" aria-live="polite">
                    Carregando produtos...
                </p>
            </section>
        );
    }
    //tela de erro
    if (error) {
        return (
            <section
                className="mx-auto w-full max-w-7xl space-y-4 rounded-xl border border-red-200 bg-white p-6"
                role="alert"
            >
                <h2 className="text-xl font-bold text-slate-800">
                    Não foi possível carregar o dashboard
                </h2>

                <p className="text-sm text-red-700">{error}</p>

                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-lg bg-[#101d43] px-4 py-2 text-sm font-medium text-white"
                >
                    Tentar novamente
                </button>
            </section>
        );
    }
    return (
        <section className="mx-auto w-full max-w-7xl space-y-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Estoque de roupas
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Gerencie os produtos disponíveis na loja.
                    </p>
                </div>

                <span className="text-sm text-slate-500">
                    {products.length} produtos cadastrados
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                {/* Total de produtos */}
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
                    <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                        <Package size={24} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            Produtos cadastrados
                        </p>

                        <p className="text-2xl font-bold text-slate-800">
                            {products.length}
                        </p>
                    </div>
                </div>

                {/* Quantidade em estoque */}
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
                    <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                        <Boxes size={24} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            Peças em estoque
                        </p>

                        <p className="text-2xl font-bold text-slate-800">
                            {totalPieces}
                        </p>
                    </div>
                </div>

                {/* Produtos para reposição */}
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
                    <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
                        <AlertTriangle size={24} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            Produtos para reposição
                        </p>

                        <p className="text-2xl font-bold text-slate-800">
                            {productsToRestock}
                        </p>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Catálogo de produtos
                        </h2>
                        <p className="text-sm text-slate-500">
                            Consulte o estoque e registre as vendas.
                        </p>
                    </div>
                    <div className="relative w-full sm:max-w-sm">
                        <Search
                            size={19}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Buscar roupa ou categoria..."
                            aria-label="Buscar produtos"
                            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                {visibleProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {visibleProducts.map((product) => (
                            <article
                                key={product.id}
                                className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow duration-200 hover:shadow-md"
                            >
                                {/* Imagem do produto */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                    />

                                    <span
                                        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${product.quantity === 0
                                                ? "bg-red-100 text-red-700"
                                                : product.quantity <= 5
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-emerald-100 text-emerald-700"
                                            }`}
                                    >
                                        {product.quantity === 0
                                            ? "Sem estoque"
                                            : product.quantity <= 5
                                                ? "Estoque baixo"
                                                : "Disponível"}
                                    </span>
                                </div>

                                {/* Informações do produto */}
                                <div className="space-y-4 p-4">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            {product.category}
                                        </p>

                                        <h3 className="mt-1 text-lg font-semibold text-slate-800">
                                            {product.name}
                                        </h3>

                                        <p className="mt-1 text-xl font-bold text-slate-900">
                                            {formatCurrency(product.price)}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Quantidade disponível
                                            </p>

                                            <p className="text-lg font-semibold text-slate-800">
                                                {product.quantity}{" "}

                                                <span className="text-sm font-normal text-slate-500">
                                                    unidades
                                                </span>
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleSale(product.id)
                                            }
                                            disabled={product.quantity === 0}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#101d43] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#1c326b] disabled:cursor-not-allowed disabled:bg-slate-300"
                                        >
                                            <ShoppingCart size={16} />

                                            {product.quantity === 0
                                                ? "Esgotado"
                                                : "Registrar venda"}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
                        <Package
                            size={36}
                            className="mx-auto text-slate-400"
                        />

                        <p className="mt-3 font-semibold text-slate-700">
                            Nenhum produto encontrado
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            Tente buscar por outro nome ou categoria.
                        </p>
                    </div>
                )}

                {/* Paginação */}
                <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">

                    {/* Quantidade exibida */}
                    <p className="text-sm text-slate-500">
                        {filteredProducts.length === 0
                            ? "Nenhum produto para exibir"
                            : `Exibindo ${startIndex + 1}–${Math.min(
                                startIndex + PAGE_SIZE,
                                filteredProducts.length
                            )} de ${filteredProducts.length} produtos`}
                    </p>

                    <div className="flex items-center gap-2">

                        {/* Página anterior */}
                        <button
                            type="button"
                            onClick={() =>
                                goToPage(
                                    Math.max(1, currentPage - 1)
                                )
                            }
                            disabled={currentPage === 1}
                            aria-label="Página anterior"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {/* Números das páginas */}
                        {Array.from(
                            { length: totalPages },
                            (_, index) => index + 1
                        ).map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => goToPage(page)}
                                aria-current={
                                    currentPage === page
                                        ? "page"
                                        : undefined
                                }
                                className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition ${currentPage === page
                                        ? "bg-[#101d43] text-white"
                                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Próxima página */}
                        <button
                            type="button"
                            onClick={() =>
                                goToPage(
                                    Math.min(
                                        totalPages,
                                        currentPage + 1
                                    )
                                )
                            }
                            disabled={currentPage === totalPages}
                            aria-label="Próxima página"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}