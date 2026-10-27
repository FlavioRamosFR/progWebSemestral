import Link from "next/link";

export default function home(){
    return(
        <main className="flex h-full flex-col items-center justify-center gap-10 px-6 md:flex-row md:gap-8 md:px-12 lg:px-16">
        <section className="w-full text-center md:w-1/2 md:text-left">
            <h1 className="mb-4 text-4xl font-extrabold text-slate-800 lg:text-5xl">
                Bem-vindo
            </h1>
            <p className="mb-7 max-w-md text-sm leading-6 text-slate-500 md:text-base">
                Seja bem-vindo ao sistema de estoque da Loja RGR. Clique no botão abaixo para visualizar mais opções e começar a utilizar o sistema.
            </p>
            <Link href={'/rgr/dashboard'}
               className="inline-flex items-center justify-center rounded-full bg-sky-500 px-10 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-200"
            > Ver mais opções </Link>
        </section>
        <section className="flex w-full items-center justify-center md:w-1/2">
            <img src="/imagens/estoque.png" alt="Funcionários organizando produtos no estoque" 
                className="h-auto w-full max-w-xl object-contain"/>
        </section>
    </main>
    )
}