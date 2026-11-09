'use client'

import { useRouter } from "next/navigation";
import { useState } from "react"

export function LoginSection() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState('');
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            router.push('/rgr');
            router.refresh();
        } else {
            const data = await res.json();
            setErro(data.erro)
        }
    };



    return (
        <section className="section justify-center">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-blue-50 ">
                <div className="mb-8 text-center">
                    <h1 className="text-[clamp(30px,5vw,65px)] font-bold text-gray-800">
                        Login
                    </h1>

                    <p className="mt-2 text-[clamp(10px,5vw,16px)] text-gray-500">
                        Entre com sua conta para continuar
                    </p>
                </div>
                {erro && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                        {erro}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-5">
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="email"
                            className="text-[clamp(12px,5vw,16px)] font-medium text-gray-700"
                        >
                            E-mail
                        </label>
                        <input
                            id="email"
                            type="text"
                            placeholder="exemplo@gmail.com"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[clamp(12px,5vw,16px)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="password"
                            className="text-[clamp(12px,5vw,16px)] font-medium text-gray-700"
                        >
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[clamp(12px,5vw,16px)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </section>
    )

}