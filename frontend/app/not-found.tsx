import { SearchX } from 'lucide-react';
import ErrorPage from './componentes/ErrorPage';

export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      eyebrow="Página não encontrada"
      title="Ops! Não encontramos essa página."
      description="A página que você está tentando acessar não existe, foi removida ou está temporariamente indisponível. Verifique o endereço e tente novamente."
      status="404 — Not Found"
      icon={SearchX}
      tone="amber"
    />
  );
}