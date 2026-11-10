import { useEffect, useState } from "react";

import { ChevronLeft, Menu, ShieldCheck, UserRound } from "lucide-react";

import { authService, type UsuarioSessao } from "@/services/auth/auth.service";

interface NavbarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function Navbar({ sidebarOpen, toggleSidebar }: NavbarProps) {
  const [usuarioSessao, setUsuarioSessao] = useState<UsuarioSessao | null>(
    null,
  );

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const usuario = await authService.obterPerfil();

        setUsuarioSessao(usuario);
      } catch (erro) {
        console.error("Erro ao carregar usuário:", erro);
        setUsuarioSessao(null);
      }
    }

    carregarUsuario();
  }, []);

  const perfil = usuarioSessao?.perfil?.trim().toUpperCase() ?? "";

  const ehAdmin = perfil === "ADM" || perfil === "ADMIN";

  const ehFuncionario = perfil === "FUNCIONARIO" || perfil === "FUNCIONÁRIO";

  const nomePerfil = ehAdmin
    ? "Administrador"
    : ehFuncionario
      ? "Funcionário"
      : (usuarioSessao?.perfil ?? "Usuário");

  const IconePerfil = ehAdmin ? ShieldCheck : UserRound;

  const coresPerfil = ehAdmin
    ? "border-violet-200 bg-violet-50 text-violet-700"
    : ehFuncionario
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-gray-200 bg-gray-50 text-gray-700";

  return (
    <header className="flex h-16 items-center px-6">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "Recolher menu" : "Abrir menu"}
      >
        {sidebarOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
      </button>
      {/* Informações do usuário */}
      {usuarioSessao && (
        <div
          className={`ml-auto flex items-center gap-2 rounded-full border px-3 py-2 ${coresPerfil}`}
          role="status"
          aria-label={`${nomePerfil}. Usuário: ${usuarioSessao.nome}`}
          title={`${nomePerfil} - ${usuarioSessao.nome}`}
        >
          <IconePerfil size={19} className="shrink-0" aria-hidden="true" />

          <div className="hidden min-w-0 flex-col md:flex">
            <span className="text-sm font-semibold leading-tight">
              {nomePerfil}
            </span>

            <span className="hidden max-w-40 truncate text-xs opacity-75 lg:block">
              {usuarioSessao.nome}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
