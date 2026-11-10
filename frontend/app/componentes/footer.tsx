export function Footer() {
  return (
    <footer className="flex shrink-0 items-center justify-center border-t border-slate-200 bg-white px-6 py-4">
      <p className="text-center text-sm text-slate-500">
        © {new Date().getFullYear()} RGR — Sistema de Estoque. Todos os direitos
        reservados.
      </p>
    </footer>
  );
}
