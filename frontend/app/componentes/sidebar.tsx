
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
    Home,
    Users,
    FileTextIcon,
    ChevronLeft,
    LogOut,
    Shirt,
} from "lucide-react";
import { authService } from "@/services/auth/auth.service";
import { AlertDialogLogout } from "./AlertDialogLogout";

const menuItems = [
    { label: "Verificar Estoque", href: "/rgr/dashboard", icon: Home },
    { label: "Relatorio", href: "/rgr/export", icon: FileTextIcon },
    { label: "Fornecedor", href: "/rgr/provider", icon: Users },
    { label: "Cadastrar Produto", href: "/rgr/formProduct", icon: Shirt },
];

interface SidebarProps {
    onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [erroSair, setErroSair] = useState("");

    async function sair() {
        setErroSair("");

        try {
            await authService.sair();
            router.push("/login");
        } catch (erro) {
            setErroSair(erro instanceof Error ? erro.message : "Não foi possível sair.");
        }
    }

    return (
        <aside
            className="flex h-screen w-[250px] shrink-0
            flex-col border-r border-slate-200 bg-white"
        >
            {/* Logo */}
            <div className="flex h-24 shrink-0 items-center justify-between px-5">
                <Link
                    href="/"
                    aria-label="Página inicial"
                    className="flex items-center gap-3"
                >
                    <svg
                        viewBox="0 0 48 48"
                        className="h-11 w-11 shrink-0"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M24 3 39 18 45 24 30 39 24 45 9 30 3 24 18 9Z"
                            stroke="#101d43"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                        />

                        <path
                            d="M29 5 33 13 41 17 33 21 29 29 25 21 17 17 25 13Z"
                            fill="#101d43"
                        />
                    </svg>

                    <span className="text-[24px] font-extrabold tracking-tight text-[#101d43]">
                        RGR
                    </span>
                </Link>
            </div>

            {/* Navegação */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
                <ul className="flex flex-col gap-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        const active =
                            pathname === item.href ||
                            (item.href !== "/" &&
                                pathname.startsWith(`${item.href}/`));

                        return (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    aria-current={
                                        active ? "page" : undefined
                                    }
                                    className={`flex min-h-[56px] items-center
                                    gap-3 rounded-lg px-4
                                    transition-colors duration-200
                                    ${active
                                            ? "bg-blue-50 font-bold text-[#101d43]"
                                            : "font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                >
                                    <Icon
                                        size={23}
                                        strokeWidth={1.9}
                                        className="shrink-0"
                                    />

                                    <span className="whitespace-nowrap text-[15px]">
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Rodapé do menu */}
            <div className="shrink-0 border-t border-slate-200 px-5 py-4">
               <AlertDialogLogout />

                {erroSair && (
                    <p role="alert" className="mb-3 text-xs text-red-600">
                        {erroSair}
                    </p>
                )}

                <p className="text-xs text-slate-500">
                    Sistema de Estoque
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                    RGR
                </p>
            </div>
        </aside>
    );
}
