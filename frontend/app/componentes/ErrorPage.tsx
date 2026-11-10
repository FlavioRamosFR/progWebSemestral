import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";

interface ErrorPageProps {
  code: string;
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  icon: LucideIcon;
  tone?: "amber" | "blue" | "red";
}

const tones = {
  amber: "bg-amber-50 text-amber-500",
  blue: "bg-blue-50 text-blue-600",
  red: "bg-red-50 text-red-600",
};

export default function ErrorPage({
  code,
  eyebrow,
  title,
  description,
  status,
  icon: Icon,
  tone = "amber",
}: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
        <div
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ${tones[tone]}`}
        >
          <Icon size={42} strokeWidth={1.8} />
        </div>

        {/* Código do erro */}
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-slate-500">
          {eyebrow}
        </p>

        <h1 className="text-7xl font-bold tracking-tight text-[#172b4d] sm:text-8xl">
          {code}
        </h1>

        {/* Mensagem */}
        <h2 className="mt-5 text-xl font-bold text-slate-800 sm:text-2xl">
          {title}
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
          {description}
        </p>

        {/* Informações do erro */}
        <div className="mt-7 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium text-slate-500">Código HTTP</p>

          <p className="mt-1 text-sm font-semibold text-slate-700">{status}</p>
        </div>

        {/* Botão de retorno */}
        <Link
          href="/rgr"
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 sm:w-auto"
        >
          <ArrowLeft size={17} />
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
